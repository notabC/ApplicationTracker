// src/presentation/components/PrivateRoute.tsx
import { FC, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';
import { Loader2 } from 'lucide-react';
import { PrivateRouteViewModel } from '@/viewModels/PrivateRouteViewModel';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: FC<PrivateRouteProps> = observer(({ children }) => {
  // Get the ViewModel instance from the container
  const viewModel = container.get<PrivateRouteViewModel>(
    SERVICE_IDENTIFIERS.PrivateRouteViewModel
  );

  const location = useLocation();

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
});
