import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { validateLogin } from "../data/auth";
import { getUserByEmail } from "../data/users";
import type { AnyUser, UserRole } from "../interfaces/user.interface";

interface AuthContextType {
    user: AnyUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => { success: boolean; error?: string };
    logout: () => void;
    userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "facecheck_auth_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AnyUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedEmail = localStorage.getItem(STORAGE_KEY);
        if (storedEmail) {
            const storedUser = getUserByEmail(storedEmail);
            if (storedUser) {
                setUser(storedUser as AnyUser);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, password: string): { success: boolean; error?: string } => {
        // Validate against demo credentials
        const credential = validateLogin(email, password);

        if (!credential) {
            return { success: false, error: "Invalid email or password" };
        }

        // Get full user data
        const fullUser = getUserByEmail(email);

        if (!fullUser) {
            return { success: false, error: "User not found" };
        }

        // Store in localStorage and state
        localStorage.setItem(STORAGE_KEY, email);
        setUser(fullUser as AnyUser);

        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        userRole: user?.role ?? null,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
