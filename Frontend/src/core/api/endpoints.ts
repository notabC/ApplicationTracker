// src/core/api/endpoints.ts
export const API_ENDPOINTS = {
    APPLICATIONS: {
      BASE: '/api/applications',
      BY_ID: (id: string) => `/api/applications/${id}`,
      LOGS: '/api/applications/logs',
    },
    WORKFLOW: {
      BASE: '/api/workflow',
      STAGES: '/api/workflow/stages',
    },
    EMAIL: {
      IMPORT: '/api/email/import',
      PROCESS: '/api/email/process',
    }
  } as const;