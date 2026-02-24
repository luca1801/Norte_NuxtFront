export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  pages: true,

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  runtimeConfig: {
    backendUrl: process.env.NUXT_BACKEND_URL || "http://localhost:8000",
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || "",
    },
  },

  nitro: {
    routeRules: {
      "/api/auth/**": { cors: true },
      "/api/equipment/**": { cache: false },
      "/api/events/**": { cache: false },
      "/api/bags/**": { cache: false },
      "/api/reports/**": { cache: { maxAge: 600 } },
      "/api/transactions/**": { cache: false },
      "/api/reservations/**": { cache: false },
      "/api/users/**": { cache: false },
    },
  },

  app: {
    head: {
      title: "Asset Manager - Sistema de Gerenciamento de Ativos",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Sistema completo de gerenciamento de ativos para aluguel de equipamentos de audio",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
});
