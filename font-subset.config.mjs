export default {
    scanDirs: [
        "src",
        "public",
    ],

    // Where generated subset fonts are saved
    outputDirectory: "public/webfonts",

    // Directory where generated CSS is saved
    cssDirectory: "src",

    outputs: {
        solid: "solid-subset.woff2",
        regular: "regular-subset.woff2",
        brands: "brands-subset.woff2",
    },

    extensions: [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".css",
        ".scss",
        ".html",
    ],

    fonts: [
        "brands",
        "regular",
        "solid"
    ],
};