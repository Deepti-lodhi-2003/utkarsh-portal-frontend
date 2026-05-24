import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ────────────────────────────────────────────────
//  Request Interceptor – Attach token
// ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ────────────────────────────────────────────────
//  Response Interceptor – Handle 401 + refresh logic
// ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefresh } = data.data;

        localStorage.setItem('accessToken', accessToken);
        if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error(' Refresh failed:', refreshError);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        //  Check user role and redirect accordingly
        const role = localStorage.getItem('role');

        if (role === 'admin') {
          window.location.href = '/admin/login?session_expired=true';
        } else if (role === 'candidate') {
          window.location.href = '/login/candidate?session_expired=true';
        } else if (role === 'institution') {
          window.location.href = '/login/institution?session_expired=true';
        } else {
          window.location.href = '/?session_expired=true';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ────────────────────────────────────────────────
//  Helper for form-data requests
// ────────────────────────────────────────────────
const formApi = (url, data) =>
  api.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });

// ────────────────────────────────────────────────
//  1. AUTH API
// ────────────────────────────────────────────────
export const authAPI = {
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  registerCandidate: (data) => api.post('/auth/register/candidate', data),
  registerInstitution: (data) => api.post('/auth/register/institution', data),
  loginPassword: (data) => api.post('/auth/login', data),
  loginOtp: (data) => api.post('/auth/login-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  logout: () => api.post('/auth/logout').then(() => {
    localStorage.clear();
    window.location.href = '/';
  }),
};

// ────────────────────────────────────────────────
//  2. DASHBOARD API
// ────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard'),
};

// ────────────────────────────────────────────────
//  3. USERS API
// ────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  updateStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

