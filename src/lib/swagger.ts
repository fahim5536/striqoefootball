import * as swaggerUi from "swagger-ui-express";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

let swaggerDocument: any;
try {
  const file = fs.readFileSync(path.join(process.cwd(), "src/docs/openapi.yaml"), "utf8");
  swaggerDocument = yaml.parse(file);
} catch (e) {
  // Fallback for development if file doesn't exist yet
  swaggerDocument = {
    openapi: "3.1.0",
    info: { title: "Striqo Football API", version: "1.0.0" },
    paths: {}
  };
}

export { swaggerUi, swaggerDocument };
