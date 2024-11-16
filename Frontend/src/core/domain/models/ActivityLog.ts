// src/core/domain/models/ActivityLog.ts
export type ActivityType = 
  | 'stage_change'
  | 'application_created'
  | 'application_updated'
  | 'email_processed'
  | 'note_added'
  | 'tag_added'
  | 'tag_removed';

export interface ActivityLog {
  id: string;
  applicationId: string;
  type: ActivityType;
  timestamp: string;
  title: string;
  description: string;
  metadata: {
    fromStage?: string;
    toStage?: string;
    emailId?: string;
    emailSubject?: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    [key: string]: any;
  };
  user?: string; // For future auth implementation
}