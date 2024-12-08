import { DollarSign, MapPin, ClipboardEdit } from 'lucide-react';
import type { Application } from '@/core/domain/models/Application';
import type { ApplicationModalViewModel } from '@/viewModels/ApplicationModalViewModel';
import { ApplicationModalStatusLog } from './ApplicationModalStatusLog';
import { EditableField } from '@/views/components/applicationModal/EditableField';
import { TagManager } from '@/views/components/applicationModal/TagManager';
import { observer } from 'mobx-react-lite';

interface ContentProps {
  application: Application;
  updatedApplication: Application;
  viewModel: ApplicationModalViewModel;
}

export const ApplicationModalContent = observer(({
  application,
  updatedApplication,
  viewModel
}: ContentProps) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-br from-[#1e2128] to-[#16181d]">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <EditableField
              value={updatedApplication.description}
              onChange={(value) => viewModel.handleFieldChange(application, 'description', value, false)}
              application={application}
              field="description"
              label='Description'
              Icon={ClipboardEdit}
            />
          </div>

          <div>
            <EditableField
              value={updatedApplication.salary}
              onChange={(value) => viewModel.handleFieldChange(application, 'salary', value, false)}
              application={application}
              field="salary"
              label='Salary Range'
              Icon={DollarSign}
            />
          </div>

          <div>
            <EditableField
              value={updatedApplication.location}
              onChange={(value) => viewModel.handleFieldChange(application, 'location', value, false)}
              application={application}
              field="location"
              label='Location'
              Icon={MapPin}
            />
          </div>

          <div className="col-span-2">
            <EditableField
              value={updatedApplication.notes}
              onChange={(value) => viewModel.handleFieldChange(application, 'notes', value, false)}
              application={application}
              field="notes"
              label='Notes'
              Icon={ClipboardEdit}
            />
          </div>
        </div>

        <TagManager
          tags={updatedApplication.tags}
          onTagsUpdate={(tags) => viewModel.handleFieldChange(application, 'tags', tags, false)}
        />

        <ApplicationModalStatusLog 
          updatedApplication={updatedApplication}
          viewModel={viewModel}
        />
      </div>
    </div>
  );
});