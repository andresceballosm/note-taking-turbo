'use client';

import { AuthForm } from '@/components/auth-form.component';
import { SignupIcon } from '@/components/icons/SignupIcon';
import { login, signup } from '@/lib/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export default function SignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const signupMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await signup({ email, password });
      return login({ email, password });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/notes');
      router.refresh();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the account');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    signupMutation.mutate({ email, password });
  };

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <AuthForm
        title="Yay, New Friend!"
        buttonTitle={signupMutation.isPending ? 'Creating account...' : 'Sign Up'}
        footerText="We're already friends!"
        footerLink="/auth/login"
        heroIcon={<SignupIcon />}
        onSubmit={handleSubmit}
      />
    </>
  );
}
