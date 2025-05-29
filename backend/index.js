import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

async function main() {
  app.listen(config.server.port || 4000, () => {
    console.log("Server on port " + (config.server.port || 4000));
  });
}
main();
