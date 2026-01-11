import React, { useEffect, useState } from 'react';
import axios from '../config/axios';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/owner/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          {error}
        </div>
      </div>
    );
  }

  const { store, avgRating, totalRatings, raters } = dashboardData;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Store Owner Dashboard</h2>

      {/* Store Info Card */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, color: '#007bff' }}>{store.name}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Email:</strong>
            <p style={{ margin: '5px 0' }}>{store.email}</p>
          </div>
          <div>
            <strong>Address:</strong>
            <p style={{ margin: '5px 0' }}>{store.address || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '25px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>Average Rating</h3>
          <div style={{ fontSize: '48px', margin: '10px 0' }}>
            {avgRating > 0 ? '⭐'.repeat(Math.round(avgRating)) : '☆☆☆☆☆'}
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#856404' }}>
            {avgRating} / 5.0
          </p>
        </div>

        <div style={{
          backgroundColor: '#d4edda',
          padding: '25px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>Total Ratings</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0', color: '#155724' }}>
            {totalRatings}
          </p>
          <p style={{ margin: 0, color: '#155724' }}>
            {totalRatings === 1 ? 'customer rating' : 'customer ratings'}
          </p>
        </div>
      </div>

      {/* Ratings Table */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Customer Ratings</h3>
        
        {raters.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No ratings yet</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
              Your store hasn't received any ratings from customers yet.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Customer Name
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Email
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                    Rating
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {raters.map((rater, index) => (
                  <tr key={rater.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{rater.name}</td>
                    <td style={{ padding: '12px' }}>{rater.email}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 15px',
                        backgroundColor: '#ffc107',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        color: '#000'
                      }}>
                        {'⭐'.repeat(rater.rating)} {rater.rating}/5
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(rater.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {totalRatings > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = raters.filter(r => r.rating === star).length;
            const percentage = (count / totalRatings) * 100;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ width: '60px', fontWeight: 'bold' }}>{star} ⭐</span>
                <div style={{
                  flex: 1,
                  height: '24px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  margin: '0 15px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: '#ffc107',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <span style={{ width: '60px', textAlign: 'right' }}>
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;