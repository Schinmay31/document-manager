import { config } from "dotenv";
config({ path: `.env` });

const DOT_ENV = {
  PORT: process.env.PORT,
  REQUEST_LIMIT: process.env.REQUEST_LIMIT,
  WINDOW_MS: process.env.WINDOW_MS,
  COOLDOWN_MS: process.env.COOLDOWN_MS,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
};

export default DOT_ENV;
