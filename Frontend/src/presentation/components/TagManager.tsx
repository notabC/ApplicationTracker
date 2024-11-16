// src/presentation/components/TagManager/TagManager.tsx
import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Settings2, Check, Plus, X } from 'lucide-react';

interface Props {
  tags: string[];
  onTagsUpdate: (tags: string[]) => void;
  isCompact?: boolean;
}

export const TagManager: React.FC<Props> = observer(({
  tags,
  onTagsUpdate,
  isCompact = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onTagsUpdate([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    onTagsUpdate(tags.filter(tag => tag !== tagToDelete));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {!isCompact && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isEditing ? (
                <Check className="w-4 h-4 text-gray-400" />
              ) : (
                <Settings2 className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Tags
          </h3>
        </div>
        {isAdding ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New tag..."
              className="px-2 py-1 bg-gray-800 rounded-lg text-sm text-white placeholder-gray-500 w-24"
            />
            <button
              onClick={() => setIsAdding(false)}
              className="p-1 hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 hover:bg-gray-700 rounded-lg flex items-center gap-1 text-sm text-gray-400"
          >
            <Plus className="w-4 h-4" />
            {!isCompact && "Add tag"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <div
            key={tag}
            className="flex items-center"
          >
            <div
              className={`px-2 py-1 rounded-full text-sm transition-colors flex items-center gap-1
                bg-gray-800 text-gray-300 hover:bg-gray-700`}
            >
              {tag}
              {isEditing && (
                <button
                  onClick={() => handleDeleteTag(tag)}
                  className="ml-1 p-0.5 hover:bg-gray-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});