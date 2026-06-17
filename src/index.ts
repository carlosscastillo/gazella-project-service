import express from "express"
import dotenv from "dotenv"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { swaggerOptions } from "./swagger.js"
import routes from "./routes.js"
import { globalErrorHandler } from "./handlers/error_handler.js"
import { connectRabbitMQ } from "./messaging/rabbitmq.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");

const specs = swaggerJsDoc(swaggerOptions);

async function startServer() {
    try {
        app.use(express.json());

        if (process.env["NODE_ENV"] === "development") {
            app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
        }

        app.use("/", routes);

        app.use(globalErrorHandler);

        await connectRabbitMQ();
        const PORT = process.env["PORT"] || 7100;
        app.listen(PORT, () => {
            console.log(`Project service listening on ${PORT}`);
        });
    } catch (error) {
        console.error("Failure on startup", error);
        process.exit(1);
    }
}

await startServer();
