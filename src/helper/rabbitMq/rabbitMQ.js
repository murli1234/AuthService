// helpers/rabbitmq.js
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

let connection;
let channel;

export const connectRabbitMQ = async () => {
  if (!connection) {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('✅ RabbitMQ connected');
  }
  return { connection, channel };
};

// RPC: Send request and wait for reply
export const sendRPC = async (queueName, message) => {
  console.log("📨 Sending RPC to queue:", queueName, "Message:", message);
  const { channel } = await connectRabbitMQ();
  await channel.assertQueue(queueName, { durable: false });

  const correlationId = uuidv4();

  const { queue } = await channel.assertQueue('', { exclusive: true });

  return new Promise((resolve, reject) => {
    channel.consume(
      queue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          const response = JSON.parse(msg.content.toString());
          resolve(response);
        }
      },
      { noAck: true }
    );

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      correlationId,
      replyTo: queue,
    });
  });
};