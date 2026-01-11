import React, { useEffect, useState } from 'react';
import axios from '../config/axios';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [ratingStore, setRatingStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (search = '') => {
    try {
      const params = search ? `?name=${search}` : '';
      const response = await axios.get(`/user/stores${params}`);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStores(searchTerm);
  };

  const openRatingModal = (store) => {
    setRatingStore(store);
    setRatingValue(store.userRating || 0);
  };

  const submitRating = async () => {
    if (ratingValue < 1 || ratingValue > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }

    try {
      if (ratingStore.userRating) {
        await axios.patch(`/user/ratings/${ratingStore.id}`, { rating: ratingValue });
      } else {
        await axios.post('/user/ratings', { store_id: ratingStore.id, rating: ratingValue });
      }
      
      alert('Rating submitted successfully!');
      setRatingStore(null);
      setRatingValue(0);
      fetchStores(searchTerm);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit rating');
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Browse and Rate Stores</h2>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search stores by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchTerm('');
            fetchStores('');
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Reset
        </button>
      </div>

      {/* Store Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {stores.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
            No stores found
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {store.name}
              </h3>
              <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                📧 {store.email}
              </p>
              <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                📍 {store.address || 'No address provided'}
              </p>
              
              <div style={{
                margin: '15px 0',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Overall Rating:</strong>{' '}
                  <span style={{ color: '#ffc107', fontSize: '18px' }}>
                    {'⭐'.repeat(Math.round(store.avgRating))}
                  </span>{' '}
                  ({parseFloat(store.avgRating).toFixed(1)})
                </div>
                <div>
                  <strong>Total Ratings:</strong> {store.ratingCount}
                </div>
              </div>

              {store.userRating ? (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#d4edda',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}>
                  Your Rating: {'⭐'.repeat(store.userRating)} ({store.userRating}/5)
                </div>
              ) : null}

              <button
                onClick={() => openRatingModal(store)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: store.userRating ? '#17a2b8' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {store.userRating ? 'Update Rating' : 'Rate This Store'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Rating Modal */}
      {ratingStore && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Rate {ratingStore.name}</h3>
            
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <p style={{ marginBottom: '10px' }}>Select your rating:</p>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRatingValue(star)}
                    style={{
                      cursor: 'pointer',
                      color: star <= ratingValue ? '#ffc107' : '#ddd',
                      margin: '0 5px'
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                {ratingValue > 0 ? `${ratingValue} out of 5` : 'No rating selected'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={submitRating}
                disabled={ratingValue === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: ratingValue === 0 ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: ratingValue === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setRatingStore(null);
                  setRatingValue(0);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;