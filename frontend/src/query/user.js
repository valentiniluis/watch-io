import api from "../api/client";


export const getMyAreaContent = async ({ queryKey }) => {
  const [mainKey, params] = queryKey;
  const { mediaType } = params;
  let url = `/${mainKey}/${mediaType}`;

  // filter entries that have non-null/non-undefined values
  const queryParams = Object.entries(params).filter(([key, value]) => key !== 'mediaType' && value);

  if (queryParams.length > 0) {
    const queryString = queryParams.map(([key, value]) => `${key}=${value}`).join('&');
    url += '?' + queryString;
  }
  const response = await api.get(url);
  return response.data;
}


export async function fetchUser() {
  const response = await api.get('/user/current');
  const data = response.data;
  return data;
}


export async function authUser({ credentials }) {
  const backend_base_url = import.meta.env.VITE_BACKEND_BASE;
  const { data } = await api.post(backend_base_url + '/auth/google', credentials);
  const { user, tokenExpire } = data;
  localStorage.setItem('WATCHIO_JWT_EXPIRY', tokenExpire);
  return user;
}