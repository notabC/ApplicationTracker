// src/views/components/Waitlist.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { WaitlistViewModel } from '@/viewModels/WaitlistViewModel';
import { X, Loader } from 'lucide-react';

interface Props {
  viewModel: WaitlistViewModel;
}

const Waitlist: React.FC<Props> = observer(({ viewModel }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await viewModel.submit();
  };

  if (!viewModel.isFormVisible) {
    return (
      <div
        className="
          px-6 py-4 mb-2
          bg-gradient-to-r from-amber-500/10 to-amber-500/5
          border-b border-amber-500/20
          transition-all duration-200"
        onClick={() => viewModel.toggleFormVisibility()}
      >
        <p className="text-sm text-amber-400/90">
          This feature is currently in beta. Click here to join our waitlist to get early access.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="
        bg-[#1a1d24] rounded-xl p-4 w-full max-w-md
        border border-[#232732]/20
        shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
      ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Join the Waitlist</h3>
              <p className="text-sm text-gray-400 mt-1">Get early access when spots become available.</p>
            </div>
            <button 
              type="button"
              onClick={() => viewModel.toggleFormVisibility()}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your Google Gmail address"
              value={viewModel.email}
              onChange={(e) => viewModel.setEmail(e.target.value)}
              disabled={viewModel.isLoading}
              className="
                flex-1 px-4 py-2 rounded-lg text-sm
                bg-[#16181d] border border-[#232732]/20
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                text-gray-300 placeholder-gray-500
                focus:border-blue-500/30 focus:outline-none
                disabled:opacity-50
              "
            />
            <button
              type="submit"
              disabled={viewModel.isLoading || !viewModel.email}
              className="
                px-4 py-2 rounded-lg
                bg-blue-500/10 border border-blue-500/20
                text-blue-400 text-sm font-medium
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {viewModel.isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Join'
              )}
            </button>
          </div>
          {viewModel.error && <p className="text-sm text-red-400 mt-2">{viewModel.error}</p>}
        </form>
      </div>
    </div>
  );
});

export default Waitlist;
