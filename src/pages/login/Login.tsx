import { supabase } from "@/lib/supabase"
import { useState } from "react"
import styles from "./login.module.css"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    async function signIn(e: React.SubmitEvent) {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            alert("Invalid credentials. Please try again.")
        } else {
            navigate("/admin")
        }
    }

    return (
        <div className={styles.login}>
            <form onSubmit={signIn}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign in</button>
            </form>
        </div>
    )
}