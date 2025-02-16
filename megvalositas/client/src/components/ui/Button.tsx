import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button
      className={`w-full p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
