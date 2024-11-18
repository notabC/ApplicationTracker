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
      BASE: '/api/emails',
      PROCESS: '/api/emails/process',
    },
    GMAIL: {
      AUTH_URL: '/api/gmail/auth/url',
      AUTH_CALLBACK: '/api/gmail/auth/callback',
      EMAILS: '/api/gmail/emails',
      CHECK_AUTH: '/api/gmail/check-auth',
    }
  } as const;