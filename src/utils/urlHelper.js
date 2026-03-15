// App origin: signup, login, dashboard (subdomain only). Override for staging via REACT_APP_APP_ORIGIN.
const APP_ORIGIN = (process.env.REACT_APP_APP_ORIGIN || 'https://app.appifyai.com').replace(/\/$/, '');

export const getAppUrl = (path = '') => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${APP_ORIGIN}${p}`;
};

export const getMarketingUrl = (path = '') => {
  return `https://appifyai.com${path}`;
};

export const getApiUrl = () => {
  return 'https://appify-ai-server.onrender.com';
};
