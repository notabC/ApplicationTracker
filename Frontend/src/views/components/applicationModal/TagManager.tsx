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
    <div className="w-full bg-[#1a1d24] p-4 rounded-xl border border-[#232732]/20 shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732] transition-all duration-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isCompact && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="
                p-2 bg-[#1a1d24] border border-[#232732]/20
                rounded-xl transition-all duration-200 group
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                hover:border-cyan-500/30 hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
              "
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
              className="
                px-3 py-2 bg-[#1a1d24] border border-[#232732]/20
                rounded-xl text-sm text-white placeholder-gray-500
                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                w-32 transition-all duration-200
              "
            />
            <button
              onClick={() => { setIsAdding(false); setNewTag(''); }}
              className="
                p-2 bg-[#1a1d24] border border-[#232732]/20 rounded-xl
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                hover:border-cyan-500/30
                transition-all duration-200
              "
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="
              flex items-center gap-2 px-3 py-2 
              bg-[#1a1d24] border border-[#232732]/20 rounded-xl
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              hover:border-cyan-500/30
              transition-all duration-200 group
            "
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
            className="
              flex items-center px-3 py-1.5 bg-[#1a1d24]
              border border-[#232732]/20 rounded-xl
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
              hover:border-cyan-500/30 hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
              transition-all duration-200 group
            "
          >
            <span className="text-sm text-gray-300">{tag}</span>
            {isEditing && (
              <button
                onClick={() => handleDeleteTag(tag)}
                className="
                  group-hover:bg-[#1a1d24] rounded-lg p-1 ml-2
                  transition-colors duration-200 border border-transparent
                  hover:border-cyan-500/30 hover:shadow-[2px_2px_4px_#111316,-2px_-2px_4px_#232732]
                "
              >
                <X className="w-3 h-3 text-gray-400 hover:text-gray-300" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});