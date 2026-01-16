import api from "../api/client";


export async function getInteraction({ queryKey }) {
  const { mediaId, mediaType } = queryKey[1];
  if (!mediaId) throw new Error('Media ID must be provided.');
  if (!mediaType) throw new Error('Media type must be provided.');
  const response = await api.get(`/interaction/check/${mediaType}/${mediaId}`);
  return response.data;
}


export async function addInteraction({ type, mediaId, mediaType }) {
  const body = { mediaId, interactionType: type, mediaType };
  const response = await api.post('/interaction', body);
  return response.data;
}


export async function removeInteraction({ mediaId, mediaType }) {
  const response = await api.delete(`/interaction/${mediaType}/${mediaId}`);
  return response.data;
}