'use client'
import { memo } from 'react';
import ButtonC from './Custom-Button';

const Header = memo(({ onLoginClick }) => {
  return (
    <nav className='bg-secondary border-b-2 border-solid border-b-tertiary flex justify-between items-center w-full h-24'>
      <div className="flex items-center no-underline text-black text-3xl font-semibold ml-[184px]">
          Financial Record
      </div>
      <div className='mr-[184px]'>
        <ButtonC texto="Login" largura="110px" altura="40px" onClick={onLoginClick} data-cy="header-login-button" />
      </div>
    </nav>
  );
});

Header.displayName = 'Header';

export default Header;
