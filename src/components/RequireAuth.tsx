import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { supabase } from "../lib/supabase"

export function RequireAuth() {
    const [isLoading, setIsLoading] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        async function checkLogin() {
            const { data } = await supabase.auth.getSession()

            setIsLoggedIn(Boolean(data.session))
            setIsLoading(false)
        }

        checkLogin()

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsLoggedIn(Boolean(session))
                setIsLoading(false)
            },
        )

        return () => listener.subscription.unsubscribe()
    }, [])

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}