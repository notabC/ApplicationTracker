// AddApplicationModal.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  X, PlusCircle, Building2, Briefcase, Tags,
  ClipboardList, DollarSign, MapPin, FileText,
  Loader, AlertCircle
} from 'lucide-react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import InputField from './InputField';
import TextArea from './TextArea';
import { AddApplicationViewModel } from '@/viewModels/AddApplicationViewModel';
import { IAddApplicationModalProps } from '@/domain/interfaces/IAddApplication';

const AddApplicationModal: React.FC<IAddApplicationModalProps> = observer(({ isOpen, onClose }) => {
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const viewModel = container.get<AddApplicationViewModel>(SERVICE_IDENTIFIERS.AddApplicationViewModel);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (viewModel.validateForm()) {
      viewModel.handleSubmit(e);
    } else {
      setShowErrorSummary(true);
      // Scroll to the first error
      const firstErrorField = Object.keys(viewModel.fieldErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = element?.querySelector('input, textarea') as HTMLElement | null;
        if (input) {
          input.focus();
        }
      }
    }
  }, [viewModel]);

  // Error Summary Component
  const ErrorSummary = observer(() => {
    if (!viewModel.hasErrors) return null;
    
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="
          bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          transition-all duration-200
        ">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-medium text-red-400">Please fix the following errors:</h3>
          </div>
          <ul className="space-y-1">
            {Object.entries(viewModel.fieldErrors)
              .filter(([_, error]) => error)
              .map(([field, error]) => (
                <li 
                  key={field}
                  className="text-xs text-red-400 flex items-center gap-2 cursor-pointer hover:underline"
                  onClick={() => {
                    const element = document.getElementById(field);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const input = element?.querySelector('input, textarea') as HTMLElement | null;
                    if (input) {
                      input.focus();
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const element = document.getElementById(field);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const input = element?.querySelector('input, textarea') as HTMLElement | null;
                      if (input) {
                        input.focus();
                      }
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Scroll to ${field} field`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400/50"></span>
                  {error}
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  });

  useEffect(() => {
    if (viewModel.submissionSuccessful) {
      onClose();
      viewModel.resetForm();
      setShowErrorSummary(false);
    }
  }, [viewModel.submissionSuccessful, onClose, viewModel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="
          bg-gradient-to-br from-[#1e2128] to-[#16181d]
          rounded-2xl w-full max-w-2xl max-h-[85vh] 
          overflow-hidden flex flex-col 
          border border-[#232732]/10
          shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
          transition-all duration-200
        "
      >
        {/* Header */}
        <div className="p-6 border-b border-[#232732]/20 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div 
                className="
                  bg-blue-500/10 p-2 rounded-xl
                  shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                "
              >
                <PlusCircle className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Add New Application</h2>
            </div>
            <button 
              onClick={onClose}
              className="
                p-2 rounded-xl
                bg-[#1a1d24] border border-[#232732]/20
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                transition-all duration-200
              "
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto relative">
          <div className="p-6 space-y-8">
            {viewModel.error && (
              <div className="
                px-4 py-3 bg-red-500/10 border border-red-500/20 
                rounded-xl text-sm text-red-400
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
              ">
                {viewModel.error}
              </div>
            )}

            {/* Required Fields */}
            <div className="space-y-8">
              <InputField
                id="company"
                required
                label="Company Name"
                icon={Building2}
                type="text"
                value={viewModel.formData.company}
                onChange={(e) => viewModel.updateField('company', e.target.value)}
                placeholder="Enter company name"
                error={viewModel.fieldErrors?.company}
              />

              <InputField
                id="position"
                required
                label="Position"
                icon={Briefcase}
                type="text"
                value={viewModel.formData.position}
                onChange={(e) => viewModel.updateField('position', e.target.value)}
                placeholder="Enter position title"
                error={viewModel.fieldErrors?.position}
              />

              {/* Tags */}
              <div id="tags">
                <div className="flex items-center gap-2 mb-3">
                  <Tags className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-400">Tags</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewModel.availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => viewModel.toggleTag(tag)}
                      className={`
                        px-4 py-2 rounded-xl border transition-all duration-200 
                        shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                        ${viewModel.formData.tags.includes(tag)
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]'
                          : 'bg-[#1a1d24] text-gray-400 hover:text-gray-300 border-[#232732]/20 hover:border-cyan-500/30 hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]'
                        }
                      `}
                    >
                      {tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => viewModel.toggleAddTagInput()}
                    className="
                      px-4 py-2 rounded-xl border border-[#232732]/20
                      bg-[#1a1d24] text-gray-400
                      hover:text-gray-300 hover:border-cyan-500/30
                      shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                      hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                      transition-all duration-200
                      flex items-center gap-2
                    "
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Description */}
              <TextArea
                id="description"
                label="Description"
                icon={ClipboardList}
                value={viewModel.formData.description}
                onChange={(e) => viewModel.updateField('description', e.target.value)}
                placeholder="Enter job description"
                error={viewModel.fieldErrors?.description}
              />

              {/* Salary and Location Grid */}
              <div className="grid grid-cols-2 gap-8">
                <InputField
                  id="salary"
                  required
                  label="Salary Range"
                  icon={DollarSign}
                  type="text"
                  value={viewModel.formData.salary}
                  onChange={(e) => viewModel.updateField('salary', e.target.value)}
                  placeholder="e.g. $80,000 - $100,000"
                  error={viewModel.fieldErrors?.salary}
                />
                <InputField
                  id="location"
                  required
                  label="Location"
                  icon={MapPin}
                  type="text"
                  value={viewModel.formData.location}
                  onChange={(e) => viewModel.updateField('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  error={viewModel.fieldErrors?.location}
                />
              </div>

              {/* Notes */}
              <TextArea
                id="notes"
                label="Notes"
                icon={FileText}
                value={viewModel.formData.notes}
                onChange={(e) => viewModel.updateField('notes', e.target.value)}
                placeholder="Add any notes about the application"
                error={viewModel.fieldErrors?.notes}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#232732]/20 flex gap-3 justify-end bg-gradient-to-br from-[#1e2128] to-[#16181d]">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2.5 text-gray-400 hover:text-gray-300
                rounded-xl
                bg-[#1a1d24] border border-[#232732]/20
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                transition-all duration-200
              "
              disabled={viewModel.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`
                px-4 py-2.5
                bg-blue-500/10 text-blue-400
                rounded-xl
                border border-blue-500/20
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:bg-blue-500/20 hover:border-blue-500/30 hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                transition-all duration-200
                flex items-center gap-2
                ${viewModel.isSubmitting ? 'opacity-50 cursor-wait' : ''}
              `}
              disabled={viewModel.isSubmitting}
            >
              {viewModel.isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Add Application
                </>
              )}
            </button>
          </div>
        </form>

        {/* Floating Error Summary */}
        {showErrorSummary && <ErrorSummary />}
      </div>
    </div>
  );
});

export default AddApplicationModal;