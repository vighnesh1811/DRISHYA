const API_BASE = '/api';

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (response.status === 204) return null;
  const payload = await response.json();
  if (!response.ok) {
    const validationMessage = Array.isArray(payload.errors)
      ? payload.errors.map((error) => error.msg).filter(Boolean).join(' ')
      : '';
    throw new Error(validationMessage || payload.message || 'Request failed');
  }
  return payload;
}

export const authApi = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data, admin = false) => request(`/auth/${admin ? 'admin/' : ''}login`, { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' })
};

export const equipmentApi = {
  list: (query = '') => request(`/equipment${query ? `?${query}` : ''}`),
  detail: (slug) => request(`/equipment/${encodeURIComponent(slug)}`),
  categories: () => request('/equipment/categories'),
  uploadImage: (file) => {
    const body = new FormData();
    body.append('image', file);
    return request('/equipment/image-upload', { method: 'POST', body, headers: {} });
  },
  create: (data) => request('/equipment', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archive: (id) => request(`/equipment/${id}`, { method: 'DELETE' })
};

export const bookingApi = {
  availability: (params) => request(`/bookings/availability?${new URLSearchParams(params)}`),
  create: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  mine: () => request('/bookings/mine')
};

export const adminApi = {
  bookings: () => request('/admin/bookings'),
  units: () => request('/admin/units'),
  createUnit: (data) => request('/admin/units', { method: 'POST', body: JSON.stringify(data) }),
  maintenance: (id, data) => request(`/admin/units/${id}/maintenance`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateBookingStatus: (id, status) => request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  handover: (id, data) => request(`/admin/bookings/${id}/handover`, { method: 'POST', body: JSON.stringify(data) }),
  returnBooking: (id, data) => request(`/admin/bookings/${id}/return`, { method: 'POST', body: JSON.stringify(data) })
};

export const phase5Api = {
  submitEnquiry: (data) => request('/enquiries', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: () => request('/dashboard'),
  updateProfile: (data) => request('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  overview: () => request('/admin/overview'),
  customers: () => request('/admin/customers'),
  reports: () => request('/admin/reports'),
  enquiries: () => request('/admin/enquiries'),
  updateEnquiry: (id, status) => request(`/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
};
