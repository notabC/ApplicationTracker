// src/App.tsx
import React from 'react';
import { ContainerProvider } from '@/di/ContainerProvider';
import { JobTracker } from '@/presentation/views/JobTracker';
import { UnsavedChangesProvider } from '@/presentation/providers/UnsavedChangesProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'reflect-metadata'; // Ensure reflect-metadata is imported for Inversify

const App: React.FC = () => {
  return (
    <ContainerProvider>
      <Router>
        <UnsavedChangesProvider>
          <Routes>
            <Route path="/" element={<JobTracker />} />
          </Routes>
        </UnsavedChangesProvider>
      </Router>
    </ContainerProvider>
  );
};

export default App;
