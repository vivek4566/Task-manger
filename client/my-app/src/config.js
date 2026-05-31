const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const config = {
  apiBase: API_BASE.replace(/\/$/, ''),
  socketUrl: (process.env.REACT_APP_SOCKET_URL || API_BASE).replace(/\/$/, ''),
  authApi: `${API_BASE.replace(/\/$/, '')}/api/auth`,
  taskApi: `${API_BASE.replace(/\/$/, '')}/api/task`,
  projectApi: `${API_BASE.replace(/\/$/, '')}/api/project`,
};
