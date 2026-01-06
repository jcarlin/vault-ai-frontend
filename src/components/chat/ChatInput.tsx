import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockModels, type Model } from '@/mocks/models';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedModel?: Model;
  onModelChange?: (model: Model) => void;
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

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}


function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChatInput({ onSend, disabled, placeholder, selectedModel, onModelChange }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableModels = mockModels.filter(m => m.status === 'ready');
  const currentModel = selectedModel || availableModels.find(m => m.isDefault) || availableModels[0];

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

  const handleModelSelect = (model: Model) => {
    onModelChange?.(model);
    setShowModelPicker(false);
  };

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-card/80 border border-border">
      {/* Model selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowModelPicker(!showModelPicker)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 h-8 px-2.5 rounded-lg transition-colors',
            'bg-secondary/50 border border-border',
            'text-muted-foreground hover:text-foreground hover:bg-secondary',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Coins className="h-4 w-4" />
          <span className="text-xs font-medium max-w-[80px] truncate hidden sm:block">
            {currentModel?.displayName || 'Select'}
          </span>
          <ChevronDownIcon />
        </button>

        {showModelPicker && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowModelPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 w-56 bg-secondary border border-border rounded-lg shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-muted-foreground">Select Model</p>
              </div>
              <div className="max-h-64 overflow-auto py-1">
                {availableModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                      model.id === currentModel?.id
                        ? 'bg-card/50 text-foreground'
                        : 'text-foreground/80 hover:bg-card/30'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{model.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{model.parameters}</p>
                    </div>
                    {model.id === currentModel?.id && (
                      <span className="text-primary">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Message Vault AI Systems...'}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 bg-transparent resize-none overflow-hidden',
          'focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'placeholder:text-muted-foreground',
          'text-sm leading-relaxed text-foreground'
        )}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'text-muted-foreground hover:text-foreground/80',
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
            value.trim()
              ? 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25'
              : 'text-muted-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
