'use client';

import { AuthForm } from '@/components/auth-form.component';
import { WelcomeIcon } from '@/components/icons/WelcomeIcon';
import { login } from '@/lib/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      const callbackUrl = searchParams.get('callbackUrl') || '/notes';
      router.push(callbackUrl);
      router.refresh();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An error occurred while signing in');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    loginMutation.mutate({ email, password });
  };

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <AuthForm
        title="Yay, You're Back!"
        buttonTitle={loginMutation.isPending ? 'Signing in...' : 'Login'}
        footerText="Oops! I've never been here before"
        footerLink="/auth/signup"
        heroIcon={<WelcomeIcon />}
        onSubmit={handleSubmit}
      />
    </>
  );
}
