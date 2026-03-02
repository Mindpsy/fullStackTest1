import api from '../../shared/api/axios';

export const clientsApi = {
  list: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  remove: (id) => api.delete(`/clients/${id}`),
  exportCsv: (params) =>
    api.get('/clients/export', { params, responseType: 'blob' }),
};
