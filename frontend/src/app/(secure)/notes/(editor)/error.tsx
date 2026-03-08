'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonComponent } from '@/components/button.component';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Note editor error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF1E3]">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-red-600"
          >
            <path
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="mb-2 font-['Inria_Serif'] text-[24px] font-bold text-black">
            Something went wrong
          </h2>
          <p className="font-['Inter'] text-[14px] text-gray-600">
            {error.message || 'An unexpected error occurred while loading the note'}
          </p>
        </div>

        <div className="flex w-full gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-lg border border-[#88642A] bg-transparent px-4 py-2 font-['Inter'] text-[14px] font-medium text-[#88642A] transition-colors hover:bg-[#88642A] hover:text-white"
          >
            Try again
          </button>
          <ButtonComponent
            title="Go back"
            onClick={() => router.push('/notes')}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
