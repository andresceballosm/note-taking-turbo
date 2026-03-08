'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { InputText } from '@/components/input.component';
import { ButtonComponent } from '@/components/button.component';
import { EyeIcon } from '@/components/icons/EyeIcon';

interface AuthFormProps {
  children?: ReactNode;
  title: string;
  buttonTitle: string;
  footerText: string;
  footerLink: string;
  heroIcon: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AuthForm({
  children,
  title,
  buttonTitle,
  footerText,
  footerLink,
  heroIcon,
  onSubmit,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <main className="min-h-svh grid place-items-center px-4 py-8 bg-[radial-gradient(circle_at_50%_10%,#fff6e9_0%,var(--login-bg)_50%)]">
      <section
        className="w-full max-w-[383px] flex flex-col items-center gap-[0.95rem]"
        aria-label={`${title.toLowerCase()} screen`}
      >
        <div
          aria-hidden="true"
        >
          {heroIcon}
        </div>

        {/* Title */}
        <h1 className="mt-1 mb-2 text-[clamp(1rem,2.1vw,1.2rem)] tracking-[0.18em] font-semibold text-center text-[var(--login-text)]">
          {title}
        </h1>

        {/* Form */}
        <form className="w-full flex flex-col gap-[0.78rem]" onSubmit={handleSubmit}>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <InputText
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
          />

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <InputText
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            required
            endAdornment={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="flex items-center justify-center w-[26px] h-[26px] border-0 rounded-full bg-transparent text-[var(--login-stroke)] p-0 cursor-pointer transition-opacity hover:opacity-70"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon className="w-full h-full" />
              </button>
            }
          />

          {children}

          <ButtonComponent title={buttonTitle} type="submit" size="auth" />
        </form>

        {/* Footer */}
        <Link
          href={footerLink}
          className="mt-1 text-[0.88rem] text-[var(--login-stroke)] underline underline-offset-[3px] hover:opacity-80 transition-opacity"
        >
          {footerText}
        </Link>
      </section>
    </main>
  );
}
