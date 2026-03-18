import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "../../lib/auth";

interface AuthContextValue {
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: UserRole | null) => void;
  signInAsRole: (role: UserRole) => void;
  signOut: () => void;
}

const AUTH_ROLE_KEY = "bilgenly_role";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem(AUTH_ROLE_KEY) as UserRole | null;

    if (
      savedRole === "teacher" ||
      savedRole === "student" ||
      savedRole === "moderator"
    ) {
      setRoleState(savedRole);
    }

    setIsLoading(false);
  }, []);

  const setRole = (nextRole: UserRole | null) => {
    setRoleState(nextRole);

    if (nextRole) {
      localStorage.setItem(AUTH_ROLE_KEY, nextRole);
    } else {
      localStorage.removeItem(AUTH_ROLE_KEY);
    }
  };

  const signInAsRole = (nextRole: UserRole) => {
    setRole(nextRole);
  };

  const signOut = () => {
    setRole(null);
  };

  const value = useMemo(
    () => ({
      role,
      isAuthenticated: role !== null,
      isLoading,
      setRole,
      signInAsRole,
      signOut,
    }),
    [role, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}