import { useState } from 'react';
import { container, SERVICE_IDENTIFIERS } from "@/di/container";
import { Loader2, LogOut, Shield } from "lucide-react";
import { observer } from "mobx-react-lite";
import { AuthViewModel } from "../viewModels/AuthViewModel";
import { Link } from 'react-router-dom';

export const Login = observer(() => {
  const authViewModel = container.get<AuthViewModel>(SERVICE_IDENTIFIERS.AuthViewModel);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSignIn = () => {
    if (privacyAccepted) {
      authViewModel.authenticate();
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d21] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-3">
            Job Application Tracker
          </h1>
          <p className="text-gray-400">Sign in to manage your job applications</p>
        </div>

        <div className="space-y-6">
          {/* Modern Privacy Notice */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-xl border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
            <div className="relative p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <p className="text-sm text-gray-300 leading-relaxed">
                We care about your privacy. By signing in, you agree to our{' '}
                <Link 
                  to="/privacy" 
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline decoration-blue-400/30 hover:decoration-blue-300"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <input
              type="checkbox"
              id="privacy-consent"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="w-4 h-4 rounded bg-[#1e2227] border-gray-600 text-blue-500"
            />
            <label htmlFor="privacy-consent" className="text-sm text-gray-400">
              I have read and agree to the Privacy Policy
            </label>
          </div>

          {/* Enhanced Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={authViewModel.isLoading || !privacyAccepted}
            className="w-full flex items-center justify-center gap-3 px-6 py-4
                    bg-gradient-to-r from-blue-500/10 to-purple-500/10
                    hover:from-blue-500/20 hover:to-purple-500/20
                    border border-white/5 hover:border-white/10
                    rounded-2xl transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:hover:from-blue-500/10 disabled:hover:to-purple-500/10
                    group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3">
              {authViewModel.isLoading ? (
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
              )}
              <span className="text-blue-400 group-hover:text-blue-300 font-medium transition-colors duration-200">
                {authViewModel.isLoading ? 'Signing in...' : 'Sign in to continue'}
              </span>
            </div>
          </button>

          {authViewModel.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">{authViewModel.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});