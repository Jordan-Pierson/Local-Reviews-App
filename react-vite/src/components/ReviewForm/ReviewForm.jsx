import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createReview } from '../../redux/reviews';
import './ReviewForm.css';

function ReviewForm({ businessId, onClose, review = null, onSubmit = null }) {
  const dispatch = useDispatch();
  const [reviewText, setReviewText] = useState(review ? review.review : '');
  const [stars, setStars] = useState(review ? review.stars : 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!review;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    if (!reviewText.trim()) {
      setErrors({ review: 'Review text is required' });
      setIsSubmitting(false);
      return;
    }

    if (stars < 1 || stars > 5) {
      setErrors({ stars: 'Please select a star rating' });
      setIsSubmitting(false);
      return;
    }

    const reviewData = {
      review: reviewText,
      stars: stars
    };

    try {
      let result;
      if (isEdit && onSubmit) {
        result = await onSubmit(reviewData);
      } else {
        result = await dispatch(createReview(businessId, reviewData));
      }

      if (result.errors) {
        setErrors(result.errors);
      } else {
        onClose();
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (rating) => {
    setStars(rating);
  };

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form-container">
        <div className="review-form-header">
          <h2>{isEdit ? 'Edit Review' : 'Write a Review'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((rating) => (
                <span
                  key={rating}
                  className={`star ${rating <= (hoveredStar || stars) ? 'active' : ''}`}
                  onClick={() => handleStarClick(rating)}
                  onMouseEnter={() => handleStarHover(rating)}
                  onMouseLeave={handleStarLeave}
                >
                  ★
                </span>
              ))}
            </div>
            {errors.stars && <p className="error">{errors.stars}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="review-text">Review</label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about your experience..."
              rows="6"
              maxLength="2000"
            />
            <div className="character-count">
              {reviewText.length}/2000 characters
            </div>
            {errors.review && <p className="error">{errors.review}</p>}
          </div>

          {errors.general && <p className="error">{errors.general}</p>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Submitting...' : (isEdit ? 'Update Review' : 'Post Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewForm;