import React from 'react'

const InfoCard = ({ title, value, isPositive, top3 }) => {
  const valueColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="relative hover:shadow-md border-neutral-300 bg-[#FAF9F4] rounded-md shadow-sm pl-10 h-auto min-h-[10rem] flex flex-col justify-center">
      <div className="text-lg font-semibold">{title}</div>
      <div className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</div>
      {top3 && (
        <ul className="absolute right-6 list-decimal list-inside flex flex-col justify-center text-gray-700 pr-10 leading-relaxed">
          {top3.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InfoCard;
