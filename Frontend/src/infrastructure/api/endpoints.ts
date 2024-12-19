// src/core/api/endpoints.ts
export const API_ENDPOINTS = {
    APPLICATIONS: {
      BASE: '/api/applications',
      BY_ID: (id: string) => `/api/applications/${id}`,
      LOGS: '/api/applications/logs',
    },
    WORKFLOW: {
      BASE: '/api/workflow',
      DEFAULT: '/api/workflow/default',
      BY_ID: (id: string) => `/api/workflow/${id}`,
      STAGES: {
        BASE: (workflowId: string) => `/api/workflow/${workflowId}/stages`,
        BY_ID: (workflowId: string, stageId: string) => `/api/workflow/${workflowId}/stages/${stageId}`,
        ORDER: (workflowId: string) => `/api/workflow/${workflowId}/order`,
        VISIBILITY: (workflowId: string, stageId: string) => `/api/workflow/${workflowId}/visibility/${stageId}`,
      },
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
      LOGOUT: '/api/gmail/logout',
    },
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      CHECK_AUTH: '/api/auth/check-auth',
    },
  } as const;