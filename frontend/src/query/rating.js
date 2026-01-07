import api from "../api/client";


export async function getRating({ queryKey }) {
  const params = queryKey[1];
  const { mediaId, mediaType } = params;

  let url = `/rating/check/${mediaType}/${mediaId}`;
  const response = await api.get(url);
  return response.data;
}


export async function mutateRating({ rating, mediaId, mediaType, method }) {
  if (!['POST', 'PUT'].includes(method)) throw new Error("Invalid method!");

  const body = { ...rating, mediaId, mediaType };
  let response;
  const url = "/rating";
  if (method === 'POST') response = await api.post(url, body);
  else if (method === 'PUT') response = await api.put(url, body);
  return response.data;
}


export async function deleteRating({ mediaId, mediaType }) {
  const response = await api.delete(`/rating/${mediaType}/${mediaId}`);
  return response.data;
}
