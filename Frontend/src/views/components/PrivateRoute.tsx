// src/presentation/components/PrivateRoute.tsx
import { FC, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';
import { Loader2 } from 'lucide-react';
import { PrivateRouteViewModel } from '@/viewModels/PrivateRouteViewModel';
import { Link } from 'react-router-dom'; // Assuming you have React Router installed

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: FC<PrivateRouteProps> = observer(({ children }) => {
  const viewModel = container.get<PrivateRouteViewModel>(SERVICE_IDENTIFIERS.PrivateRouteViewModel);

  useEffect(() => {
    viewModel.initialize();
  }, [viewModel]);

  if (viewModel.isLoading) {
    return (
      <>
        <div className="blur-sm brightness-75">
          {children}
        </div>
  
        <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] flex items-center justify-center">
          <div className="fixed top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
          <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
          
          <div className="relative flex flex-col items-center gap-8 z-10">
            <div className="relative">
              <div className="
                absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20
                rounded-full blur-2xl
              "></div>
              <Loader2 className="relative w-12 h-12 text-blue-400 animate-spin" />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <h2 className="
                text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 
                text-transparent bg-clip-text
              ">
                Authenticating
              </h2>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400/80 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!viewModel.isAuthenticated) {
    return (
      <div className="p-4 min-h-screen bg-gradient-to-br from-[#1e2128] to-[#16181d] flex flex-col items-center justify-center">
        {!viewModel.showRegister ? (
          <div className="
            max-w-sm w-full
            bg-[#1a1d24]
            border border-[#232732]/20 
            rounded-2xl 
            shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
            p-6
            transition-all duration-200
          ">
            <h2 className="text-xl font-medium text-white mb-4">Login</h2>
    
            <input 
              className="
                w-full px-4 py-3 mb-3 
                bg-[#1a1d24] border border-[#232732]/20 rounded-xl
                text-white placeholder-gray-400
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30
                transition-all duration-200 text-sm
              "
              placeholder="Email"
              value={viewModel.loginEmail}
              onChange={(e) => viewModel.setLoginEmail(e.target.value)}
            />
    
            <input 
              className="
                w-full px-4 py-3 mb-4
                bg-[#1a1d24] border border-[#232732]/20 rounded-xl
                text-white placeholder-gray-400
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30
                transition-all duration-200 text-sm
              "
              placeholder="Password"
              type="password"
              value={viewModel.loginPassword}
              onChange={(e) => viewModel.setLoginPassword(e.target.value)}
            />
    
            <button
              className="
                w-full px-4 py-3 rounded-xl
                bg-gradient-to-r from-cyan-500/10 to-cyan-500/5
                border border-cyan-500/20 
                text-cyan-400 font-medium text-sm
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                hover:bg-cyan-500/20 hover:border-cyan-500/30
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                transition-all duration-200 mb-3
              "
              onClick={async () => {
                const success = await viewModel.login();
                if (success) {
                  window.location.reload();
                } else {
                  alert("Login failed");
                }
              }}
            >
              Login
            </button>
    
            <div className="mt-2 text-sm text-gray-400">
              Don't have an account?{" "}
              <button 
                onClick={() => viewModel.setShowRegister(true)} 
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200"
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          <div className="
            max-w-sm w-full
            bg-[#1a1d24]
            border border-[#232732]/20 
            rounded-2xl
            shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
            p-6
            transition-all duration-200
          ">
            <h2 className="text-xl font-medium text-white mb-4">Register</h2>
    
            <input
              className="
                w-full px-4 py-3 mb-3
                bg-[#1a1d24] border border-[#232732]/20 rounded-xl
                text-white placeholder-gray-400
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30
                transition-all duration-200 text-sm
              "
              placeholder="Name"
              value={viewModel.registerName}
              onChange={(e) => viewModel.setRegisterName(e.target.value)}
            />
    
            <input
              className="
                w-full px-4 py-3 mb-3
                bg-[#1a1d24] border border-[#232732]/20 rounded-xl
                text-white placeholder-gray-400
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30
                transition-all duration-200 text-sm
              "
              placeholder="Email"
              value={viewModel.registerEmail}
              onChange={(e) => viewModel.setRegisterEmail(e.target.value)}
            />
    
            <input
              className="
                w-full px-4 py-3 mb-4
                bg-[#1a1d24] border border-[#232732]/20 rounded-xl
                text-white placeholder-gray-400
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30
                transition-all duration-200 text-sm
              "
              placeholder="Password"
              type="password"
              value={viewModel.registerPassword}
              onChange={(e) => viewModel.setRegisterPassword(e.target.value)}
            />

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={viewModel.acceptedPrivacy}
                onChange={(e) => viewModel.setAcceptedPrivacy(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-400">
                I agree to the{" "}
                <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <button
              className={`
                w-full px-4 py-3 rounded-xl
                bg-gradient-to-r from-cyan-500/10 to-cyan-500/5
                border border-cyan-500/20 
                text-cyan-400 font-medium text-sm
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                hover:bg-cyan-500/20 hover:border-cyan-500/30
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                transition-all duration-200 mb-3
                ${viewModel.acceptedPrivacy ? '' : 'opacity-50 cursor-not-allowed'}
              `}
              onClick={async () => {
                if (!viewModel.acceptedPrivacy) return;
                const success = await viewModel.register();
                if (success) {
                  const loginSuccess = await viewModel.login();
                  if (!loginSuccess) {
                    alert("Auto-login after registration failed.");
                  }
                } else {
                  alert("Registration failed");
                }
              }}
              disabled={!viewModel.acceptedPrivacy}
            >
              Register
            </button>
    
            <div className="mt-2 text-sm text-gray-400">
              Already have an account?{" "}
              <button 
                onClick={() => viewModel.setShowRegister(false)} 
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    );    
  }

  return <>{children}</>;
});