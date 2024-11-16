// src/presentation/components/ApplicationCard/ApplicationCard.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, ChevronDown, Clock } from 'lucide-react';
import { Application } from '@/core/domain/models/Application';

interface Props {
  application: Application;
  onStageChange: (applicationId: string, newStage: string) => void;
  onClick: () => void;
}

export const ApplicationCard: React.FC<Props> = observer(({ 
  application, 
  onStageChange, 
  onClick 
}) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      frontend: 'bg-blue-900 text-blue-200',
      backend: 'bg-green-900 text-green-200',
      fullstack: 'bg-purple-900 text-purple-200',
    };
    return colors[type] || 'bg-gray-800 text-gray-200';
  };

  return (
    <div
      className="bg-gray-750 p-4 rounded-lg border border-gray-700 hover:bg-gray-700 
                 transition-colors duration-200 cursor-pointer"
      onClick={onClick}
      draggable
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center text-left">
          <div>
            <h4 className="font-medium text-white">{application.company}</h4>
            <p className="text-sm text-gray-400">{application.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-500 cursor-grab hidden sm:flex" />
          <button
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle stage change menu
            }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex gap-1 overflow-hidden">
          {(application.tags || [application.type]).slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${getTypeColor(tag)}`}
            >
              {tag}
            </span>
          ))}
          {(application.tags || [application.type]).length > 3 && (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
              +{(application.tags || [application.type]).length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-400 flex-shrink-0">
          <Clock className="h-3 w-3 mr-1" />
          {application.lastUpdated}
        </div>
      </div>
    </div>
  );
});