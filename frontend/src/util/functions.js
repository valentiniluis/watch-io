import { EMPTY_MY_AREA_MESSAGE, INTERACTION_BTN_CONTENT, LOADING_MY_AREA_MESSAGE } from "./constants";

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


export function getMyAreaEmptyMessage(contentType) {
  return EMPTY_MY_AREA_MESSAGE[contentType];
}

export function getInteractionBtnContent(type, isActive) {
  const content = INTERACTION_BTN_CONTENT[type];
  if (!content) return null;

  const { style } = content;
  const { label, icon } = content.states[isActive];
  
  return { label, icon, style };
}

export const capitalize = str => (!str.length) ? "" : str.charAt(0).toUpperCase() + str.slice(1);