import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDTO } from './types';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    rToken: string | null;
    user: UserDTO | null;
    hasHydrated: boolean;
    login: (userData: UserDTO, token?: string, rToken?: string) => void;
    logout: () => void;
    updateUser: (userData: Partial<UserDTO>) => void;
    setHasHydrated: (value: boolean) => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            token: null,
            rToken: null,
            user: null,
            hasHydrated: false,

            login: (userData, token, rToken) =>
                set({
                    isAuthenticated: true,
                    token,
                    rToken,
                    user: userData,
                }),

            logout: () =>
                set({
                    isAuthenticated: false,
                    token: null,
                    rToken: null,
                    user: null,
                }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),

            setHasHydrated: (value) =>
                set({
                    hasHydrated: value,
                }),
        }),
        {
            name: 'paymyfess-auth-storage', // localStorage key

            // 👇 Important for Next.js App Router
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export default useAuthStore;
