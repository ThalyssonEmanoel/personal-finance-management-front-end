'use client'
import '../styles/globals.css';
import Button from './Custom-Button';

const Header = ({ onLoginClick }) => {
  return (
    <nav className=' bg-secondary border-b-2 border-solid border-b-tertiary flex justify-between items-center w-full h-24'>
      <div className="flex items-center">
        <a href="/introduction" className="no-underline text-black text-3xl ml-20">
          Financial Record
        </a>
      </div>
      <div className='mr-20'>
        <Button texto="Login" largura="110px" altura="34px" onClick={onLoginClick} />
      </div>
    </nav>
  );
};

export default Header;
