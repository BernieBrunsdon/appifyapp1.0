// URL helper for production URLs only
export const getAppUrl = (path = '') => {
  return `https://app.appifyai.com${path}`;
};

export const getMarketingUrl = (path = '') => {
  return `https://appifyai.com${path}`;
};

export const getApiUrl = () => {
  return 'https://appify-ai-server.onrender.com';
};
