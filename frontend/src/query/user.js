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
  const url = '/auth/google';
  const response = await api.post(url, credentials);
  const data = response.data;
  const { user, tokenExpire } = data;
  localStorage.setItem('WATCHIO_JWT_EXPIRY', tokenExpire);
  return user;
}