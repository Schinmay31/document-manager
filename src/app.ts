import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import http from "http";
import {errorHandler} from "./middleware/errorHandler.middleware";
import DOT_ENV from "./config-env";
import { rateLimiter } from "./middleware/rateLimitter.middleware";
import { router as Routes } from "./routes/index";
import connectDB from "./config/databse.connection";
import { authorize } from "./middleware/authorize.middleware";
import { excludedPaths } from "./constants/auth.constants";

export class App {
  public app: express.Application;
  public port: string | number;
  private server: any;

  constructor() {
    this.app = express();
    this.port = DOT_ENV.PORT || 3000;
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.server = this.createServer();
  }

  private initializeMiddlewares() {
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: "*",
      })
    );
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(
      express.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 20000,
      })
    );
    this.app.use(cookieParser());
    this.app.use(rateLimiter);
  }

  private async initializeRoutes() {
    this.app.use(authorize(excludedPaths)); // Apply authorization middleware
    this.app.use("/", Routes); // Main router
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  private connectToDatabase() {
    const modelURI =
      String(DOT_ENV.MONGO_URI) || "mongodb://localhost:27017/document_manager";
    connectDB(modelURI);
  }
  private createServer() {
    return http.createServer(this.app);
  }

  // Start the server
  public listen() {
    this.server.listen(this.port, () => {
      console.log(`App is listening on port ${this.port}`);
    });
    return this.server;
  }
}

