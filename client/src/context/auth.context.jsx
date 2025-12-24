import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Auto-login on mount using cookie
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API}/auth/me`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch {
                // Not logged in
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = useCallback(async (username, password) => {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        setUser(data);
        return data;
    }, []);

    const signup = useCallback(async (username, password) => {
        const res = await fetch(`${API}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error("Signup failed");
        return res.json();
    }, []);

    const logout = useCallback(async () => {
        await fetch(`${API}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
