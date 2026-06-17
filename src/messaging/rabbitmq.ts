import amqplib from "amqplib";

let channel: amqplib.Channel | null = null;

const RABBITMQ_URL = process.env["RABBITMQ_URL"] ?? "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "notifications_events";

export async function connectRabbitMQ(): Promise<void> {
    try {
        const connection = await amqplib.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
        console.log("[INFO] Connected to RabbitMQ");
    } catch (error) {
        console.error("[WARN] Could not connect to RabbitMQ:", error);
    }
}

export async function publishEvent(routingKey: string, payload: unknown): Promise<void> {
    if (!channel) {
        console.warn(`[WARN] RabbitMQ channel not available. Event ${routingKey} not published.`);
        return;
    }

    try {
        const message = Buffer.from(JSON.stringify(payload));
        channel.publish(EXCHANGE_NAME, routingKey, message, { persistent: true });
        console.log(`[INFO] Event published: ${routingKey}`);
    } catch (error) {
        console.error(`[WARN] Failed to publish event ${routingKey}:`, error);
    }
}