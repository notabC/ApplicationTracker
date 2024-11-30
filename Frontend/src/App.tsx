// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnalyticsView } from '@/presentation/views/Analytics/AnalyticsView';
import { ContainerProvider } from '@/di/ContainerProvider';
import { UnsavedChangesProvider } from './presentation/providers/UnsavedChangesProvider';
import { JobTracker } from './presentation/views/JobTracker';
import { PrivacyPolicy } from './views/Privacy';
import { Login } from './presentation/components/Login';
import { PrivateRoute } from './presentation/components/PrivateRoute';

const App: React.FC = () => {
  return (
    <ContainerProvider>
      <Router>
        <UnsavedChangesProvider>
          <Routes>
            {/* <Route path="/" element={<JobTracker />} /> */}
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <JobTracker />
                </PrivateRoute>
              }
            />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='/login' element={<Login />} />
            {/* Add other routes as needed */}
          </Routes>
        </UnsavedChangesProvider>
      </Router>
    </ContainerProvider>
  );
};

export default App;
