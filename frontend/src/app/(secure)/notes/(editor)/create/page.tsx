import type { Metadata } from 'next';
import { NoteEditorComponent } from '@/components/note-editor.component';

export const metadata: Metadata = {
  title: 'Create Note',
  description: 'Create a new personal note',
};

export default function CreateNotePage() {
  return <NoteEditorComponent />;
}

