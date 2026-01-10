import api from "../api/client";
import { SERIES } from "../util/constants";

export async function getTvSeason({ queryKey }) {
  const [, params] = queryKey;
  const { seasonNumber, showId } = params;
  const url = `/${SERIES}/${showId}/seasons/${seasonNumber}`;
  const response = await api.get(url);
  return response.data;
}