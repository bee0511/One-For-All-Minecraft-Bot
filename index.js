const fs = require("fs");
const path = require("path");

const distEntry = path.join(__dirname, "dist", "src", "cli", "index.js");
const srcEntry = path.join(__dirname, "src", "cli", "index.js");

const entry = fs.existsSync(distEntry) ? distEntry : srcEntry;
require(entry);
