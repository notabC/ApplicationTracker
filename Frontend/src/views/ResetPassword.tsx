// src/views/ResetPassword.tsx
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';
import { ResetPasswordViewModel } from '@/viewModels/ResetPasswordViewModel';
import { Loader2, KeyRound } from 'lucide-react';

const ResetPassword: React.FC = observer(() => {
  const viewModel = container.get<ResetPasswordViewModel>(SERVICE_IDENTIFIERS.ResetPasswordViewModel);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      viewModel.setResetToken(token);
    }
  }, [viewModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    viewModel.submit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2128] to-[#16181d] flex items-center justify-center p-4">
      <div className="
        w-full max-w-md p-6 rounded-2xl border border-[#232732]/20
        shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
        bg-[#1a1d24] transition-all duration-200
      ">
        <div className="text-center mb-8">
          <h1 className="
            text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-3
          ">
            Reset Password
          </h1>
          <p className="text-gray-400">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="
            relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-xl border border-white/5 p-2
            shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          ">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
            <input
              className="w-full p-3 bg-transparent border-none text-gray-200 focus:outline-none relative z-10"
              type="password"
              placeholder="Enter your new password"
              value={viewModel.newPassword}
              onChange={(e) => viewModel.setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={viewModel.isLoading || !viewModel.resetToken}
            className="
              w-full flex items-center justify-center gap-3 px-6 py-4
              bg-gradient-to-r from-blue-500/10 to-purple-500/10
              border border-white/5 rounded-2xl transition-all duration-300
              hover:from-blue-500/20 hover:to-purple-500/20
              hover:border-white/10
              disabled:opacity-50 disabled:cursor-not-allowed
              group relative overflow-hidden
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
            "
          >
            <div className="
              absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            " />
            <div className="relative flex items-center gap-3">
              {viewModel.isLoading ? (
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              ) : (
                <KeyRound className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
              )}
              <span className="text-blue-400 group-hover:text-blue-300 font-medium transition-colors duration-200">
                {viewModel.isLoading ? 'Resetting...' : 'Reset Password'}
              </span>
            </div>
          </button>

          {viewModel.successMessage && (
            <div className="
              p-4 bg-green-500/10 border border-green-500/20 rounded-xl
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
              transition-all duration-200
            ">
              <p className="text-green-400 text-sm text-center">{viewModel.successMessage}</p>
            </div>
          )}
          
          {viewModel.errorMessage && (
            <div className="
              p-4 bg-red-500/10 border border-red-500/20 rounded-xl
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
              transition-all duration-200
            ">
              <p className="text-red-400 text-sm text-center">{viewModel.errorMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
});

export default ResetPassword;