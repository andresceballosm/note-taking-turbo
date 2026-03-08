import { CATEGORIES, type NoteCategory } from '@/lib/constants/categories';

export type Note = {
  id: number;
  user: number;
  user_email: string;
  title: string;
  content: string;
  category: NoteCategory;
  created_at: string;
  updated_at: string;
};

type NoteCardProps = {
  note: Note;
  className?: string;
};

function formatMonthDay(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today.getTime() - noteDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function isListContent(content: string): boolean {
  const lines = content.trim().split('\n').filter(line => line.trim());
  if (lines.length === 0) return false;

  // Check if at least 50% of lines start with list markers
  const listMarkers = lines.filter(line => {
    const trimmed = line.trim();
    return /^[-*•]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed);
  });

  return listMarkers.length >= Math.ceil(lines.length * 0.5);
}

function parseListItems(content: string): string[] {
  return content
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove list markers: -, *, •, or 1. 2) etc.
      return line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '');
    })
    .slice(0, 5); // Limit to 5 items for preview
}

export function NoteCardComponent({ note, className = '' }: NoteCardProps) {
  const style = CATEGORIES[note.category];
  const isList = isListContent(note.content);
  const listItems = isList ? parseListItems(note.content) : [];

  return (
    <article
      className={`box-border flex h-full min-h-[200px] w-full flex-col gap-3 rounded-xl border-3 p-4 shadow-md transition-shadow hover:shadow-lg ${className}`}
      style={{
        background: style.background,
        borderColor: style.border,
      }}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="font-['Inter'] font-bold text-black">
          {formatMonthDay(note.created_at)}
        </span>
        <span className="font-['Inter'] text-black">
          {note.category}
        </span>
      </div>

      <h3 className="overflow-hidden text-ellipsis font-['Inria_Serif'] text-xl font-bold leading-tight text-black line-clamp-2 sm:text-2xl">
        {note.title}
      </h3>

      {isList ? (
        <ul className="flex-1 overflow-hidden font-['Inter'] text-sm leading-relaxed text-black">
          {listItems.map((item, index) => (
            <li key={index} className="flex items-start gap-2 mb-1">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-black" />
              <span className="flex-1 overflow-hidden text-ellipsis line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex-1 overflow-hidden font-['Inter'] text-sm leading-relaxed text-black line-clamp-5">
          {note.content}
        </p>
      )}
    </article>
  );
}

