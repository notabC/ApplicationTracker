// src/domain/repositories/MockApplicationRepository.ts
import { injectable } from 'inversify';
import { IApplicationRepository, Application } from './ApplicationRepository';

@injectable()
export class MockApplicationRepository implements IApplicationRepository {
  private applications: Application[] = [
    // Populate with mock data or fetch from an API
    {
      id: '1',
      stage: 'Resume Submitted',
      type: 'Full-Time',
      dateApplied: '2024-01-15',
      lastUpdated: '2024-02-20',
    },
    {
      id: '2',
      stage: 'Interview Process',
      type: 'Internship',
      dateApplied: '2024-02-10',
      lastUpdated: '2024-03-15',
    },
    {
      id: '3',
      stage: 'Offer',
      type: 'Full-Time',
      dateApplied: '2024-03-05',
      lastUpdated: '2024-04-10',
    },
    // Add more applications as needed
  ];

  getApplications(): Application[] {
    return this.applications;
  }
}
