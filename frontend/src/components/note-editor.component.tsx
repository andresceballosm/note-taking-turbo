'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CategorySelectComponent, type CategoryOption } from '@/components/category-select.component';
import { HeadPhoneIcon } from '@/components/icons/HeadPhoneIcon';
import { MicroIcon } from '@/components/icons/MicroIcon';
import { VolIcon } from '@/components/icons/VolIcon';
import { createNote, getNoteById, updateNote } from '@/lib/api/notes';
import { CATEGORIES, CATEGORY_OPTIONS as IMPORTED_CATEGORY_OPTIONS, AUTOSAVE_DEBOUNCE_MS, type NoteCategory } from '@/lib/constants/categories';

type EditableField = 'title' | 'content';

type NoteEditorComponentProps = {
  initialNoteId?: number;
};

const CATEGORY_OPTIONS: CategoryOption<NoteCategory>[] = IMPORTED_CATEGORY_OPTIONS;

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: {
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }[];
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionWindow = Window & {
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  SpeechRecognition?: new () => SpeechRecognitionLike;
};

function formatLastEdited(date: Date): string {
  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `Last Edited: ${datePart} at ${timePart.toLowerCase()}`;
}

export function NoteEditorComponent({ initialNoteId }: NoteEditorComponentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<NoteCategory>('Random Thoughts');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [activeField, setActiveField] = useState<EditableField>('title');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<number | null>(initialNoteId ?? null);
  const [saveState, setSaveState] = useState<'creating' | 'saving' | 'saved' | 'error'>(
    initialNoteId ? 'creating' : 'saved',
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const activeFieldRef = useRef<EditableField>('title');
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef<{ title: string; content: string; category: NoteCategory } | null>(null);

  const style = CATEGORIES[category];
  const lastEditedLabel = useMemo(() => formatLastEdited(updatedAt), [updatedAt]);

  useEffect(() => {
    activeFieldRef.current = activeField;
  }, [activeField]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Load existing note if editing
  useEffect(() => {
    if (!initialNoteId) return;

    let cancelled = false;

    async function loadExistingNote() {
      try {
        setSaveState('creating');
        setSaveError(null);

        const existing = await getNoteById(initialNoteId!);
        if (cancelled) return;
        if (!existing) {
          setSaveState('error');
          setSaveError('Could not load note');
          return;
        }

        setNoteId(existing.id);
        setTitle(existing.title ?? '');
        setContent(existing.content ?? '');
        setCategory(existing.category);
        setUpdatedAt(new Date(existing.updated_at));
        lastSavedSnapshotRef.current = {
          title: existing.title ?? '',
          content: existing.content ?? '',
          category: existing.category,
        };
        setSaveState('saved');
      } catch (error) {
        if (cancelled) return;
        setSaveState('error');
        setSaveError(error instanceof Error ? error.message : 'Could not load note');
      }
    }

    loadExistingNote();
    return () => {
      cancelled = true;
    };
  }, [initialNoteId]);

  // Lazy note creation - only create when user starts typing
  useEffect(() => {
    if (initialNoteId || noteId) return; // Don't create if editing or already created
    if (!title.trim() && !content.trim()) return; // Don't create until user types

    let cancelled = false;

    async function createNewNote() {
      try {
        setSaveState('creating');
        setSaveError(null);

        const created = await createNote({
          title: title.trim() || 'Untitled Note',
          content: content.trim() || ' ',
          category,
        });

        if (cancelled) return;

        setNoteId(created.id);
        setUpdatedAt(new Date(created.updated_at));
        lastSavedSnapshotRef.current = {
          title: created.title ?? '',
          content: created.content ?? '',
          category: created.category,
        };
        setSaveState('saved');
      } catch (error) {
        if (cancelled) return;
        setSaveState('error');
        setSaveError(error instanceof Error ? error.message : 'Could not create note');
      }
    }

    createNewNote();
    return () => {
      cancelled = true;
    };
  }, [title, content, initialNoteId, noteId, category]);

  function markEdited() {
    setUpdatedAt(new Date());
  }

  useEffect(() => {
    if (!noteId || saveState === 'creating') return;

    const hasContentToSave = title.trim().length > 0 && content.trim().length > 0;
    if (!hasContentToSave) return;

    const normalizedPayload = {
      title: title.trim() ? title : 'Untitled Note',
      content: content.trim() ? content : ' ',
      category,
    };

    const isSameAsLast =
      lastSavedSnapshotRef.current &&
      lastSavedSnapshotRef.current.title === normalizedPayload.title &&
      lastSavedSnapshotRef.current.content === normalizedPayload.content &&
      lastSavedSnapshotRef.current.category === normalizedPayload.category;

    if (isSameAsLast) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        setSaveState('saving');
        setSaveError(null);
        const updated = await updateNote(noteId, normalizedPayload);
        lastSavedSnapshotRef.current = {
          title: updated.title ?? '',
          content: updated.content ?? '',
          category: updated.category,
        };
        setUpdatedAt(new Date(updated.updated_at));
        setSaveState('saved');
      } catch (error) {
        setSaveState('error');
        setSaveError(error instanceof Error ? error.message : 'Could not autosave note');
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [title, content, category, noteId, saveState]);

  function appendTranscript(transcript: string) {
    const normalized = transcript.trim();
    if (!normalized) return;

    if (activeFieldRef.current === 'title') {
      setTitle((prev) => `${prev}${prev ? ' ' : ''}${normalized}`);
    } else {
      setContent((prev) => `${prev}${prev ? ' ' : ''}${normalized}`);
    }
    markEdited();
  }

  function startDictation() {
    if (isListening) return;

    const speechWindow = window as SpeechRecognitionWindow;
    const RecognitionCtor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    setSpeechError(null);

    if (!recognitionRef.current) {
      const recognition = new RecognitionCtor();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        appendTranscript(transcript);
      };
      recognition.onerror = () => {
        setSpeechError('Could not capture audio. Please check microphone permissions.');
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    if (activeFieldRef.current === 'title') titleRef.current?.focus();
    else contentRef.current?.focus();

    recognitionRef.current.start();
    setIsListening(true);
  }

  function stopDictation() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function handleClose() {
    // Cancel any pending autosave
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    // Force save if there are unsaved changes
    if (noteId && saveState !== 'creating') {
      const normalizedPayload = {
        title: title.trim() || 'Untitled Note',
        content: content.trim() || ' ',
        category,
      };

      const isSameAsLast =
        lastSavedSnapshotRef.current &&
        lastSavedSnapshotRef.current.title === normalizedPayload.title &&
        lastSavedSnapshotRef.current.content === normalizedPayload.content &&
        lastSavedSnapshotRef.current.category === normalizedPayload.category;

      if (!isSameAsLast && (title.trim() || content.trim())) {
        try {
          await updateNote(noteId, normalizedPayload);
        } catch (error) {
          console.error('Failed to save before closing:', error);
        }
      }
    }

    // Invalidate React Query cache to force refetch
    await queryClient.invalidateQueries({ queryKey: ['notes'] });

    // Navigate to notes page
    router.push('/notes');
  }

  return (
    <>
      <div className="absolute left-[37px] top-[33px] w-[225px]">
        <CategorySelectComponent
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={(nextCategory) => {
            setCategory(nextCategory);
            markEdited();
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="absolute left-[1212px] top-[33px] h-[24px] w-[24px] text-[#957139]"
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <section
        className="absolute left-[37px] top-[84px] box-border flex h-[700px] w-[1199px] flex-col items-start gap-6 rounded-[11px] border-[3px] px-16 pb-16 pt-[39px] shadow-[1px_1px_2px_rgba(0,0,0,0.25)]"
        style={{ background: style.background, borderColor: style.border }}
      >
        <p className="h-[15px] w-[1060px] text-right font-['Inter'] text-[12px] font-normal leading-[15px] text-black">
          {lastEditedLabel}
        </p>

        {saveState === 'error' && (
          <p className="h-[15px] w-[1060px] text-right font-['Inter'] text-[12px] font-normal leading-[15px] text-[#8B0000]">
            {saveError ?? 'Autosave failed'}
          </p>
        )}

        <input
          ref={titleRef}
          value={title}
          placeholder="Note Title"
          onFocus={() => setActiveField('title')}
          onChange={(event) => {
            setTitle(event.target.value);
            markEdited();
          }}
          className="h-[29px] w-[1066px] border-none bg-transparent font-['Inria_Serif'] text-[24px] font-bold leading-[29px] text-black outline-none placeholder:text-black/60"
        />

        <textarea
          ref={contentRef}
          value={content}
          placeholder="Pour your heart out.."
          onFocus={() => setActiveField('content')}
          onChange={(event) => {
            setContent(event.target.value);
            markEdited();
          }}
          className="h-[500px] w-[1066px] resize-none border-none bg-transparent font-['Inter'] text-[16px] font-normal leading-[27px] text-black outline-none placeholder:text-black/60"
        />
      </section>

      {!isListening ? (
        <button
          type="button"
          onClick={startDictation}
          className="absolute left-[1155px] top-[707px] box-border flex h-[57px] w-[57px] items-center justify-center rounded-[32px] border border-[#2C2C2C] bg-[#2C2C2C]"
          aria-label="Start dictation"
        >
          <HeadPhoneIcon className="h-5 w-5" />
        </button>
      ) : (
        <div
          className="absolute left-[961px] top-[707px] box-border flex h-[57px] w-[251px] items-center justify-between rounded-[32px] border border-[#2C2C2C] p-3"
          style={{ backgroundColor: style.border }}
        >
          <button
            type="button"
            onClick={stopDictation}
            className="flex items-center justify-center"
            aria-label="Stop dictation"
          >
            <MicroIcon className="h-15 w-15" />
          </button>

          <div className="flex items-center gap-2" aria-hidden="true">
            <div className="flex items-center" aria-hidden="true">
              <VolIcon className="h-5 w-5" />
              <VolIcon className="h-5 w-5" />
            </div>
            <HeadPhoneIcon className="h-5 w-5" />
          </div>
        </div>
      )}

      {speechError && (
        <p className="absolute left-[830px] top-[674px] w-[320px] text-right font-['Inter'] text-[12px] leading-[15px] text-[#8B0000]">
          {speechError}
        </p>
      )}
    </>
  );
}
