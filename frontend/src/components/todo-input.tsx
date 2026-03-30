import { useState } from 'react';

interface TodoInputProps {
  onAdd: (description: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const trimmed = description.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed);
    setDescription('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
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
  );
}
