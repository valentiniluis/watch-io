import { EMPTY_MY_AREA_MESSAGE, INTERACTION_BTN_CONTENT, LOADING_MY_AREA_MESSAGE, MOVIES, SERIES } from "./constants";

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}


export function getMyAreaLoadingMessage(contentType) {
  return LOADING_MY_AREA_MESSAGE[contentType];
}


export function getMyAreaEmptyMessage(contentType, mediaType) {
  const label = (mediaType === MOVIES) ? 'Movies' : (mediaType === SERIES) ? 'TV Shows' : 'Media';
  const templateFn = EMPTY_MY_AREA_MESSAGE[contentType];
  return templateFn(label);
}

export function getInteractionBtnContent(type, isActive) {
  const content = INTERACTION_BTN_CONTENT[type];
  if (!content) return null;

  const { style } = content;
  const { label, icon } = content.states[isActive];
  
  return { label, icon, style };
}

export const capitalize = str => (!str.length) ? "" : str.charAt(0).toUpperCase() + str.slice(1);


export function getSourceColor(source) {
  if (source === 'Internet Movie Database') return 'text-amber-400';
  else if (source === 'Rotten Tomatoes') return 'text-red-400';
  else if (source === 'Metacritic') return 'text-green-400';
  else if (source === 'TMDb') return 'text-violet-400';
  else return 'text-cyan-400';
};