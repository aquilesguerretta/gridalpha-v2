// FOUNDRY contract — re-export ProfileType from authStore for cleaner imports
// across the app. authStore remains the single source of truth.

export type { ProfileType } from '@/stores/authStore';