// ────────────────────────────────────────────────
//  4. JOBS API
// ────────────────────────────────────────────────
export const jobsAPI = {
  // Public / Candidate
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  getBySlug: (slug) => api.get(`/jobs/${slug}`),
  apply: (id, formData) => formApi(`/jobs/${id}/apply`, formData),
  getSimilar: (id) => api.get(`/jobs/${id}/similar`),

  // Institution
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  changeStatus: (id, data) => api.patch(`/jobs/${id}/status`, data),
  uploadBanner: (id, formData) => api.post(`/jobs/${id}/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyJobs: (params) => api.get('/jobs/institution/my-jobs', { params }),

  // Admin
  getAllAdmin: (params) => api.get('/admin/jobs', { params }),
  getPending: (params) => api.get('/admin/jobs/pending', { params }),
  approve: (id) => api.patch(`/admin/jobs/${id}/approve`),
  reject: (id, data) => api.patch(`/admin/jobs/${id}/reject`, data),
  feature: (id, data) => api.patch(`/admin/jobs/${id}/feature`, data),
};

// ────────────────────────────────────────────────
//  5. INSTITUTIONS API
// ────────────────────────────────────────────────
export const institutionsAPI = {
  // Public
  getAll: (params) => api.get('/institutions', { params }),
  getById: (id) => api.get(`/institutions/${id}`),

  // Institution Owner
  getProfile: () => api.get('/institutions/profile'),
  updateProfile: (data) => api.put('/institutions/profile', data),
  uploadLogo: (formData) => formApi('/institutions/logo', formData),
  uploadCover: (formData) => formApi('/institutions/cover', formData),
  uploadGallery: (formData) => formApi('/institutions/gallery', formData),
  deleteGalleryImage: (id) => api.delete(`/institutions/gallery/${id}`),
  uploadDocument: (formData) => formApi('/institutions/documents', formData),
  getDashboardStats: () => api.get('/institutions/dashboard/stats'),

  // Admin
  getPending: (params) => api.get('/admin/institutions/pending', { params }),
  verify: (id) => api.patch(`/admin/institutions/${id}/verify`),
  adminUpdate: (id, data) => api.put(`/admin/institutions/${id}`, data),
  reject: (id, data) => api.patch(`/admin/institutions/${id}/reject`, data),
  delete: (id) => api.delete(`/institutions/${id}`),
};

// ────────────────────────────────────────────────
//  6. CANDIDATE API
// ────────────────────────────────────────────────
export const candidateAPI = {
  getProfile: () => api.get('/candidates/profile'),
  updateProfile: (data) => api.put('/candidates/profile', data),
  addEducation: (data) => api.post('/candidates/education', data),
  updateEducation: (id, data) => api.put(`/candidates/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/candidates/education/${id}`),
  addExperience: (data) => api.post('/candidates/experience', data),
  updateExperience: (id, data) => api.put(`/candidates/experience/${id}`, data),
  deleteExperience: (id) => api.delete(`/candidates/experience/${id}`),
  updateSkills: (data) => api.put('/candidates/skills', data),
  uploadResume: (formData) => formApi('/candidates/resume', formData),
  deleteResume: () => api.delete('/candidates/resume'),
  uploadAvatar: (formData) => formApi('/candidates/avatar', formData),
  getPublicProfile: (id) => api.get(`/candidates/${id}`),
};

// ────────────────────────────────────────────────
//  7. APPLICATIONS API
// ────────────────────────────────────────────────
export const applicationAPI = {
  // Candidate
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getDetails: (id) => api.get(`/applications/${id}`),
  withdraw: (id, data = {}) => api.post(`/applications/${id}/withdraw`, data),
  submitFeedback: (id, data) => api.post(`/applications/${id}/feedback`, data),

  // Institution
  getForJob: (jobId, params) => api.get(`/jobs/${jobId}/applications`, { params }),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  shortlist: (id, data = {}) => api.post(`/applications/${id}/shortlist`, data),
  scheduleInterview: (id, data) => api.post(`/applications/${id}/schedule-interview`, data),
  addInterviewFeedback: (id, data) => api.post(`/applications/${id}/interview-feedback`, data),
  makeOffer: (id, data) => api.post(`/applications/${id}/offer`, data),
  respondToOffer: (id, data) => api.post(`/applications/${id}/respond-offer`, data),
  addNote: (id, data) => api.post(`/applications/${id}/notes`, data),
  getInstitutionApplications: (params) => api.get('/applications/institution/applications', { params }),
};

// ────────────────────────────────────────────────
//  8. SERVICE REQUESTS API
// ────────────────────────────────────────────────
export const serviceRequestAPI = {
  create: (data) => api.post('/service-requests', data),
  getMyRequests: (params) => api.get('/service-requests/my-requests', { params }),
  getIncoming: (params) => api.get('/service-requests/incoming', { params }),
  updateStatus: (id, data) => api.patch(`/service-requests/${id}/status`, data),
};

// ────────────────────────────────────────────────
//  9. SEARCH API
// ────────────────────────────────────────────────
export const searchAPI = {
  global: (params) => api.get('/search', { params }),
  jobs: (params) => api.get('/search/jobs', { params }),
  candidates: (params) => api.get('/search/candidates', { params }),
  institutions: (params) => api.get('/search/institutions', { params }),
  trainings: (params) => api.get('/search/trainings', { params }),
  vendors: (params) => api.get('/search/vendors', { params }),
  suggestions: (q) => api.get(`/search/suggestions?q=${encodeURIComponent(q)}`),
  getTrending: (params) => api.get('/search/trending', { params }),
  getRecent: (params) => api.get('/search/recent', { params }),
  clearHistory: () => api.delete('/search/history'),
  getPopularCategories: () => api.get('/search/popular-categories'),
  getJobsByLocation: () => api.get('/search/jobs-by-location'),
  getJobsByIndustry: () => api.get('/search/jobs-by-industry'),
  getCandidatesByIndustry: () => api.get('/search/candidates-by-industry'),
};


// ────────────────────────────────────────────────
//  9. TRAININGS API
// ────────────────────────────────────────────────
export const trainingsAPI = {
  // Public
  getAll: (params) => api.get('/trainings', { params }),
  getById: (id) => api.get(`/trainings/${id}`),

  // Candidate
  enroll: (id) => api.post(`/trainings/${id}/enroll`),
  getMyEnrollments: (params) => api.get('/trainings/enrollments/my', { params }),

  // Institution
  create: (data) => api.post('/trainings', data),
  update: (id, data) => api.put(`/trainings/${id}`, data),
  delete: (id) => api.delete(`/trainings/${id}`),
  uploadBanner: (id, formData) =>
    api.post(`/trainings/${id}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyTrainings: (params) => api.get('/trainings/institution/my-trainings', { params }),
  getEnrollments: (id, params) => api.get(`/trainings/${id}/enrollments`, { params }),
  updateEnrollmentStatus: (enId, data) => api.patch(`/trainings/enrollments/${enId}/status`, data),
  issueCertificate: (enId, formData) =>
    api.post(`/trainings/enrollments/${enId}/certificate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Admin - COMPLETE CRUD + BANNER
  adminGetAll: (params) => api.get('/admin/trainings', { params }),
  adminGetById: (id) => api.get(`/admin/trainings/${id}`),
  adminCreate: (data) => api.post('/admin/trainings', data),
  adminUpdate: (id, data) => api.put(`/admin/trainings/${id}`, data),
  adminDelete: (id) => api.delete(`/admin/trainings/${id}`),
  adminUploadBanner: (id, formData) =>
    api.post(`/admin/trainings/${id}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  approve: (id) => api.patch(`/admin/trainings/${id}/approve`),
  updateStatus: (id, status) => api.patch(`/admin/trainings/${id}/status`, { status }),
};
// ────────────────────────────────────────────────
//  10. VENDORS API
// ────────────────────────────────────────────────
export const vendorAPI = {
  // Public
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  addReview: (id, data) => api.post(`/vendors/${id}/reviews`, data),
  getCategories: () => api.get('/vendors/categories'),

  // Vendor Owner
  getProfile: () => api.get('/vendors/profile'),
  updateProfile: (data) => api.post('/vendors/profile', data),
  addProduct: (formData) => formApi('/vendors/products', formData),
  updateProduct: (id, formData) =>
    api.put(`/vendors/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteProduct: (id) => api.delete(`/vendors/products/${id}`),
  addCertification: (formData) => formApi('/vendors/certifications', formData),
  deleteCertification: (id) => api.delete(`/vendors/certifications/${id}`),

  // Admin - Vendor Management
  adminGetAll: (params) => api.get('/admin/vendors', { params }),
  adminGetById: (id) => api.get(`/admin/vendors/${id}`),
  adminGetPending: (params) => api.get('/admin/vendors/pending', { params }),
  adminGetVerified: (params) => api.get('/admin/vendors/verified', { params }),
  adminVerify: (id) => api.patch(`/admin/vendors/${id}/verify`),
  adminReject: (id, data) => api.patch(`/admin/vendors/${id}/reject`, data),
  adminUpdate: (id, data) => api.put(`/admin/vendors/${id}`, data),
  adminDelete: (id) => api.delete(`/admin/vendors/${id}`),
  adminToggleStatus: (id) => api.patch(`/admin/vendors/${id}/toggle-status`),
};

// ────────────────────────────────────────────────
//  11. SETTINGS API
// ────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/admin/settings'),
};

// ────────────────────────────────────────────────
//  12. REPORTS API
// ────────────────────────────────────────────────
export const reportsAPI = {
  get: (params) => api.get('/admin/reports', { params }),
};

export default api;