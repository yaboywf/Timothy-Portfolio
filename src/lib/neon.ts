import { BetterAuthVanillaAdapter, createClient } from "@neondatabase/neon-js";

const neon = createClient({
    auth: {
        adapter: BetterAuthVanillaAdapter(),
        url: import.meta.env.VITE_NEON_AUTH_URL,
    },
    dataApi: {
        url: import.meta.env.VITE_NEON_DATA_API_URL,
    },
});

export const auth = neon.auth;

export async function getAuthToken(): Promise<string> {
    const response = await fetch(`${import.meta.env.VITE_NEON_AUTH_URL}/token`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to get auth token: ${response.status}`);
    }

    const data: {
        token?: string;
    } = await response.json();

    if (!data.token) {
        throw new Error("No auth token returned");
    }

    return data.token;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getAuthToken();

    return {
        Authorization: `Bearer ${token}`,
    };
}

// export async function neonSelect<T>(table: string): Promise<T[]> {
//     const { data, error } = await neon.from(table).select("*");

//     if (error) {
//         throw error;
//     }

//     return (data ?? []) as T[];
// }

export async function neonSelect<T>(table: string): Promise<T[]> {
    let route: string;

    if (table === "Projects") {
        route = "projects";
    } else if (table === "General") {
        route = "general";
    } else {
        throw new Error(`Unsupported table: ${table}`);
    }

    const response = await fetch(`${import.meta.env.VITE_NEON_DATA_URL}/${route}`);

    if (!response.ok) {
        throw new Error(`Neon Function error: ${response.status} ${await response.text()}`);
    }

    return response.json();
}

export async function neonInsert<T>(table: string, data: unknown): Promise<T[]> {
    const { data: result, error } = await neon.from(table).insert(data).select();

    if (error) {
        throw error;
    }

    return (result ?? []) as T[];
}

export async function neonUpdate<T>(table: string, filter: string, data: unknown): Promise<T[]> {
    const [column, expression] = filter.split("=eq.");

    if (!column || expression === undefined) {
        throw new Error(`Unsupported filter: ${filter}`);
    }

    const value = decodeURIComponent(expression);

    const { data: result, error } = await neon.from(table).update(data).eq(column, value).select();

    if (error) {
        throw error;
    }

    return (result ?? []) as T[];
}

export async function neonDelete(table: string, filter: string): Promise<void> {
    const [column, expression] = filter.split("=eq.");

    if (!column || expression === undefined) {
        throw new Error(`Unsupported filter: ${filter}`);
    }

    const value = decodeURIComponent(expression);

    const { error } = await neon.from(table).delete().eq(column, value);

    if (error) {
        throw error;
    }
}
