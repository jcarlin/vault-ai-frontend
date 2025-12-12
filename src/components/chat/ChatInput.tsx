import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function AttachmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800/50">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Message Vault AI...'}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 bg-transparent resize-none overflow-hidden',
          'focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'placeholder:text-zinc-500',
          'text-sm leading-relaxed text-zinc-100'
        )}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'text-zinc-500 hover:text-zinc-300',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <AttachmentIcon />
        </button>
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
