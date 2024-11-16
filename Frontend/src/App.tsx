// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnalyticsView } from '@/presentation/views/Analytics/AnalyticsView';
import { ContainerProvider } from '@/di/ContainerProvider';
import { UnsavedChangesProvider } from './presentation/providers/UnsavedChangesProvider';
import { JobTracker } from './presentation/views/JobTracker';

const App: React.FC = () => {
  return (
    <ContainerProvider>
      <Router>
        <UnsavedChangesProvider>
          <Routes>
            <Route path="/" element={<JobTracker />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            {/* Add other routes as needed */}
          </Routes>
        </UnsavedChangesProvider>
      </Router>
    </ContainerProvider>
  );
};

export default App;
