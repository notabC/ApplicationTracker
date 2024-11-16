// src/domain/repositories/MockApplicationRepository.ts
import { injectable } from 'inversify';
import { IApplicationRepository } from './ApplicationRepository';
import { mockApplications } from '@/core/services/mockData';
import { Application } from '@/core/domain/models/Application';

@injectable()
export class MockApplicationRepository implements IApplicationRepository {
  getApplications(): Application[] {
    return mockApplications;
  }
}
