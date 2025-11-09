import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUserBusinesses, removeBusiness } from '../../redux/businesses';
import './BusinessManagement.css';

function BusinessManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userBusinesses = useSelector(state => state.businesses.userBusinesses);
  const user = useSelector(state => state.session.user);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadUserBusinesses = async () => {
      try {
        await dispatch(fetchCurrentUserBusinesses());
      } catch (error) {
        console.error('Error loading user businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserBusinesses();
  }, [dispatch, user, navigate]);

  const handleDeleteBusiness = async (businessId) => {
    try {
      await dispatch(removeBusiness(businessId));
      setDeleteModal(null);
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  const businessList = Object.values(userBusinesses);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="business-management-container">
        <div className="loading-container">
          <p>Loading your businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-management-container">
      <div className="management-header">
        <h1>My Businesses</h1>
        <p>Manage and view your business listings</p>
        <button 
          className="btn-primary"
          onClick={() => navigate('/businesses/new')}
        >
          ➕ Add New Business
        </button>
      </div>

      {businessList.length === 0 ? (
        <div className="no-businesses">
          <div className="no-businesses-content">
            <h3>No businesses yet</h3>
            <p>Share your business with the community by adding your first listing.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/businesses/new')}
            >
              Add Your First Business
            </button>
          </div>
        </div>
      ) : (
        <div className="businesses-grid">
          {businessList.map(business => (
            <div key={business.id} className="business-management-card">
              {business.previewImage && (
                <img 
                  src={business.previewImage} 
                  alt={business.name}
                  className="business-card-image"
                />
              )}
              
              <div className="business-card-content">
                <h3>{business.name}</h3>
                <p className="business-category">{business.category}</p>
                <p className="business-location">
                  📍 {business.city}, {business.state}
                </p>
                <p className="business-price">{business.priceRange}</p>
                
                <div className="business-stats">
                  <span className="rating">
                    ⭐ {business.avgRating ? business.avgRating.toFixed(1) : 'New'}
                  </span>
                  <span className="reviews">
                    {business.numReviews || 0} reviews
                  </span>
                </div>

                <div className="business-actions">
                  <button 
                    className="btn-view"
                    onClick={() => navigate(`/businesses/${business.id}`)}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => navigate(`/businesses/${business.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => setDeleteModal(business)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Business</h3>
            <p>
              Are you sure you want to delete &quot;{deleteModal.name}&quot;?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setDeleteModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteBusiness(deleteModal.id)}
              >
                Delete Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessManagement;