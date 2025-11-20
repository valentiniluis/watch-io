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
  let messageComplement;
  switch (contentType) {
    case 'like':
      messageComplement = 'liked movies';
      break;
    case 'not interested':
      messageComplement = '"Not Interested" list';
      break;
    default:
      messageComplement = contentType;
      break;
  }
  return `Loading ${messageComplement}...`;
}


export function getMyAreaEmptyMessage(contentType) {
  let message;
  switch (contentType) {
    case 'watchlist':
      message = 'Your watchlist is empty.';
      break;
    case 'like':
      message = 'You have no liked movies yet.';
      break;
    case 'not interested':
      message = 'No movies added to the "Not Interested" list yet.';
      break;
    case 'ratings':
      message = 'No movie ratings yet!';
      break;
  }
  return message;
}


export const capitalize = str => (!str.length) ? "" : str.charAt(0).toUpperCase() + str.slice(1);