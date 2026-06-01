import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers();
      setCustomers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: numeric }));

      if (numeric.length > 0 && numeric.length < 10) {
        setPhoneError(`${10 - numeric.length} more digit(s) required`);
      } else if (numeric.length === 10 && !validatePhone(numeric)) {
        setPhoneError('Number must start with 6, 7, 8, or 9');
      } else {
        setPhoneError('');
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    try {
      await createCustomer(formData);
      setSuccess('Customer created successfully');
      setShowModal(false);
      setFormData({ full_name: '', email: '', phone: '' });
      setPhoneError('');
      fetchCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        setSuccess('Customer deleted successfully');
        fetchCustomers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete customer');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const openAddModal = () => {
    setFormData({ full_name: '', email: '', phone: '' });
    setPhoneError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ full_name: '', email: '', phone: '' });
    setPhoneError('');
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div>
      <div className="page-header-new">
        <div className="header-content">
          <div>
            <h2 className="page-title-new">Customers</h2>
            <p className="page-subtitle">Manage your customer database ({customers.length} customers)</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Customer
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3 className="empty-title">No customers yet</h3>
          <p className="empty-subtitle">Add your first customer to get started</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{customer.full_name}</span>
                      </div>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Customer</h3>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
                {phoneError && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    ⚠️ {phoneError}
                  </span>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!!phoneError || formData.phone.length !== 10}
                >
                  Create
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;