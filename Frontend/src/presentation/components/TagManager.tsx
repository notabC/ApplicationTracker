import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Settings2, Check, Plus, X, Tags } from 'lucide-react';

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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {!isCompact && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl 
                       transition-all duration-200 group"
            >
              {isEditing ? (
                <Check className="w-4 h-4 text-green-400 group-hover:text-green-300" />
              ) : (
                <Settings2 className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
              )}
            </button>
          )}
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-400">
              Tags
            </h3>
          </div>
        </div>
        {isAdding ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New tag..."
              className="px-3 py-2 bg-[#282c34] border border-gray-800/50
                       rounded-xl text-sm text-white placeholder-gray-500
                       focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                       transition-all duration-200 w-32"
            />
            <button
              onClick={() => setIsAdding(false)}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl
                       transition-all duration-200"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 
                     bg-gray-800/50 hover:bg-gray-700/50 rounded-xl
                     transition-all duration-200 group"
          >
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
            {!isCompact && (
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                Add tag
              </span>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <div
            key={tag}
            className="flex items-center"
          >
            <div className="px-3 py-1.5 bg-[#282c34] border border-gray-800/50
                          hover:bg-gray-800/50 hover:border-gray-700/50
                          rounded-xl transition-all duration-200 group">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">{tag}</span>
                {isEditing && (
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="group-hover:bg-gray-700/50 rounded-lg p-1 
                             transition-colors duration-200"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-gray-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});