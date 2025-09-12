import { memo, useState, useEffect, useRef } from 'react';

/**
 * Hook para otimizar performance e evitar re-renders desnecessários
 */
export const usePerformanceOptimization = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, elementRef };
};

/**
 * Hook para prevenir layout shifts com dimensões estáveis
 */
export const useStableDimensions = (defaultDimensions = {}) => {
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const elementRef = useRef();

  useEffect(() => {
    if (elementRef.current) {
      const { width, height } = elementRef.current.getBoundingClientRect();
      setDimensions(prev => ({
        width: prev.width || width || 'auto',
        height: prev.height || height || 'auto',
        ...prev
      }));
    }
  }, []);

  return { dimensions, elementRef };
};

/**
 * HOC para memoização avançada de componentes
 */
export const withPerformanceOptimization = (Component) => {
  const OptimizedComponent = memo(Component, (prevProps, nextProps) => {
    // Comparação customizada para evitar re-renders desnecessários
    const keys = Object.keys(nextProps);
    for (const key of keys) {
      if (key === 'data' && Array.isArray(nextProps[key])) {
        if (JSON.stringify(prevProps[key]) !== JSON.stringify(nextProps[key])) {
          return false;
        }
      } else if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  });

  OptimizedComponent.displayName = `Optimized${Component.displayName || Component.name}`;
  return OptimizedComponent;
};
