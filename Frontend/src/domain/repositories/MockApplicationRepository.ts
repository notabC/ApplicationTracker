// src/domain/repositories/MockApplicationRepository.ts
import { injectable } from 'inversify';
import { IApplicationRepository } from './ApplicationRepository';
import { mockApplications } from '@/infrastructure/services/mockData';
import { Application } from '@/domain/interfaces/IApplication';

@injectable()
export class MockApplicationRepository implements IApplicationRepository {
  getApplications(): Application[] {
    return mockApplications;
  }
}
