import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("/node_modules/")) return;
          if (id.includes("/@firebase/auth/") || id.includes("/firebase/auth/"))
            return "firebase-auth";
          if (
            id.includes("/@firebase/firestore/") ||
            id.includes("/firebase/firestore/") ||
            id.includes("/@firebase/webchannel-wrapper/")
          )
            return "firebase-firestore";
          if (id.includes("/@firebase/") || id.includes("/firebase/"))
            return "firebase-core";
          if (
            id.includes("/react-dom/") ||
            id.includes("/react/") ||
            id.includes("/scheduler/") ||
            id.includes("/react-router")
          )
            return "react";
        },
      },
    },
  },
});
