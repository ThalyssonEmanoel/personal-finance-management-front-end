import React, { memo } from 'react'
import { useStableDimensions } from '@/hooks/usePerformanceOptimization';

const InfoCard = memo(({ title, value, isPositive, top3, ariaLabel }) => {
  const valueColor = isPositive ? 'text-green-600' : 'text-red-600';
  
  // Hook para dimensões estáveis e prevenção de layout shift
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '10rem' // Altura mínima consistente
  });

  return (
    <div 
      ref={elementRef}
      className="relative hover:shadow-md border-neutral-300 bg-[#FAF9F4] rounded-md shadow-sm pl-10 h-auto flex flex-col justify-center transition-shadow duration-200"
      style={{ minHeight: dimensions.minHeight }}
      role="article"
      aria-label={ariaLabel || `${title}: ${value}`}
      tabIndex="0"
    >
      <div 
        className="text-lg font-semibold"
        aria-level="3"
        role="heading"
      >
        {title}
      </div>
      <div 
        className={`mt-2 text-2xl font-bold ${valueColor}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </div>
      {top3 && (
        <div 
          className="absolute right-6 pr-10"
          aria-label="Top 3 categorias"
        >
          <ul className="list-decimal list-inside flex flex-col justify-center text-gray-700 leading-relaxed">
            {top3.map((item, idx) => (
              <li key={idx} role="listitem">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

export default InfoCard;
