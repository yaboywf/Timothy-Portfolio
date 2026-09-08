import Admin from "./Admin"
import { RequireAuth } from "@/components/RequireAuth"

export default function ProtectedAdmin() {
    return (
        <RequireAuth>
            <Admin />
        </RequireAuth>
    )
}