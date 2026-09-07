import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks"
import { useLocation } from "preact-iso"
import { supabase } from "../lib/supabase"

export function RequireAuth({ children }: { children: ComponentChildren }) {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true;

        async function checkLogin() {
            const { data } = await supabase.auth.getSession()
            if (!isMounted) return;

            const hasSession = Boolean(data.session)
            setIsLoggedIn(hasSession)
            setIsLoading(false)

            if (!hasSession) {
                location.route("/login", true);
            }
        }

        checkLogin()

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!isMounted) return;

                const hasSession = Boolean(session)
                setIsLoggedIn(hasSession)
                setIsLoading(false)

                if (!hasSession) {
                    location.route("/login", true);
                }
            },
        )

        return () => {
            isMounted = false;
            listener.subscription.unsubscribe()
        }
    }, [location])

    if (isLoading) return <p>Loading...</p>
    if (!isLoggedIn) return null

    return <>{children}</>
}