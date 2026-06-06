/**
 * Classify API errors for friendly UI messaging.
 * @returns {'network' | 'gemini' | 'generic'}
 */
export const classifyApiError = (error) => {
  if (!error) return 'generic';
  if (!error.response && error.request) return 'network';
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'network';
  }

  const message = (
    error.response?.data?.message ||
    error.message ||
    ''
  ).toLowerCase();

  if (
    message.includes('gemini') ||
    message.includes('generative') ||
    message.includes('ai service') ||
    message.includes('api key') ||
    (message.includes('roadmap') && message.includes('generat')) ||
    message.includes('assessment') && message.includes('generat')
  ) {
    return 'gemini';
  }

  return 'generic';
};

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (classifyApiError(error) === 'network') {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  if (classifyApiError(error) === 'gemini') {
    return 'Our AI service is temporarily unavailable. A fallback may still complete your request—try again in a moment.';
  }
  return error?.response?.data?.message || error?.message || fallback;
};
