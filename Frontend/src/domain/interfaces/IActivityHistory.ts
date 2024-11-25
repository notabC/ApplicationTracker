import { ActivityHistoryViewModel } from "@/viewModels/ActivityHistoryViewModel";

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
}

export interface ActivityHistoryLogItemProps {
    log: ActivityLog;
    viewModel: ActivityHistoryViewModel;
}

export interface ActivityHistoryFiltersProps {
    viewModel: ActivityHistoryViewModel;
}

export interface ActivityHistoryModalProps {
    onClose: () => void;
  }
  