import React, {  } from 'react';

interface ButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}


const Button: React.FC<ButtonProps> = ({ onClick, children, disabled, className }) => {

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      if (onClick && typeof onClick === 'function') {
        onClick(event);
      }
    };
    
    const baseStyles = "bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring focus:ring-primary-light";
    const combinedClasses = `${baseStyles} ${className || ''}`;


  return (
    <button
        onClick={handleClick}
        disabled={disabled}
        className={combinedClasses}
      >
        {children}
      </button>
  );
};

export default Button;