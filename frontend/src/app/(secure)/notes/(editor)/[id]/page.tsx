import type { Metadata } from 'next';
import { NoteEditorComponent } from '@/components/note-editor.component';
import { getNoteById } from '@/lib/api/notes';

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const note = await getNoteById(id);

    if (!note) {
      return {
        title: 'Note Not Found',
        description: 'The requested note could not be found',
      };
    }

    const description = note.content.length > 160
      ? `${note.content.slice(0, 157)}...`
      : note.content;

    return {
      title: note.title || 'Untitled Note',
      description: description || 'A personal note',
    };
  } catch {
    return {
      title: 'Edit Note',
      description: 'Edit your personal note',
    };
  }
}

export default async function NoteDetailPage({ params }: NotePageProps) {
  const { id } = await params;
  return <NoteEditorComponent initialNoteId={Number(id)} />;
}

