// Export all API services
export * from './config';
export * from './client';
export * from './auth';
export * from './users';
export * from './cars';
export * from './media';
export * from './reports';
export * from './marketplace';
export * from './payments';
export * from './chat';
export * from './dealer';
export * from './ai-jobs';

// Re-export for convenience
export { authApi } from './auth';
export { usersApi } from './users';
export { carsApi } from './cars';
export { mediaApi } from './media';
export { reportsApi } from './reports';
export { marketplaceApi } from './marketplace';
export { paymentsApi } from './payments';
export { chatApi } from './chat';
export { dealerApi } from './dealer';
export { aiJobsApi } from './ai-jobs';
export { apiClient } from './client';
