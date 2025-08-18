import PropTypes from 'prop-types';
import '../styles/globals.css';


const Button = ({ texto, largura, altura, onClick, dataTest = null }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      data-test={dataTest}
      style={{ width: largura, height: altura }}
      className="btn 
                  h-9 
                  border-2 rounded-sm border-neutral-400
                  text-black text-sm
                  hover:text-white hover:shadow-md hover:bg-brown
                  duration-200
                  cursor-pointer" >
      {texto}
    </button>
  );
};

Button.propTypes = {
  texto: PropTypes.string.isRequired,
  largura: PropTypes.string.isRequired, // Pode ser em px, %, rem, etc.
};

export default Button;
