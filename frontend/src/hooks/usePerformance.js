import { useState, useEffect, useCallback } from 'react';

export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  });

  const measurePerformance = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime),
        memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0
      }));
    }
  }, []);

  const trackRender = useCallback((componentName, startTime) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime)
    }));
  }, []);

  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });
  }, []);

  const preloadCriticalResources = useCallback(() => {
    const criticalResources = [
      '/api/dashboard/stats',
      '/api/turfs',
      '/api/notifications/unread'
    ];

    criticalResources.forEach(url => {
      fetch(url, { method: 'HEAD' }).catch(() => {});
    });
  }, []);

  useEffect(() => {
    measurePerformance();
    optimizeImages();
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      setMetrics(prev => ({
        ...prev,
        networkRequests: prev.networkRequests + entries.length
      }));
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }, [measurePerformance, optimizeImages]);

  return {
    metrics,
    trackRender,
    preloadCriticalResources,
    optimizeImages
  };
};

export const withPerformanceTracking = (WrappedComponent) => {
  return function PerformanceTrackedComponent(props) {
    const { trackRender } = usePerformance();
    const startTime = performance.now();
    
    useEffect(() => {
      trackRender(WrappedComponent.name, startTime);
    }, [trackRender, startTime]);
    
    return <WrappedComponent {...props} />;
  };
};