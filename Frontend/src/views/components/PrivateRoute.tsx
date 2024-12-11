// src/presentation/components/PrivateRoute.tsx
import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';
import { Loader2 } from 'lucide-react';
import { PrivateRouteViewModel } from '@/viewModels/PrivateRouteViewModel';
import { AuthService } from '@/infrastructure/services/AuthService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: FC<PrivateRouteProps> = observer(({ children }) => {
  const viewModel = container.get<PrivateRouteViewModel>(SERVICE_IDENTIFIERS.PrivateRouteViewModel);
  const authService = container.get<AuthService>(SERVICE_IDENTIFIERS.AuthService);

  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

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
    // Show inline login/register form
    const handleLogin = async () => {
      const success = await authService.login(loginEmail, loginPassword);
      if (success) {
        await authService.checkAuthentication();
        window.location.reload();
      } else {
        alert("Login failed");
      }
    };

    const handleRegister = async () => {
      const success = await authService.register(registerEmail, registerPassword, registerName);
      if (success) {
        // After successful registration, we can automatically login or let the user login
        const loginSuccess = await authService.login(registerEmail, registerPassword);
        if (loginSuccess) {
          await authService.checkAuthentication();
        } else {
          alert("Auto-login after registration failed.");
        }
      } else {
        alert("Registration failed");
      }
    };

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">You must be logged in to access this page.</h1>
        
        {!showRegister ? (
          <div className="max-w-sm mx-auto p-4 border rounded">
            <h2 className="text-xl font-medium mb-2">Login</h2>
            <input 
              className="w-full p-2 border mb-2"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input 
              className="w-full p-2 border mb-2"
              placeholder="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button className="btn btn-blue w-full" onClick={handleLogin}>Login</button>
            <div className="mt-2 text-sm">
              Don't have an account? <button onClick={() => setShowRegister(true)} className="text-blue-500 underline">Register</button>
            </div>
          </div>
        ) : (
          <div className="max-w-sm mx-auto p-4 border rounded">
            <h2 className="text-xl font-medium mb-2">Register</h2>
            <input 
              className="w-full p-2 border mb-2"
              placeholder="Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
            />
            <input 
              className="w-full p-2 border mb-2"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <input 
              className="w-full p-2 border mb-2"
              placeholder="Password"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <button className="btn btn-blue w-full" onClick={handleRegister}>Register</button>
            <div className="mt-2 text-sm">
              Already have an account? <button onClick={() => setShowRegister(false)} className="text-blue-500 underline">Login</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
});