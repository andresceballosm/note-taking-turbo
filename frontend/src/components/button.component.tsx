'use client';

import React from 'react';

interface ButtonComponentProps {
  title: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  size?: 'note' | 'auth';
  className?: string;
}

export const ButtonComponent: React.FC<ButtonComponentProps> = ({
  title,
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  size = 'note',
  className = '',
}) => {
  const isDisabled = disabled || loading;
  const sizeClasses = size === 'auth' ? 'w-[384px] h-[43px]' : 'w-[133px] h-[43px]';

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`
        box-border
        flex
        flex-row
        justify-center
        items-center
        px-4
        py-3
        gap-[6px]
        ${sizeClasses}
        border
        border-[var(--login-stroke,#957139)]
        rounded-[46px]
        bg-transparent
        font-['Inter']
        font-bold
        text-[16px]
        leading-[19px]
        text-[var(--login-stroke,#957139)]
        transition-all
        duration-200
        ease-in-out
        hover:bg-[var(--login-stroke,#957139)]
        hover:text-[var(--login-bg,#faf1e3)]
        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:hover:bg-transparent
        disabled:hover:text-[var(--login-stroke,#957139)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {loading && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-spin"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      {!loading && icon}
      {title}
    </button>
  );
};
