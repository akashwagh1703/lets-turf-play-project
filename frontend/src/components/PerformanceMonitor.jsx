import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    errorRate: 0,
    uptime: 100
  });

  useEffect(() => {
    // Monitor performance metrics
    const startTime = performance.now();
    
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, pageLoadTime: Math.round(loadTime) }));
    });

    // Memory usage (if available)
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = performance.memory;
        const usage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
        setMetrics(prev => ({ ...prev, memoryUsage: usage }));
      };
      
      updateMemory();
      const memoryInterval = setInterval(updateMemory, 5000);
      return () => clearInterval(memoryInterval);
    }

    // API response time monitoring
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        setMetrics(prev => ({ 
          ...prev, 
          apiResponseTime: Math.round((prev.apiResponseTime + duration) / 2) 
        }));
        return response;
      } catch (error) {
        setMetrics(prev => ({ 
          ...prev, 
          errorRate: prev.errorRate + 1 
        }));
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value <= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (value <= thresholds.warning) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Performance Monitor
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(metrics.pageLoadTime, { good: 1000, warning: 3000 })}
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.pageLoadTime, { good: 1000, warning: 3000 })}`}>
            {metrics.pageLoadTime}ms
          </div>
          <div className="text-xs text-gray-500">Page Load</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(metrics.apiResponseTime, { good: 200, warning: 1000 })}
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.apiResponseTime, { good: 200, warning: 1000 })}`}>
            {metrics.apiResponseTime}ms
          </div>
          <div className="text-xs text-gray-500">API Response</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(metrics.memoryUsage, { good: 50, warning: 80 })}
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, { good: 50, warning: 80 })}`}>
            {metrics.memoryUsage}%
          </div>
          <div className="text-xs text-gray-500">Memory</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon(metrics.errorRate, { good: 0, warning: 5 })}
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.errorRate, { good: 0, warning: 5 })}`}>
            {metrics.errorRate}
          </div>
          <div className="text-xs text-gray-500">Errors</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {metrics.uptime}%
          </div>
          <div className="text-xs text-gray-500">Uptime</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;