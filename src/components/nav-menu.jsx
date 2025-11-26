'use client'
import { memo } from 'react';
import ButtonC from './Custom-Button';

const Header = memo(({ onLoginClick }) => {
  return (
    <nav className='bg-secondary border-b-2 border-solid border-b-tertiary w-full h-20 sm:h-24'>
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center">
        <div className="flex items-center no-underline text-black text-2xl sm:text-3xl font-semibold">
          Financial Record
        </div>
        <div>
          <ButtonC texto="Login" largura="110px" altura="40px" onClick={onLoginClick} data-cy="header-login-button" />
        </div>
      </div>
    </nav>
  );
});

Header.displayName = 'Header';

export default Header;
