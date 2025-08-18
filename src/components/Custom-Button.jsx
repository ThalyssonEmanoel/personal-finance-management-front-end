import PropTypes from 'prop-types';
import '../styles/globals.css';


const Button = ({ texto, largura, altura, onClick, dataTest = null, type = 'button', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      data-test={dataTest}
      disabled={disabled}
      style={{ width: largura, height: altura }}
      className={`btn 
                  h-9 
                  border-2 rounded-sm border-neutral-400
                  text-black text-sm
                  hover:text-white hover:shadow-md hover:bg-brown
                  duration-200
                  cursor-pointer
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} >
      {texto}
    </button>
  );
};

Button.propTypes = {
  texto: PropTypes.string.isRequired,
  largura: PropTypes.string.isRequired, 
  altura: PropTypes.string,
  onClick: PropTypes.func,
  dataTest: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
