import api from '../api/request.js';


export async function fetchUser() {
  const response = await api.get('/user/current');
  const data = response.data;
  return data;
}


export async function authUser({ credentials }) {
  const backend_base_url = import.meta.env.VITE_BACKEND_BASE;
  const { data } = await api.post(backend_base_url + '/auth/google', credentials);
  const { user } = data;
  return user;
}