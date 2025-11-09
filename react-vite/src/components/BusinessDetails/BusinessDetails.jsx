import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBusinessDetails, addBusinessImage, deleteBusinessImage } from '../../redux/businesses';
import { fetchBusinessReviews } from '../../redux/reviews';
import ReviewForm from '../ReviewForm';
import ImageModal from '../ImageModal';
import './BusinessDetails.css';

function BusinessDetails() {
  const { businessId } = useParams();
  const dispatch = useDispatch();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAddImageForm, setShowAddImageForm] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  const business = useSelector(state => state.businesses.singleBusiness[businessId]);
  const reviews = useSelector(state => 
    state.reviews.businessReviews[businessId] ? 
    Object.values(state.reviews.businessReviews[businessId]) : []
  );
  const user = useSelector(state => state.session.user);

  useEffect(() => {
    dispatch(fetchBusinessDetails(businessId));
    dispatch(fetchBusinessReviews(businessId));
  }, [dispatch, businessId]);

  if (!business) {
    return <div>Loading...</div>;
  }

  const userHasReview = user && reviews.some(review => review.userId === user.id);
  const canWriteReview = user && !userHasReview && user.id !== business.ownerId;
  const canAddImages = user; // Any logged in user can add images
  const isOwner = user && business && user.id === business.ownerId;

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      setImageError('Please enter an image URL');
      return;
    }

    try {
      const result = await dispatch(addBusinessImage(businessId, {
        url: newImageUrl,
        preview: false
      }));
      
      if (result && !result.errors) {
        setNewImageUrl('');
        setShowAddImageForm(false);
        setImageError('');
        // Refresh business details to show new image
        dispatch(fetchBusinessDetails(businessId));
      } else {
        setImageError('Failed to add image');
      }
    } catch (error) {
      setImageError('An error occurred while adding the image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const result = await dispatch(deleteBusinessImage(imageId));
      if (result && result.success) {
        // Refresh business details to remove deleted image
        dispatch(fetchBusinessDetails(businessId));
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      alert('An error occurred while deleting the image');
    }
  };

  return (
    <div className="business-details-container">
      <div className="business-header">
        <div className="business-images">
          <div className="images-header">
            <h3>Photos</h3>
            {canAddImages && (
              <button 
                className="add-image-btn"
                onClick={() => setShowAddImageForm(true)}
              >
                📷 Add Photo
              </button>
            )}
          </div>
          
          {business.BusinessImages && business.BusinessImages.length > 0 ? (
            <div className="image-gallery">
              {business.BusinessImages.map(image => (
                <div key={image.id} className="image-container">
                  <img 
                    src={image.url} 
                    alt={business.name}
                    className={image.preview ? 'preview-image' : 'gallery-image'}
                    onClick={() => setShowImageModal(true)}
                  />
                  {/* Show delete button for image owner or business owner */}
                  {(isOwner || (user && image.userId === user.id)) && (
                    <button 
                      className="delete-image-btn" 
                      title="Delete image"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-image">
              <p>No images available</p>
              {canAddImages && (
                <button 
                  className="add-first-image-btn"
                  onClick={() => setShowAddImageForm(true)}
                >
                  📷 Add the first photo
                </button>
              )}
            </div>
          )}
          
          {showAddImageForm && (
            <div className="add-image-form">
              <h4>Add a Photo</h4>
              <form onSubmit={handleAddImage}>
                <input
                  type="url"
                  placeholder="Enter image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  required
                />
                {imageError && <p className="error-text">{imageError}</p>}
                <div className="form-actions">
                  <button type="button" onClick={() => {
                    setShowAddImageForm(false);
                    setNewImageUrl('');
                    setImageError('');
                  }}>
                    Cancel
                  </button>
                  <button type="submit">Add Photo</button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        <div className="business-info">
          <h1>{business.name}</h1>
          <div className="business-rating">
            <span className="stars">
              {'★'.repeat(Math.floor(business.avgStarRating || 0))}
              {'☆'.repeat(5 - Math.floor(business.avgStarRating || 0))}
            </span>
            <span className="rating-text">
              {business.avgStarRating ? business.avgStarRating.toFixed(1) : 'New'} 
              ({business.numReviews} review{business.numReviews !== 1 ? 's' : ''})
            </span>
          </div>
          
          <p className="business-category">{business.category}</p>
          <p className="business-price-range">{business.priceRange}</p>
          
          <div className="business-location">
            <p>{business.address}</p>
            <p>{business.city}, {business.state} {business.zipCode}</p>
            <p>{business.country}</p>
          </div>
          
          <div className="business-description">
            <p>{business.description}</p>
          </div>
          
          {business.Owner && (
            <div className="business-owner">
              <p>Owner: {business.Owner.firstName} {business.Owner.lastName}</p>
            </div>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Reviews</h2>
          {canWriteReview && (
            <button 
              className="write-review-btn"
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <ReviewForm 
            businessId={businessId}
            onClose={() => setShowReviewForm(false)}
          />
        )}

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <h4>{review.User?.firstName} {review.User?.lastName}</h4>
                    <div className="review-rating">
                      <span className="stars">
                        {'★'.repeat(review.stars)}
                        {'☆'.repeat(5 - review.stars)}
                      </span>
                    </div>
                  </div>
                  <div className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="review-content">
                  <p>{review.review}</p>
                </div>
                
                {review.ReviewImages && review.ReviewImages.length > 0 && (
                  <div className="review-images">
                    {review.ReviewImages.map(image => (
                      <img 
                        key={image.id} 
                        src={image.url} 
                        alt="Review" 
                        className="review-image"
                      />
                    ))}
                  </div>
                )}
                
                {user && review.userId === user.id && (
                  <div className="review-actions">
                    <button className="edit-review-btn">Edit</button>
                    <button className="delete-review-btn">Delete</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      {showImageModal && business.BusinessImages && (
        <ImageModal
          images={business.BusinessImages}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          initialIndex={0}
        />
      )}
    </div>
  );
}

export default BusinessDetails;