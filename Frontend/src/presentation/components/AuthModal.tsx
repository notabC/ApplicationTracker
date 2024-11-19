import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '../../di/container';
import { AuthViewModel } from '../viewModels/AuthViewModel';
import { SERVICE_IDENTIFIERS } from '../../core/constants/identifiers';
import { Mail, Loader, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = observer(({ isOpen, onClose }) => {
  const viewModel = container.get<AuthViewModel>(SERVICE_IDENTIFIERS.AuthViewModel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-md mx-auto">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-800/50 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {/* Main card */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 py-12 space-y-8">
            {/* Icon container with gradient background */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4">
                <Mail className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Text content */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">
                Sign in Required
              </h3>
              <p className="text-gray-400 text-sm">
                Please sign in with your Gmail account to continue
              </p>
            </div>

            {/* Sign in button */}
            <button
              onClick={() => viewModel.authenticate()}
              disabled={viewModel.isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5
                       bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
                       text-white font-medium rounded-xl transition-all duration-200
                       shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {viewModel.isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
              Sign in with Gmail
            </button>

            {/* Error message */}
            {viewModel.error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">
                  {viewModel.error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AuthModal;