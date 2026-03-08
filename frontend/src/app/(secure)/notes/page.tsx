'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteCardComponent, type Note } from '@/components/note-card.component';
import { EmptyIcon } from '@/components/icons/EmptyIcon';
import { ButtonComponent } from '@/components/button.component';
import { useNotes } from '@/hooks/use-notes';
import { CATEGORIES } from '@/lib/constants/categories';

type CategoryFilter = 'All Categories' | Note['category'];

const categories: { name: CategoryFilter; color?: string }[] = [
  { name: 'All Categories' },
  { name: 'Random Thoughts', color: CATEGORIES['Random Thoughts'].color },
  { name: 'School', color: CATEGORIES.School.color },
  { name: 'Personal', color: CATEGORIES.Personal.color },
];

export default function NotesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All Categories');
  const { data: notes = [], isLoading } = useNotes();

  const filteredNotes: Note[] =
    selectedCategory === 'All Categories'
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  // Count notes per category
  const getCategoryCount = (categoryName: CategoryFilter) => {
    if (categoryName === 'All Categories') {
      return notes.length;
    }
    return notes.filter((note) => note.category === categoryName).length;
  };

  return (
    <main className="min-h-screen w-full bg-[#FAF1E3]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:gap-8 md:px-8 md:py-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 md:flex-shrink-0">
          <nav className="flex w-64 flex-col items-start p-0 md:mt-[66px]">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.name;
              const count = getCategoryCount(category.name);

              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex h-8 w-64 flex-row items-center gap-2 self-stretch px-4 py-4"
                  type="button"
                >
                  {category.color && (
                    <span
                      className="h-[11px] w-[11px] flex-shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`flex-grow text-left font-['Inter'] text-[12px] leading-[15px] text-black ${
                      isSelected ? 'font-bold' : 'font-normal'
                    }`}
                  >
                    {category.name}
                  </span>
                  <span className="flex-shrink-0 font-['Inter'] text-[12px] font-normal leading-[15px] text-black">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6 flex justify-end">
            <ButtonComponent
              title="New Note"
              onClick={() => router.push('/notes/create')}
              icon={(
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            />
          </div>

          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="font-['Inter'] text-lg text-[#88642A]">Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
              <EmptyIcon />
              <p className="max-w-md text-center font-['Inter'] text-xl text-[#88642A] md:text-xl">
                I&rsquo;m just here waiting for your charming notes...
              </p>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => router.push(`/notes/${note.id}`)}
                  className="text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  aria-label={`Open note ${note.title}`}
                >
                  <NoteCardComponent note={note} />
                </button>
              ))}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
