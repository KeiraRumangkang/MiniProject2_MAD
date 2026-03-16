import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Role = 'mahasiswa' | 'staff' | 'kepala';

type SessionUser = {
  userId: string;
  username: string;
  role: Role;
  name: string;
};

type SessionState = {
  activeRole: Role | null;
  sessions: Partial<Record<Role, SessionUser>>;
};

type AuthSessionContextType = {
  isHydrated: boolean;
  activeRole: Role | null;
  activeSession: SessionUser | null;
  sessions: Partial<Record<Role, SessionUser>>;
  signIn: (user: SessionUser) => Promise<void>;
  signOut: (role?: Role) => Promise<void>;
  signOutAll: () => Promise<void>;
  setActiveRole: (role: Role) => Promise<void>;
  getSessionForRole: (role: Role) => SessionUser | null;
};

const SESSION_STORAGE_KEY = 'mad.auth.sessions.v1';

const AuthSessionContext = createContext<AuthSessionContextType | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    activeRole: null,
    sessions: {},
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) as SessionState;
        if (!mounted) return;

        setState({
          activeRole: parsed.activeRole ?? null,
          sessions: parsed.sessions ?? {},
        });
      } catch {
        if (mounted) {
          setState({ activeRole: null, sessions: {} });
        }
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const persistState = useCallback(async (next: SessionState) => {
    setState(next);
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const signIn = useCallback(
    async (user: SessionUser) => {
      const next: SessionState = {
        activeRole: user.role,
        sessions: {
          ...state.sessions,
          [user.role]: user,
        },
      };
      await persistState(next);
    },
    [persistState, state.sessions]
  );

  const setActiveRole = useCallback(
    async (role: Role) => {
      if (!state.sessions[role]) return;
      const next: SessionState = { ...state, activeRole: role };
      await persistState(next);
    },
    [persistState, state]
  );

  const signOut = useCallback(
    async (role?: Role) => {
      const targetRole = role ?? state.activeRole;
      if (!targetRole) {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        setState({ activeRole: null, sessions: {} });
        return;
      }

      const nextSessions = { ...state.sessions };
      delete nextSessions[targetRole];
      const next: SessionState = {
        activeRole: state.activeRole === targetRole ? null : state.activeRole,
        sessions: nextSessions,
      };

      if (Object.keys(nextSessions).length === 0) {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        setState(next);
        return;
      }

      await persistState(next);
    },
    [persistState, state]
  );

  const signOutAll = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    setState({ activeRole: null, sessions: {} });
  }, []);

  const getSessionForRole = useCallback(
    (role: Role) => {
      return state.sessions[role] ?? null;
    },
    [state.sessions]
  );

  const activeSession = useMemo(() => {
    if (!state.activeRole) return null;
    return state.sessions[state.activeRole] ?? null;
  }, [state.activeRole, state.sessions]);

  const value = useMemo<AuthSessionContextType>(
    () => ({
      isHydrated,
      activeRole: state.activeRole,
      activeSession,
      sessions: state.sessions,
      signIn,
      signOut,
      signOutAll,
      setActiveRole,
      getSessionForRole,
    }),
    [activeSession, getSessionForRole, isHydrated, setActiveRole, signIn, signOut, signOutAll, state.activeRole, state.sessions]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider');
  }
  return ctx;
}

export function getHomePathByRole(role: Role) {
  if (role === 'mahasiswa') return '/mahasiswa/(tabs)' as const;
  if (role === 'staff') return '/staff' as const;
  return '/kepala' as const;
}

export type { Role, SessionUser };