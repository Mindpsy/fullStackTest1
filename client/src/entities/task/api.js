import api from '../../shared/api/axios';

export const tasksApi = {
  list: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) =>
    api.patch(`/tasks/${id}/status`, { status }),
  remove: (id) => api.delete(`/tasks/${id}`),
  exportCsv: (params) =>
    api.get('/tasks/export', { params, responseType: 'blob' }),
};
