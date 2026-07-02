/**
 * TagInput.jsx
 *
 * Tag chip input — type a tag and press Enter or comma to add.
 * Click ✕ on a chip to remove it.
 *
 * Props:
 *   value:    string[]
 *   onChange: (tags: string[]) => void
 *   max:      number (default 10)
 */

import { useState, useRef } from 'react';

export default function TagInput({ value = [], onChange, max = 10 }) {
  const [input, setInput] = useState('');
  const inputRef          = useRef(null);

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      className="input-base flex flex-wrap gap-1.5 cursor-text min-h-[44px] items-start"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 font-mono text-xs text-accent bg-accent-dim border border-accent/30 px-2 py-0.5"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="text-accent/60 hover:text-accent leading-none"
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}

      {value.length < max && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? 'Add tags… (Enter or comma to add)' : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text placeholder:text-faint font-body"
        />
      )}

      {value.length >= max && (
        <span className="font-mono text-[10px] text-faint self-center ml-1">
          Max {max} tags
        </span>
      )}
    </div>
  );
}
