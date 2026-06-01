from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app import models, schemas
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    try:
        # Verify customer exists
        customer = db.query(models.Customer).filter(
            models.Customer.id == order.customer_id
        ).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Validate products and check inventory
        total_amount = 0
        order_items_data = []
        
        for item in order.items:
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).first()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found"
                )
            
            # Check if sufficient inventory
            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient inventory for product '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
                )
            
            # Calculate subtotal
            subtotal = product.price * item.quantity
            total_amount += subtotal
            
            order_items_data.append({
                'product': product,
                'quantity': item.quantity,
                'price_at_order': product.price,
                'subtotal': subtotal
            })
        
        # Create order
        db_order = models.Order(
            customer_id=order.customer_id,
            total_amount=total_amount
        )
        db.add(db_order)
        db.flush()  # Get order ID without committing
        
        # Create order items and reduce inventory
        for item_data in order_items_data:
            # Insert order item
            db.execute(
                text("""
                    INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
                    VALUES (:order_id, :product_id, :quantity, :price_at_order)
                """),
                {
                    'order_id': db_order.id,
                    'product_id': item_data['product'].id,
                    'quantity': item_data['quantity'],
                    'price_at_order': item_data['price_at_order']
                }
            )
            
            # Reduce product quantity
            item_data['product'].quantity -= item_data['quantity']
        
        db.commit()
        db.refresh(db_order)
        
        # Fetch order with items for response
        return get_order(db_order.id, db)
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=List[schemas.Order])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all orders"""
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    
    result = []
    for order in orders:
        order_items = db.execute(
            text("""
                SELECT oi.product_id, p.name as product_name, oi.quantity, 
                       oi.price_at_order, (oi.quantity * oi.price_at_order) as subtotal
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = :order_id
            """),
            {'order_id': order.id}
        ).fetchall()
        
        items = [
            schemas.OrderItemResponse(
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                price_at_order=item.price_at_order,
                subtotal=item.subtotal
            )
            for item in order_items
        ]
        
        result.append(schemas.Order(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.full_name,
            total_amount=order.total_amount,
            created_at=order.created_at,
            items=items
        ))
    
    return result

@router.get("/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details by ID"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Fetch order items
    order_items = db.execute(
        text("""
            SELECT oi.product_id, p.name as product_name, oi.quantity, 
                   oi.price_at_order, (oi.quantity * oi.price_at_order) as subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = :order_id
        """),
        {'order_id': order_id}
    ).fetchall()
    
    items = [
        schemas.OrderItemResponse(
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            price_at_order=item.price_at_order,
            subtotal=item.subtotal
        )
        for item in order_items
    ]
    
    return schemas.Order(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=items
    )

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/Delete an order"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    try:
        # Restore inventory before deleting order
        order_items = db.execute(
            text("""
                SELECT product_id, quantity
                FROM order_items
                WHERE order_id = :order_id
            """),
            {'order_id': order_id}
        ).fetchall()
        
        for item in order_items:
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).first()
            if product:
                product.quantity += item.quantity
        
        # Delete order items
        db.execute(
            text("DELETE FROM order_items WHERE order_id = :order_id"),
            {'order_id': order_id}
        )
        
        # Delete order
        db.delete(order)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    
    # Get low stock products (quantity < 10)
    low_stock_products = db.query(models.Product).filter(
        models.Product.quantity < 10
    ).all()
    
    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products
    )
