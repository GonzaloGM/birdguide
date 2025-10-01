// Common types that can be shared between frontend and backend for BirdGuide app

// Core API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Re-export everything from types.ts for easy importing
export * from './types';
