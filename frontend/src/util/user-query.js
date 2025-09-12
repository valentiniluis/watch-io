import api from '../api/request.js';


export async function fetchUser() {
  try {
    const response = await api.get('/user/current');
    const data = response.data;
    return data;
  } catch {
    console.error("Consider authenticating!");
    return null;
  }
}


export async function authUser({ credentials }) {
  try {
    const backend_base_url = import.meta.env.VITE_BACKEND_BASE;
    const { data } = await api.post(backend_base_url + '/auth/google', credentials);
    const { user } = data;
    return user;
  } catch (err) {
    console.log(err);
    console.error('Failed to authenticate');
    return err;
  }
}