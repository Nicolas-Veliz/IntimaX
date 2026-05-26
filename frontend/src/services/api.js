import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Interceptor para agregar el token a todas las peticiones
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios de autenticación
export const login = (username, password) => API.post('/auth/login', { username, password });

// Servicios de habitaciones
export const getRooms = () => API.get('/rooms').then(res => res.data);
export const createRoom = (roomData) => API.post('/rooms', roomData).then(res => res.data);
export const updateRoom = (id, roomData) => API.put(`/rooms/${id}`, roomData).then(res => res.data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`).then(res => res.data);

// Servicios de turnos
export const createShift = (room_id, duration_hours) => API.post('/shifts', { room_id, duration_hours }).then(res => res.data);
export const registerPayment = (shift_id, payment_method) => API.put(`/shifts/${shift_id}/payment`, { payment_method }).then(res => res.data);
export const markCleaned = (room_id) => API.put(`/shifts/clean/${room_id}`, { cleaned_by: 1 }).then(res => res.data);
export const extendShift = (shift_id, extra_hours) => API.put(`/shifts/${shift_id}/extend`, { extra_hours }).then(res => res.data);
export const confirmNoShow = (shift_id) => API.put(`/shifts/${shift_id}/no-show`).then(res => res.data);

// Servicios de métricas
export const getTodayMetrics = () => API.get('/metrics/today').then(res => res.data);
export const getHourlyStats = () => API.get('/metrics/hourly').then(res => res.data);

//final del archivo
export const getUsers = () => API.get('/users').then(res => res.data);
export const createUser = (userData) => API.post('/users', userData).then(res => res.data);
export const updateUser = (id, userData) => API.put(`/users/${id}`, userData).then(res => res.data);
export const deleteUser = (id) => API.delete(`/users/${id}`).then(res => res.data);
export const getActivityReport = (params) => API.get('/users/activity', { params }).then(res => res.data);
export const registerLogout = () => API.post('/users/logout').then(res => res.data);