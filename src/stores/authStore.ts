import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * The seven profile archetypes offered on /signup/profile. Each one unlocks a
 * different /signup/details form variant. Kept as a string union so route
 * guards and the SignupDetailsPage switch get exhaustiveness checking.
 */
export type ProfileType =
  | 'everyone'
  | 'trader'
  | 'analyst'
  | 'storage'
  | 'industrial'
  | 'student'
  | 'developer';

/**
 * Free-form bag of profile-specific field values written by SignupDetailsPage.
 * Intentionally loose — different forms have different shapes and we POST the
 * lot to the API after VPS migration. Individual form components type their
 * inputs locally.
 */
export type ProfileDetails = Record<string, string | string[]>;

export type AuthState = {
  email: string;
  name: string;
  selectedProfile: ProfileType | null;
  profileDetails: ProfileDetails;
  currentStep: 1 | 2 | 3;
};

export type AuthActions = {
  setCredentials: (args: { name: string; email: string }) => void;
  setProfile: (profile: ProfileType) => void;
  setProfileDetails: (details: ProfileDetails) => void;
  advanceStep: () => void;
  resetAuth: () => void;
};

const initialState: AuthState = {
  email: '',
  name: '',
  selectedProfile: null,
  profileDetails: {},
  currentStep: 1,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCredentials: ({ name, email }) => set({ name, email }),

      setProfile: (profile) => set({ selectedProfile: profile }),

      setProfileDetails: (details) =>
        set({ profileDetails: { ...get().profileDetails, ...details } }),

      advanceStep: () => {
        const step = get().currentStep;
        const next = (step < 3 ? step + 1 : 3) as 1 | 2 | 3;
        set({ currentStep: next });
      },

      resetAuth: () => set({ ...initialState }),
    }),
    {
      name: 'gridalpha-auth-signup',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        email: s.email,
        name: s.name,
        selectedProfile: s.selectedProfile,
        profileDetails: s.profileDetails,
        currentStep: s.currentStep,
      }),
    },
  ),
);
