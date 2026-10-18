const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('review_web_token');
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || data.detail || 'Network request failed.');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    loginWithGoogle: (payload) => request('/auth/google/', { method: 'POST', body: JSON.stringify(payload) }),
    getMe: () => request('/auth/me/'),
    updateProfile: (data) => request('/auth/me/', { method: 'PATCH', body: JSON.stringify(data) }),
    deleteAccount: () => request('/auth/me/', { method: 'DELETE' }),
    logout: () => request('/auth/logout/', { method: 'POST' }),
  },

  // Directory
  directory: {
    getCategories: () => request('/categories/'),
    getTowns: () => request('/towns/'),
    getLocalities: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/localities/${query ? `?${query}` : ''}`);
    },
    getEstablishments: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/establishments/${query ? `?${query}` : ''}`);
    },
    getEstablishmentDetail: (id) => request(`/establishments/${id}/`),
    suggestEstablishment: (data) => request('/establishment-suggestions/', { method: 'POST', body: JSON.stringify(data) }),
    getStats: () => request('/stats/'),
  },

  // Reviews
  reviews: {
    getEstablishmentReviews: (establishmentId, params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/establishments/${establishmentId}/reviews/${query ? `?${query}` : ''}`);
    },
    submitReview: (establishmentId, data) => request(`/establishments/${establishmentId}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateReview: (id, data) => request(`/reviews/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    deleteReview: (id) => request(`/reviews/${id}/`, { method: 'DELETE' }),
    reportReview: (id, data) => request(`/reviews/${id}/report/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getMyReviews: () => request('/auth/me/reviews/'),
  },

  // Verified Complaints
  complaints: {
    getChannels: (establishmentId) => request(`/establishments/${establishmentId}/complaint-channels/`),
  },

  // Admin & Moderation
  admin: {
    getDashboardOverview: () => request('/admin/dashboard/overview/'),
    getReportsQueue: (status = 'pending') => request(`/admin/moderation/reports/?status=${status}`),
    submitModerationDecision: (reportId, decision, notes = '') => request(`/admin/moderation/reports/${reportId}/decision/`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    }),
    getSuggestions: () => request('/establishment-suggestions/'),
    approveSuggestion: (id, notes = '') => request(`/establishment-suggestions/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
    uploadCSV: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/admin/establishments/csv-import/', {
        method: 'POST',
        body: formData,
      });
    },
    checkDuplicates: (name, town, address = '') => request('/admin/check-duplicates/', {
      method: 'POST',
      body: JSON.stringify({ name, town, address }),
    }),
  },
};
