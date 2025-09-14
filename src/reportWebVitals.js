const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry, { reportAllChanges: true });
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry, { reportAllChanges: true });
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
