import React, { useState, useEffect } from 'react';
import { getOrders } from '../api';

function Tracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = (order) => {
    const daysSinceOrder = Math.floor(
      (new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceOrder === 0) return { status: 'Processing', color: '#3b82f6' };
    if (daysSinceOrder === 1) return { status: 'Shipped', color: '#f59e0b' };
    if (daysSinceOrder >= 2) return { status: 'Delivered', color: '#10b981' };
    return { status: 'Pending', color: '#6b7280' };
  };

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading tracking information...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Activity Log</h2>
      </div>

      <div className="card">
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.95rem' }}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <h3>No orders found</h3>
            <p>Try a different search term or create a new order</p>
          </div>
        ) : (
          <div className="tracking-list">
            {filteredOrders.map((order) => {
              const statusInfo = getOrderStatus(order);
              return (
                <div key={order.id} className="tracking-card">
                  <div className="tracking-header">
                    <div>
                      <h3 className="tracking-order-id">Order #{order.id}</h3>
                      <p className="tracking-customer">{order.customer_name}</p>
                    </div>
                    <div className="tracking-status" style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}>
                      {statusInfo.status}
                    </div>
                  </div>

                  <div className="tracking-details">
                    <div className="tracking-info">
                      <span className="tracking-label">Order Date:</span>
                      <span className="tracking-value">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="tracking-info">
                      <span className="tracking-label">Total Amount:</span>
                      <span className="tracking-value">${order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="tracking-info">
                      <span className="tracking-label">Items:</span>
                      <span className="tracking-value">{order.items?.length || 0} item(s)</span>
                    </div>
                  </div>

                  <div className="tracking-timeline">
                    <div className={`timeline-step ${statusInfo.status !== 'Pending' ? 'completed' : ''}`}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Order Placed</div>
                        <div className="timeline-time">
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className={`timeline-step ${statusInfo.status === 'Shipped' || statusInfo.status === 'Delivered' ? 'completed' : ''}`}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Shipped</div>
                        <div className="timeline-time">
                          {statusInfo.status === 'Shipped' || statusInfo.status === 'Delivered' ? 'In Transit' : 'Pending'}
                        </div>
                      </div>
                    </div>

                    <div className={`timeline-step ${statusInfo.status === 'Delivered' ? 'completed' : ''}`}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Delivered</div>
                        <div className="timeline-time">
                          {statusInfo.status === 'Delivered' ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tracking;
