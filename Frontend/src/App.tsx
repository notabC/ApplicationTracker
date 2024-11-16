// File: src/App.tsx
import React from 'react';
import { ContainerProvider } from '@/di/ContainerProvider';
import { JobTracker } from '@/presentation/views/JobTracker';

const App: React.FC = () => {
  return (
    <ContainerProvider>
      <JobTracker />
    </ContainerProvider>
  );
};

export default App;