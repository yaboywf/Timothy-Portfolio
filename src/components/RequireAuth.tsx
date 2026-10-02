import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { auth } from "@/lib/neon";
import { isAdminAllowed } from "@/lib/admin";

export function RequireAuth({ children }: { children: ComponentChildren }) {
    const location = useLocation();

    const [isAllowed, setIsAllowed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function checkAuth() {
            try {
                const { data } = await auth.getSession();

                if (!mounted) return;

                const email = data?.user?.email;

                if (!email) {
                    location.route("/login", true);
                    return;
                }

                const allowed = await isAdminAllowed(email);

                if (!mounted) return;

                if (!allowed) {
                    await auth.signOut();

                    location.route("/login", true);

                    return;
                }

                setIsAllowed(true);
            } catch (error) {
                console.error("Admin auth check failed:", error);

                if (mounted) {
                    location.route("/login", true);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        checkAuth();

        return () => {
            mounted = false;
        };
    }, [location]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!isAllowed) {
        return null;
    }

    return <>{children}</>;
}
