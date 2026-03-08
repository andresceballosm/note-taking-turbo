import type { PropsWithChildren } from 'react';

export default function NotesEditorLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative min-h-[832px] w-full bg-[#FAF1E3]">
      <div className="relative mx-auto h-[832px] w-full max-w-[1280px]">
        <aside className="absolute left-[23px] top-[35px] h-[781px] w-[288px]" />
        {children}
      </div>
    </main>
  );
}
