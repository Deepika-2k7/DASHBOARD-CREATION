import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";

type Role = "admin" | "student";

interface AuthUser {
  id: string;
  name: string;
  username: string;
  registerNumber: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<Role>;
  signup: (payload: SignupPayload) => Promise<void>;
  updateProfile: (payload: ProfilePayload) => Promise<void>;
  logout: () => void;
}

interface SignupPayload {
  name: string;
  username: string;
  registerNumber: string;
  password: string;
  role: Role;
}

interface ProfilePayload {
  name: string;
  registerNumber: string;
  password?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "student-task-dashboard-auth";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(saved) as { token: string; user: AuthUser };
        setAuthToken(parsed.token);

        const response = await api.get("/auth/me");
        const nextUser = response.data as AuthUser;

        setToken(parsed.token);
        setUser(nextUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: parsed.token, user: nextUser }));
      } catch {
        setToken(null);
        setUser(null);
        setAuthToken(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const storeSession = (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const login = async (username: string, password: string): Promise<Role> => {
    try {
      console.log("[LOGIN] Starting login process for user:", username);
      console.log("[LOGIN] API base URL:", api.defaults.baseURL);
      console.log("[LOGIN] Sending POST request to /auth/login");
      
      const response = await api.post("/auth/login", { username, password });
      
      console.log("[LOGIN] ✓ Response received:", response.status);
      console.log("[LOGIN] Response data keys:", Object.keys(response.data));
      console.log("[LOGIN] Token received:", response.data.token ? "✓ YES" : "✗ NO");
      console.log("[LOGIN] User data:", response.data.user);
      
      const user = response.data.user as AuthUser;
      storeSession(response.data.token as string, user);
      
      console.log("[LOGIN] ✓ Session stored successfully");
      return user.role;
    } catch (error: any) {
      console.error("[LOGIN] ✗ Login failed");
      console.error("[LOGIN] Error status:", error.response?.status);
      console.error("[LOGIN] Error message:", error.response?.data?.message || error.message);
      console.error("[LOGIN] Full error:", error);
      throw error;
    }
  };

  const signup = async ({ name, username, registerNumber, password, role }: SignupPayload) => {
    try {
      console.log("[SIGNUP] Starting signup process");
      console.log("[SIGNUP] Input data:", {
        name: name ? `[${name}]` : "[EMPTY]",
        username: username ? `[${username}]` : "[EMPTY]",
        registerNumber: registerNumber ? `[${registerNumber}]` : "[EMPTY]",
        password: password ? "[PRESENT]" : "[MISSING]",
        role: role ? `[${role}]` : "[MISSING]"
      });
      console.log("[SIGNUP] API base URL:", api.defaults.baseURL);
      console.log("[SIGNUP] Sending POST request to /auth/register");
      
      const response = await api.post("/auth/register", {
        name,
        username,
        registerNumber,
        password,
        role
      });
      
      console.log("[SIGNUP] ✓ Response received:", response.status);
      console.log("[SIGNUP] Response data keys:", Object.keys(response.data));
      console.log("[SIGNUP] User created:", response.data.user);
      console.log("[SIGNUP] ✓ Registration completed successfully");
    } catch (error: any) {
      console.error("[SIGNUP] ✗ Signup failed");
      console.error("[SIGNUP] Error status:", error.response?.status);
      console.error("[SIGNUP] Error message:", error.response?.data?.message || error.message);
      console.error("[SIGNUP] Error field:", error.response?.data?.field);
      console.error("[SIGNUP] Full error:", error);
      throw error;
    }
  };

  const updateProfile = async ({ name, registerNumber, password }: ProfilePayload) => {
    const response = await api.patch("/auth/me", { name, registerNumber, password });
    const nextUser = response.data as AuthUser;

    if (token) {
      storeSession(token, nextUser);
    } else {
      setUser(nextUser);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
