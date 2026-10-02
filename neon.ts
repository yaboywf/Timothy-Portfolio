import { defineConfig } from "@neon/config/v1";

export default defineConfig({
    auth: true,
    dataApi: true,
    buckets: {
        "portfolio-images": {
            access: "public_read",
        },
    },

    functions: {
        image: {
            name: "Portfolio Image",
            source: "./functions/image.ts",
        },

        data: {
            name: "Portfolio Data",
            source: "./functions/data.ts",
        },

        admin: {
            name: "Admin Access",
            source: "./functions/admin.ts",
        },
    },
});
