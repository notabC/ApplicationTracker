// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContainerProvider } from '@/di/ContainerProvider';
import { JobTracker } from './views/JobTracker';
import { PrivacyPolicy } from './views/Privacy';
import { Login } from './views/Login';
import { PrivateRoute } from './views/components/PrivateRoute';
import LandingPage from './views/LandingPage';
import NotFound from './views/NotFound';
import { UnsavedChangesNotification } from './views/components/UnsavedChangesNotification';
import { container, SERVICE_IDENTIFIERS } from './di/container';
import { UnsavedChangesViewModel } from './viewModels/UnsavedChangesViewModel';
import AnalyticsDashboard from './views/AnalyticsDashboard';

const unsavedChangesViewModel = container.get<UnsavedChangesViewModel>(SERVICE_IDENTIFIERS.UnsavedChangesViewModel);

const App: React.FC = () => {
  return (
    <ContainerProvider>
      <Router>
        <UnsavedChangesNotification viewModel={unsavedChangesViewModel} />
        <Routes>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <JobTracker />
              </PrivateRoute>
            }
          />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ContainerProvider>
  );
};

export default App;
