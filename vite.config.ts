import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Set SINGLE_FILE=1 to bundle the whole app into a single self-contained
// index.html (openable directly in a browser, easy to share).
// https://vite.dev/config/
export default defineConfig(() => {
  const single = process.env.SINGLE_FILE === "1";
  return {
    base: "./",
    plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  };
});
