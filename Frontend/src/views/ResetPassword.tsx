// src/views/ResetPassword.tsx
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';
import { ResetPasswordViewModel } from '@/viewModels/ResetPasswordViewModel';

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
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full p-2 border mb-2"
          type="password"
          placeholder="Enter your new password"
          value={viewModel.newPassword}
          onChange={(e) => viewModel.setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={viewModel.isLoading || !viewModel.resetToken}
          className="btn btn-blue w-full"
        >
          {viewModel.isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {viewModel.successMessage && <div className="mt-2 text-green-500">{viewModel.successMessage}</div>}
      {viewModel.errorMessage && <div className="mt-2 text-red-500">{viewModel.errorMessage}</div>}
    </div>
  );
});

export default ResetPassword;