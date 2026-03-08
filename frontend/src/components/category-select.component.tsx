'use client';

import { useEffect, useRef, useState } from 'react';

export type CategoryOption<T extends string> = {
  value: T;
  label: string;
  color: string;
};

type CategorySelectProps<T extends string> = {
  value: T;
  options: CategoryOption<T>[];
  onChange: (value: T) => void;
};

export function CategorySelectComponent<T extends string>({
  value,
  options,
  onChange,
}: CategorySelectProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-[225px]">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-[39px] w-[225px] items-center gap-2 rounded-[6px] border border-[#957139] bg-transparent px-[15px] py-[7px]"
      >
        <span className="h-[11px] w-[11px] rounded-full" style={{ backgroundColor: selected.color }} aria-hidden="true" />
        <span className="h-[15px] flex-grow text-left font-['Inter'] text-[12px] font-normal leading-[15px] text-black">
          {selected.label}
        </span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 9L12 16L19 9" stroke="#957139" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-[46px] z-20 flex h-[96px] w-[225px] flex-col items-start rounded-[8px] bg-[#FAF1E3] p-0">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex h-[32px] w-[225px] items-center gap-2 px-4 py-4 text-left"
            >
              <span className="h-[11px] w-[11px] rounded-full" style={{ backgroundColor: option.color }} aria-hidden="true" />
              <span className="h-[15px] flex-grow font-['Inter'] text-[12px] font-normal leading-[15px] text-black">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

