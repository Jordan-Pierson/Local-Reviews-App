import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllBusinesses } from '../../redux/businesses';
import './BusinessList.css';

function BusinessList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const businesses = useSelector(state => state.businesses.allBusinesses);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    priceRange: '',
    minRating: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debounce the API call to avoid too many requests
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        await dispatch(fetchAllBusinesses(filters));
      } catch (err) {
        setError('Failed to load businesses. Please try again.');
        console.error('Error fetching businesses:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [dispatch, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      priceRange: '',
      minRating: ''
    });
  };

  const businessList = Object.values(businesses);

  return (
    <div className="business-list-container">
      <div className="filters-section">
        <h2>Filter Businesses</h2>
        <div className="filters">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Cafe">Cafe</option>
            <option value="Pizza">Pizza</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Bar">Bar</option>
          </select>

          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />

          <select
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          >
            <option value="">Any Price</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
            <option value="$$$$">$$$$</option>
          </select>

          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            placeholder="Min Rating"
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
          />

          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      <div className="businesses-section">
        <h1>Discover Great Places</h1>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading businesses...</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="business-cards">
            {businessList.length > 0 ? (
              businessList.map(business => (
                <div
                  key={business.id}
                  className="business-card"
                  onClick={() => navigate(`/businesses/${business.id}`)}
                >
                  {business.previewImage && (
                    <img 
                      src={business.previewImage} 
                      alt={business.name}
                      className="business-preview-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="business-info">
                    <h3>{business.name}</h3>
                    <p className="business-category">{business.category}</p>
                    <p className="business-location">{business.city}, {business.state}</p>
                    <p className="business-price-range">{business.priceRange}</p>
                    <div className="business-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(business.avgRating || 0))}
                        {'☆'.repeat(5 - Math.floor(business.avgRating || 0))}
                      </span>
                      <span className="rating-text">
                        {business.avgRating ? business.avgRating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>No businesses found</h3>
                <p>Try adjusting your filters or clear them to see all businesses.</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessList;