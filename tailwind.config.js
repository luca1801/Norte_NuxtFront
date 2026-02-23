/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./app/**/*.{js,vue,ts}"],
  theme: {
    extend: {},
  },
  // daisyUI v5 is configured via plugin options (not via a top-level `daisyui` key).
  plugins: [
    daisyui({
      logs: false,
      themes: ["light", "dark --prefersdark", "acid", "silk", "synthwave --default"],
    }),
  ],
};

