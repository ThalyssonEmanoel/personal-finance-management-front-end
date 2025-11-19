import React, { memo } from 'react'
import { useStableDimensions } from '@/hooks/usePerformanceOptimization';

const InfoCard = memo(({ title, value, isPositive, ariaLabel }) => {
  const valueColor = isPositive ? 'text-green-600' : 'text-red-600';
  
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '10rem' 
  });

  const dataCyMap = {
    'Saldo total': 'info-card-balance',
    'Receitas': 'info-card-income',
    'Despesas': 'info-card-expense'
  };

  return (
    <div 
      ref={elementRef}
      className="relative hover:shadow-md border-neutral-300 bg-[#FAF9F4] rounded-md shadow-sm pl-10 h-auto flex flex-col justify-center transition-shadow duration-200"
      style={{ minHeight: dimensions.minHeight }}
      role="article"
      aria-label={ariaLabel || `${title}: ${value}`}
      tabIndex="0"
      data-cy={dataCyMap[title] || 'info-card'}
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
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

export default InfoCard;
