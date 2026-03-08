'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createNote, updateNote, deleteNote } from '@/lib/api/notes';
import type { Note } from '@/components/note-card.component';
import type { NoteCategory } from '@/lib/constants/categories';

type CreateNotePayload = {
  title: string;
  content: string;
  category: NoteCategory;
};

type UpdateNotePayload = {
  id: number;
  data: Partial<CreateNotePayload>;
};

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) => createNote(payload),
    onMutate: async (newNote) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);

      // Optimistically update to the new value
      const optimisticNote: Note = {
        id: Date.now(), // Temporary ID
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: 0,
        user_email: '',
      };

      queryClient.setQueryData<Note[]>(['notes'], (old = []) => [
        optimisticNote,
        ...old,
      ]);

      return { previousNotes };
    },
    onError: (_err, _newNote, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push(`/notes/${data.id}`);
    },
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateNotePayload) => updateNote(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);

      // Optimistically update
      queryClient.setQueryData<Note[]>(['notes'], (old = []) =>
        old.map((note) =>
          note.id === id
            ? { ...note, ...data, updated_at: new Date().toISOString() }
            : note
        )
      );

      return { previousNotes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number | string) => deleteNote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);

      // Optimistically remove
      queryClient.setQueryData<Note[]>(['notes'], (old = []) =>
        old.filter((note) => note.id !== Number(id))
      );

      return { previousNotes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push('/notes');
    },
  });
}
