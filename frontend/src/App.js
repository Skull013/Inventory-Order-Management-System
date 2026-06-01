import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Tracking from './components/Tracking';
import Login from './components/Login';

function AppContent({ isLoggedIn, userName, handleLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/products', label: 'Products' },
    { path: '/customers', label: 'Customers' },
    { path: '/orders', label: 'Orders' },
    { path: '/tracking', label: 'Activity Log' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">
            {sidebarOpen ? (
              <>
                <span className="logo-line1">Inventory</span>
                <span className="logo-line2">Management</span>
              </>
            ) : 'IM'}
          </h1>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              title={item.label}
            >
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-link logout-btn"
            title="Logout"
          >
            <span className="sidebar-label">Logout</span>
          </button>
          {sidebarOpen && (
            <div className="user-info">
              <span className="user-name">{userName}</span>
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-container">
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tracking" element={<Tracking />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const name = localStorage.getItem('userName');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      setUserName(name || 'User');
    }
  }, []);

  const handleLogin = () => {
    const name = localStorage.getItem('userName');
    setIsLoggedIn(true);
    setUserName(name || 'User');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName('');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppContent 
        isLoggedIn={isLoggedIn} 
        userName={userName} 
        handleLogout={handleLogout} 
      />
    </Router>
  );
}

export default App;
