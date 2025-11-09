// Action Types
const LOAD_BUSINESSES = 'businesses/LOAD_BUSINESSES';
const LOAD_BUSINESS_DETAILS = 'businesses/LOAD_BUSINESS_DETAILS';
const LOAD_CURRENT_USER_BUSINESSES = 'businesses/LOAD_CURRENT_USER_BUSINESSES';
const ADD_BUSINESS = 'businesses/ADD_BUSINESS';
const UPDATE_BUSINESS = 'businesses/UPDATE_BUSINESS';
const DELETE_BUSINESS = 'businesses/DELETE_BUSINESS';
const CLEAR_BUSINESSES = 'businesses/CLEAR_BUSINESSES';

// Action Creators
const loadBusinesses = (businesses, page, size) => ({
  type: LOAD_BUSINESSES,
  businesses,
  page,
  size
});

const loadBusinessDetails = (business) => ({
  type: LOAD_BUSINESS_DETAILS,
  business
});

const loadCurrentUserBusinesses = (businesses) => ({
  type: LOAD_CURRENT_USER_BUSINESSES,
  businesses
});

const addBusiness = (business) => ({
  type: ADD_BUSINESS,
  business
});

const updateBusiness = (business) => ({
  type: UPDATE_BUSINESS,
  business
});

const deleteBusiness = (businessId) => ({
  type: DELETE_BUSINESS,
  businessId
});

export const clearBusinesses = () => ({
  type: CLEAR_BUSINESSES
});

// Thunks
export const fetchAllBusinesses = (filters = {}) => async (dispatch) => {
  const { page = 1, size = 20, category, minRating, city, priceRange } = filters;
  
  let url = `/api/businesses?page=${page}&size=${size}`;
  if (category) url += `&category=${category}`;
  if (minRating) url += `&minRating=${minRating}`;
  if (city) url += `&city=${city}`;
  if (priceRange) url += `&priceRange=${priceRange}`;

  const response = await fetch(url);
  
  if (response.ok) {
    const data = await response.json();
    dispatch(loadBusinesses(data.Businesses, data.page, data.size));
    return data;
  }
};

export const fetchBusinessDetails = (businessId) => async (dispatch) => {
  const response = await fetch(`/api/businesses/${businessId}`);
  
  if (response.ok) {
    const business = await response.json();
    dispatch(loadBusinessDetails(business));
    return business;
  }
};

export const fetchCurrentUserBusinesses = () => async (dispatch) => {
  const response = await fetch('/api/businesses/current');
  
  if (response.ok) {
    const data = await response.json();
    dispatch(loadCurrentUserBusinesses(data.Businesses));
    return data;
  }
};

export const createBusiness = (businessData) => async (dispatch) => {
  const response = await fetch('/api/businesses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(businessData)
  });
  
  if (response.ok) {
    const business = await response.json();
    dispatch(addBusiness(business));
    return business;
  } else {
    const errors = await response.json();
    return { errors };
  }
};

export const editBusiness = (businessId, businessData) => async (dispatch) => {
  const response = await fetch(`/api/businesses/${businessId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(businessData)
  });
  
  if (response.ok) {
    const business = await response.json();
    dispatch(updateBusiness(business));
    return business;
  } else {
    const errors = await response.json();
    return { errors };
  }
};

export const removeBusiness = (businessId) => async (dispatch) => {
  const response = await fetch(`/api/businesses/${businessId}`, {
    method: 'DELETE'
  });
  
  if (response.ok) {
    dispatch(deleteBusiness(businessId));
    return { message: 'Successfully deleted' };
  }
};

export const addBusinessImage = (businessId, imageData) => async () => {
  const response = await fetch(`/api/businesses/${businessId}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(imageData)
  });
  
  if (response.ok) {
    const image = await response.json();
    return image;
  } else {
    const errors = await response.json();
    return { errors };
  }
};

export const deleteBusinessImage = (imageId) => async () => {
  const response = await fetch(`/api/business-images/${imageId}`, {
    method: 'DELETE'
  });
  
  if (response.ok) {
    return { success: true };
  } else {
    const errors = await response.json();
    return { errors };
  }
};

// Initial State
const initialState = {
  allBusinesses: {},
  singleBusiness: {},
  userBusinesses: {},
  page: 1,
  size: 20
};

// Reducer
const businessesReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_BUSINESSES: {
      const allBusinesses = {};
      action.businesses.forEach(business => {
        allBusinesses[business.id] = business;
      });
      return {
        ...state,
        allBusinesses,
        page: action.page,
        size: action.size
      };
    }
      
    case LOAD_BUSINESS_DETAILS:
      return {
        ...state,
        singleBusiness: { [action.business.id]: action.business }
      };
      
    case LOAD_CURRENT_USER_BUSINESSES: {
      const userBusinesses = {};
      action.businesses.forEach(business => {
        userBusinesses[business.id] = business;
      });
      return {
        ...state,
        userBusinesses
      };
    }
      
    case ADD_BUSINESS:
      return {
        ...state,
        allBusinesses: {
          ...state.allBusinesses,
          [action.business.id]: action.business
        },
        userBusinesses: {
          ...state.userBusinesses,
          [action.business.id]: action.business
        }
      };
      
    case UPDATE_BUSINESS:
      return {
        ...state,
        allBusinesses: {
          ...state.allBusinesses,
          [action.business.id]: action.business
        },
        userBusinesses: {
          ...state.userBusinesses,
          [action.business.id]: action.business
        },
        singleBusiness: {
          [action.business.id]: action.business
        }
      };
      
    case DELETE_BUSINESS: {
      const newAllBusinesses = { ...state.allBusinesses };
      const newUserBusinesses = { ...state.userBusinesses };
      const newSingleBusiness = { ...state.singleBusiness };
      
      delete newAllBusinesses[action.businessId];
      delete newUserBusinesses[action.businessId];
      delete newSingleBusiness[action.businessId];
      
      return {
        ...state,
        allBusinesses: newAllBusinesses,
        userBusinesses: newUserBusinesses,
        singleBusiness: newSingleBusiness
      };
    }
      
    case CLEAR_BUSINESSES:
      return initialState;
      
    default:
      return state;
  }
};

export default businessesReducer;