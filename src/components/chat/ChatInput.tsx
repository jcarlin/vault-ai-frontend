import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Coins, ChevronDown, Check, Paperclip, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelInfo } from '@/types/api';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
  placeholder?: string;
  models?: ModelInfo[];
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}

export function ChatInput({ onSend, disabled, disabledMessage, placeholder, models = [], selectedModelId, onModelChange }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentModel = models.find(m => m.id === selectedModelId) || models[0];

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

  const handleModelSelect = (model: ModelInfo) => {
    onModelChange?.(model.id);
    setShowModelPicker(false);
  };

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border">
      {/* Model selector */}
      {models.length > 0 && (
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
            aria-label="Select model"
          >
            <Coins className="h-4 w-4" />
            <span className="text-xs font-medium max-w-[80px] truncate hidden sm:block">
              {currentModel?.name || 'Select'}
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
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
                  {models.map((model) => (
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
                        <p className="text-sm font-medium truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{model.parameters ?? ''}</p>
                      </div>
                      {model.id === currentModel?.id && (
                        <span className="text-blue-500">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabledMessage && disabled ? disabledMessage : (placeholder || 'Message Vault AI Systems...')}
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
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
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
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
