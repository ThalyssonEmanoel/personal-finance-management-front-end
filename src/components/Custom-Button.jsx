import { memo } from 'react';

const ButtonC = memo(({ texto, largura, altura, onClick, dataTest = null, type = 'button', disabled = false, ariaLabel, dataCy, className = '', ...rest }) => {
  // Extract data-cy from rest props if it exists, otherwise use dataCy
  const finalDataCy = rest['data-cy'] || dataCy;
  
  return (
    <button
      type={type}
      onClick={onClick}
      data-test={dataTest}
      data-cy={finalDataCy}
      disabled={disabled}
      style={{ width: largura, height: altura }}
      className={`btn 
                  h-9 
                  border-2 rounded-sm border-neutral-300
                  text-black text-sm
                  hover:text-white hover:shadow-md hover:bg-brown
                  duration-200
                  cursor-pointer
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${className}`}
      aria-label={ariaLabel || texto}
    >
      {texto}
    </button>
  );
});

ButtonC.displayName = 'ButtonC';

export default ButtonC;
