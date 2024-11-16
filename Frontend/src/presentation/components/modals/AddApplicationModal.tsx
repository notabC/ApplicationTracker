import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { X, PlusCircle } from 'lucide-react';
import { AddApplicationViewModel } from '../../viewModels/AddApplicationViewModel';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddApplicationModal: React.FC<Props> = observer(({ isOpen, onClose }) => {
  const viewModel = container.get<AddApplicationViewModel>(SERVICE_IDENTIFIERS.AddApplicationViewModel);

  // Effect to handle modal closure on successful submission
  useEffect(() => {
    if (viewModel.submissionSuccessful) {
      onClose();
      viewModel.resetSubmissionStatus(); // Reset the submission status for future submissions
    }
  }, [viewModel.submissionSuccessful, onClose, viewModel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Add New Application</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={viewModel.handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Display Error Message */}
            {viewModel.error && (
              <div className="mb-4 text-red-500">
                {viewModel.error}
              </div>
            )}

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Company Name *
              </label>
              <input
                required
                type="text"
                value={viewModel.formData.company}
                onChange={(e) => viewModel.updateField('company', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
                placeholder="Enter company name"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Position *
              </label>
              <input
                required
                type="text"
                value={viewModel.formData.position}
                onChange={(e) => viewModel.updateField('position', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
                placeholder="Enter position title"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {viewModel.availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => viewModel.toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      viewModel.formData.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => viewModel.toggleAddTagInput()}
                  className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg hover:text-white flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Tag
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={viewModel.formData.description}
                onChange={(e) => viewModel.updateField('description', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white h-24"
                placeholder="Enter job description"
              />
            </div>

            {/* Salary and Location Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={viewModel.formData.salary}
                  onChange={(e) => viewModel.updateField('salary', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={viewModel.formData.location}
                  onChange={(e) => viewModel.updateField('location', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Notes
              </label>
              <textarea
                value={viewModel.formData.notes}
                onChange={(e) => viewModel.updateField('notes', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white h-24"
                placeholder="Add any notes about the application"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white rounded-lg"
              disabled={viewModel.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={viewModel.isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                viewModel.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {viewModel.isSubmitting ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
