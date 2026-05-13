import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "../../lib/auth";
import { getMe } from "../../features/auth/api";
import {
  defaultMockStudentId,
  getMockStudentById,
  mockTeacherUser,
  type MockDashboardUser,
} from "../../features/dashboard/mock/mockUsers";

interface AuthContextValue {
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  currentUser: MockDashboardUser | null;
  setRole: (role: UserRole | null) => void;
  signInAsRole: (
    role: UserRole,
    token?: string,
    user?: AuthUserProfile,
  ) => void;
  signOut: () => void;
}

const AUTH_ROLE_KEY = "bilgenly_role";
const AUTH_TOKEN_KEY = "bilgenly_token";
const AUTH_USER_KEY = "bilgenly_current_user";

interface AuthUserProfile {
  userId: string;
  username: string;
  email: string;
  role: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapAuthUserToDashboardUser(
  authUser: AuthUserProfile,
  fallbackRole: UserRole | null,
): MockDashboardUser | null {
  const normalizedRole = authUser.role.toLowerCase() as UserRole;
  const role = fallbackRole ?? normalizedRole;

  if (role !== "teacher" && role !== "student") {
    return null;
  }

  const fallbackUser =
    role === "teacher"
      ? mockTeacherUser
      : role === "student"
        ? getMockStudentById(defaultMockStudentId)
        : null;

  return {
    id: authUser.userId || `email:${authUser.email.trim().toLowerCase()}`,
    role,
    fullName: authUser.username,
    email: authUser.email,
    initials: getInitials(authUser.username),
    joinedLabel: fallbackUser?.joinedLabel ?? "Joined recently",
    location: fallbackUser?.location ?? "Location not set",
    bio: fallbackUser?.bio ?? "Bilgenly user",
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem(AUTH_ROLE_KEY) as UserRole | null;
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const savedUser = localStorage.getItem(AUTH_USER_KEY);

    if (
      savedRole === "teacher" ||
      savedRole === "student" ||
      savedRole === "moderator"
    ) {
      setRoleState(savedRole);
    }
    if (savedToken) {
      setTokenState(savedToken);
    }
    if (savedUser) {
      try {
        setAuthUser(JSON.parse(savedUser) as AuthUserProfile);
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setAuthUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchUser = async () => {
      try {
        const user = await getMe();
        if (isMounted) {
          setAuthUser(user);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        }
      } catch (error) {
        // Silently fail - user is authenticated but we couldn't fetch full details
        // This is acceptable, we have the token and basic role
        if (isMounted) {
          setAuthUser(null);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
    };

    // Delay the fetch slightly to avoid cascading renders
    timeoutId = setTimeout(() => {
      if (isMounted) {
        void fetchUser();
      }
    }, 0);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [token]);

  const setRole = (nextRole: UserRole | null) => {
    setRoleState(nextRole);

    if (nextRole) {
      localStorage.setItem(AUTH_ROLE_KEY, nextRole);
    } else {
      localStorage.removeItem(AUTH_ROLE_KEY);
    }
  };

  const signInAsRole = (
    nextRole: UserRole,
    nextToken = `bilgenly-session-${nextRole}`,
    nextUser?: AuthUserProfile,
  ) => {
    setRoleState(nextRole);
    setTokenState(nextToken);
    if (nextUser) {
      setAuthUser(nextUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    } else {
      setAuthUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    localStorage.setItem(AUTH_ROLE_KEY, nextRole);
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
  };

  const signOut = () => {
    setRoleState(null);
    setTokenState(null);
    setAuthUser(null);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };
  const fallbackUser =
    role === "teacher"
      ? mockTeacherUser
      : role === "student"
        ? getMockStudentById(defaultMockStudentId)
        : null;
  const currentUser = authUser
    ? mapAuthUserToDashboardUser(authUser, role)
    : fallbackUser;

  const value = useMemo(
    () => ({
      role,
      token,
      isAuthenticated: role !== null && token !== null,
      isLoading,
      currentUser,
      setRole,
      signInAsRole,
      signOut,
    }),
    [currentUser, isLoading, role, token],
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
