"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type AuthContextType = {
    user: any | null;
    userLoading: boolean;
    userRole: string | null;
    employeeId: number | null;
    roleLoading: boolean;

    isPlannerOrAdmin: boolean;
    isSecurityGuard: boolean;
    viewAsEmployee: boolean;
    hasMultipleRoles: boolean;

    toggleViewAsEmployee: () => void;
    refetchUser: () => Promise<void>;
    signOut: () => Promise<void>;
    signInWithCredentials: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<{ ok: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    const [userRole, setUserRole] = useState<string | null>(null);
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);

    const [viewAsEmployee, setViewAsEmployee] = useState(false);

    // Initialize viewAsEmployee from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedView = localStorage.getItem("dutygrid_view_as_employee");
            if (savedView === "true") {
                setViewAsEmployee(true);
            }
        }
    }, []);

    const fetchUser = useCallback(async () => {
        console.log("[AuthProvider] fetchUser started");
        setUserLoading(true);
        try {
            const res = await fetch("/api/custom-auth/session", { credentials: "include" });
            console.log("[AuthProvider] session fetch responded", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("[AuthProvider] session data", data.user?.email);
                setUser(data.user || null);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user session:", error);
            setUser(null);
        } finally {
            console.log("[AuthProvider] fetchUser finally completed");
            setUserLoading(false);
        }
    }, []);

    // Check Session initially
    useEffect(() => {
        console.log("[AuthProvider] Mount / initial useEffect");
        fetchUser();
    }, [fetchUser]);

    // Check Role whenever user changes
    useEffect(() => {
        console.log("[AuthProvider] Role effect triggered. userLoading:", userLoading, "user:", user?.email);
        const fetchRole = async () => {
            console.log("[AuthProvider] inside fetchRole, checking userLoading:", userLoading);
            if (userLoading) return;

            console.log("[AuthProvider] userLoading is false. user:", user);
            if (!user) {
                console.log("[AuthProvider] no user, setting roleLoading to false");
                setRoleLoading(false);
                setUserRole(null);
                setEmployeeId(null);

                // Prevent redirect loop: only redirect to signin if we are NOT on an auth page, landing page, or public routes.
                const pathname = typeof window !== "undefined" ? window.location.pathname : "";
                const publicRoutes = ["/", "/functies", "/prijzen", "/contact", "/superadmin"];
                const isPublicRoute = pathname.startsWith("/account/") || pathname.startsWith("/superadmin") || publicRoutes.includes(pathname);
                if (!isPublicRoute) {
                    window.location.href = "/account/signin";
                }
                return;
            }

            // TRIAL LOCKOUT LOGIC
            const isTrial = user.subscription_status === 'trialing';
            let trialExpired = false;

            if (isTrial && user.trial_ends_at) {
                const endDate = new Date(user.trial_ends_at);
                if (new Date() > endDate) {
                    trialExpired = true;
                }
            }

            const pathname = typeof window !== "undefined" ? window.location.pathname : "";

            if (trialExpired && !pathname.startsWith('/account/') && !pathname.startsWith("/superadmin") && !["/", "/functies", "/prijzen", "/contact"].includes(pathname)) {
                // If trial is expired, force redirect to lockout page, unless they are already on auth or public pages.
                window.location.href = "/account/trial-expired";
                return;
            }

            console.log("[AuthProvider] about to fetch /api/user-role");
            setRoleLoading(true);
            try {
                const response = await fetch("/api/user-role");
                if (response.ok) {
                    const data = await response.json();
                    if (!data.role) {
                        // User is logged in but has no role
                        if (pathname !== "/setup-role") {
                            window.location.href = "/setup-role";
                        }
                        return;
                    }
                    setUserRole(data.role);
                    setEmployeeId(data.employee_id);
                }
            } catch (err) {
                console.error("Failed to fetch user role:", err);
            } finally {
                setRoleLoading(false);
            }
        };

        fetchRole();
    }, [user, userLoading]);

    // Derived state
    const isPlannerOrAdmin = !!userRole && ["planner", "admin"].includes(userRole) && !viewAsEmployee;
    const isSecurityGuard = (!!userRole && ["beveiliger", "beveiliger_extended", "security_guard"].includes(userRole)) || viewAsEmployee;
    const hasMultipleRoles = !!userRole && ["planner", "admin"].includes(userRole) && employeeId !== null;

    const toggleViewAsEmployee = useCallback(() => {
        const newVal = !viewAsEmployee;
        setViewAsEmployee(newVal);
        if (typeof window !== "undefined") {
            localStorage.setItem("dutygrid_view_as_employee", newVal ? "true" : "false");
            window.location.reload();
        }
    }, [viewAsEmployee]);

    const signOut = useCallback(async () => {
        try {
            await fetch("/api/custom-auth/logout", { method: "POST" });
            setUser(null);
            setUserRole(null);
            setEmployeeId(null);
            window.location.href = "/account/signin";
        } catch (error) {
            console.error("Logout error:", error);
        }
    }, []);

    const signInWithCredentials = useCallback(async ({ email, password, rememberMe = false }: any) => {
        try {
            const res = await fetch("/api/custom-auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, rememberMe }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                window.location.href = "/";
                return { ok: true };
            } else {
                return { error: data.error || "Login failed", ok: false };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { error: "Network error", ok: false };
        }
    }, []);

    // 15-Minute Auto-Logout Timer (900,000 ms)
    useEffect(() => {
        if (!user) return; // Only track inactivity if user is logged in

        let timeout: ReturnType<typeof setTimeout>;

        const handleActivity = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.log("User inactive for 15 minutes, logging out...");
                signOut();
            }, 15 * 60 * 1000); // 15 minutes
        };

        // Initialize the first timer
        handleActivity();

        // Listeners for user activity
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, handleActivity));

        // Cleanup
        return () => {
            clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [user, signOut]);

    const value = {
        user,
        userLoading,
        userRole,
        employeeId,
        roleLoading,
        isPlannerOrAdmin,
        isSecurityGuard,
        viewAsEmployee,
        hasMultipleRoles,
        toggleViewAsEmployee,
        refetchUser: fetchUser,
        signOut,
        signInWithCredentials,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
