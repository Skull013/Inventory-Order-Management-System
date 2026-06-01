import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h2 className="welcome-title">Welcome back, {userName}</h2>
        <p className="welcome-subtitle">Here's what's happening with your inventory today</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card-simple">
          <div className="stat-value-large">{stats?.total_products || 0}</div>
          <div className="stat-label-simple">Total Products</div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-value-large">{stats?.total_customers || 0}</div>
          <div className="stat-label-simple">Total Customers</div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-value-large">{stats?.total_orders || 0}</div>
          <div className="stat-label-simple">Total Orders</div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-value-large">$0</div>
          <div className="stat-label-simple">Total Revenue</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Revenue Over Time */}
        <div className="dashboard-card">
          <h3 className="card-title">Revenue Over Time</h3>
          <div className="card-content-empty">
            <p>No revenue data yet. Create some orders!</p>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="dashboard-card">
          <h3 className="card-title">Top Selling Products</h3>
          <div className="card-content-empty">
            <p>No sales data yet</p>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="dashboard-card">
          <h3 className="card-title">Orders by Status</h3>
          <div className="card-content-empty">
            <p>No order data yet</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="dashboard-card">
          <div className="card-header-with-badge">
            <h3 className="card-title">Low Stock Alerts</h3>
            <span className="badge-count">{stats?.low_stock_products?.length || 0} Items</span>
          </div>
          {stats?.low_stock_products && stats.low_stock_products.length > 0 ? (
            <div className="low-stock-list">
              {stats.low_stock_products.map((product) => (
                <div key={product.id} className="low-stock-item">
                  <div className="low-stock-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-sku">SKU: {product.sku}</div>
                  </div>
                  <div className="stock-quantity">{product.quantity} left</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-content-empty">
              <p>All products are well stocked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
