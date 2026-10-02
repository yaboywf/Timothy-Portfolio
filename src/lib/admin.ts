// src/lib/admin.ts

const ADMIN_URL = import.meta.env.VITE_NEON_ADMIN_URL.replace(/\/$/, "");

export async function isAdminAllowed(email: string): Promise<boolean> {
    const response = await fetch(`${ADMIN_URL}/allowed?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
        throw new Error(`Admin check failed: ${response.status}`);
    }

    const data: {
        allowed: boolean;
    } = await response.json();

    return data.allowed;
}
