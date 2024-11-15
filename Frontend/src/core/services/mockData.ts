// File: src/core/services/mockData.ts
import { Application } from '../domain/models/Application';

export const mockApplications: Application[] = [
  {
    id: 1,
    company: 'TechCorp',
    position: 'Frontend Developer',
    dateApplied: '2024-03-15',
    stage: 'Resume Submitted',
    type: 'frontend',
    tags: ['frontend'],
    lastUpdated: '2024-03-15',
    description: 'Frontend position with React',
    salary: '$80,000 - $120,000',
    location: 'Remote',
    notes: '',
    logs: []
  },
  {
    id: 2,
    company: 'StartupInc',
    position: 'Full Stack Engineer',
    dateApplied: '2024-03-16',
    stage: 'Interview Process',
    type: 'fullstack',
    tags: ['fullstack', 'frontend', 'backend'],
    lastUpdated: '2024-03-16',
    description: 'Full stack role with React and Node.js',
    salary: '$90,000 - $130,000',
    location: 'San Francisco, CA',
    notes: '',
    logs: []
  }
];