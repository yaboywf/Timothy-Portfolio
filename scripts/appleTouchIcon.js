import fs from "fs";
import https from "https";

const TARGET = "https://dylanyeowf.pages.dev";

const API = `https://api.microlink.io/?url=${encodeURIComponent(TARGET)}&screenshot=true&meta=false`;

// Paths to save
const OUTPUT_PATHS = [
    "./public/images/apple-touch-icon.png",
    "./public/images/projects/portfolio.png" // <--- add as many paths as you want
];

https.get(API, res => {
    let data = "";
    res.on("data", chunk => data += chunk);

    res.on("end", () => {
        const json = JSON.parse(data);
        const screenshotUrl = json.data.screenshot.url;

        https.get(screenshotUrl, imgRes => {
            // Save to all output paths
            OUTPUT_PATHS.forEach(path => {
                const file = fs.createWriteStream(path);
                imgRes.pipe(file);

                file.on("finish", () => {
                    file.close();
                    console.log(`✔ Saved: ${path}`);
                });
            });
        });
    });
});
