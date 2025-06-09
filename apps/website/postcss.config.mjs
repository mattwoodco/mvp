import { join } from "node:path";

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: join(process.cwd(), "../../"),
    },
  },
};

export default config;
