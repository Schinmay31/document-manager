import { config } from "dotenv";
config({ path: `.env` });

const DOT_ENV = {
  PORT: process.env.PORT,
  REQUEST_LIMIT: process.env.REQUEST_LIMIT,
  WINDOW_MS: process.env.WINDOW_MS,
  COOLDOWN_MS: process.env.COOLDOWN_MS,
};

export default DOT_ENV;
