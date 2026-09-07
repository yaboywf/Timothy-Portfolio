import type { TargetedSubmitEvent } from "preact";
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "preact/hooks"
import { useLocation } from "preact-iso";
import styles from "./login.module.css"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { route } = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                route("/admin", true);
            }
        });
    }, [route]);

    async function signIn(e: TargetedSubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        setIsSubmitting(false);
        if (error) {
            alert("Invalid credentials. Please try again.")
            return
        }

        route("/admin", true);
    }

    return (
        <div className={styles.login}>
            <form onSubmit={signIn}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                />
                <button type="submit" disabled={isSubmitting}>Sign in</button>
            </form>
        </div>
    )
}