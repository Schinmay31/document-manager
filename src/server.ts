import { App } from "./app";

const app = new App();

const server = app.listen();
server.timeout = 3000000;
