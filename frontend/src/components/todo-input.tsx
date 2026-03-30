import { useState } from 'react';
import { MAX_DESCRIPTION_LENGTH } from '../api/todo-api';

interface TodoInputProps {
  onAdd: (description: string) => void;
  serverError?: string | null;
  onClearServerError?: () => void;
}

export function TodoInput({ onAdd, serverError, onClearServerError }: TodoInputProps) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = description.trim();
    if (trimmed.length === 0) {
      setError('Description cannot be empty');
      return;
    }
    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      setError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
      return;
    }
    setError(null);
    onClearServerError?.();
    onAdd(trimmed);
    setDescription('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const trimmedLength = description.trim().length;
  const displayError = error || serverError;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
      <div className="flex justify-between items-center">
        {displayError && (
          <p className="text-sm text-red-500">{displayError}</p>
        )}
        <p className={`text-sm ml-auto ${trimmedLength > MAX_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
          {trimmedLength} / {MAX_DESCRIPTION_LENGTH}
        </p>
      </div>
    </div>
  );
}
