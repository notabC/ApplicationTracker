// src/domain/repositories/MockApplicationRepository.ts
import { injectable } from 'inversify';
import { IApplicationRepository, Application } from './ApplicationRepository';

@injectable()
export class MockApplicationRepository implements IApplicationRepository {
  private applications: Application[] = [
    {
      id: '1',
      stage: 'Resume Submitted',
      type: 'Full-Time',
      dateApplied: '2024-11-15',
      lastUpdated: '2024-11-16',
    },
    {
      id: '2',
      stage: 'Interview Process',
      type: 'Internship',
      dateApplied: '2024-11-10',
      lastUpdated: '2024-11-14',
    },
    {
      id: '3',
      stage: 'Offer',
      type: 'Full-Time',
      dateApplied: '2024-10-05',
      lastUpdated: '2024-10-20',
    },
    // Add more applications as needed
  ];

  getApplications(): Application[] {
    return this.applications;
  }
}
