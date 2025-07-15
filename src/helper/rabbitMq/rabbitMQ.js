// // helpers/rabbitmq.js
// import amqp from 'amqplib';
// import { v4 as uuidv4 } from 'uuid';

// let connection;
// let channel;

// export const connectRabbitMQ = async () => {
//   if (!connection) {
//     connection = await amqp.connect(process.env.RABBITMQ_URL);
//     channel = await connection.createChannel();
//     console.log('✅ RabbitMQ connected');
//   }
//   return { connection, channel };
// };

// // RPC: Send request and wait for reply
// export const sendRPC = async (queueName, message) => {
//   console.log("📨 Sending RPC to queue:", queueName, "Message:", message);
//   const { channel } = await connectRabbitMQ();
//   await channel.assertQueue(queueName, { durable: false });

//   const correlationId = uuidv4();

//   const { queue } = await channel.assertQueue('', { exclusive: true });

//   return new Promise((resolve, reject) => {
//     channel.consume(
//       queue,
//       (msg) => {
//         if (msg.properties.correlationId === correlationId) {
//           const response = JSON.parse(msg.content.toString());
//           resolve(response);
//         }
//       },
//       { noAck: true }
//     );

//     channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
//       correlationId,
//       replyTo: queue,
//     });
//   });
// };


// helpers/rabbitmq.js
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

let connection;
let channel;

export const connectRabbitMQ = async () => {
  try {
    if (!connection) {
      console.log("🔌 Connecting to RabbitMQ...");
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
      console.log('✅ RabbitMQ connected and channel created');
    } else {
      console.log("♻️ Reusing existing RabbitMQ connection");
    }
    return { connection, channel };
  } catch (err) {
    console.error("❌ Failed to connect to RabbitMQ:", err.message);
    throw err;
  }
};

// RPC: Send request and wait for reply
export const sendRPC = async (queueName, message) => {
  try {
    console.log("📨 Preparing to send RPC to queue:", queueName, "with message:", message);

    const { channel } = await connectRabbitMQ();

    await channel.assertQueue(queueName, { durable: false });
    console.log(`📦 Asserted target queue [${queueName}]`);

    const correlationId = uuidv4();
    const { queue } = await channel.assertQueue('', { exclusive: true });
    console.log(`📬 Created temporary exclusive reply queue: ${queue}`);
    console.log(`🔗 Correlation ID: ${correlationId}`);

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        console.error("⏳ RPC Timeout: No response received within 10 seconds");
        reject(new Error("RPC timeout: No response received"));
      }, 10000); // 10 seconds timeout

      // Consumer for reply queue
      channel.consume(
        queue,
        (msg) => {
          console.log("📥 Received message on reply queue");

          if (msg.properties.correlationId === correlationId) {
            console.log("✅ Correlation ID matched. Resolving response.");
            clearTimeout(timeout);

            const response = JSON.parse(msg.content.toString());
            console.log("🧾 Response received:", response);
            resolve(response);
          } else {
            console.warn("⚠️ Correlation ID mismatch. Ignoring message.");
          }
        },
        { noAck: true }
      );

      // Send message to target queue
      const msgBuffer = Buffer.from(JSON.stringify(message));
      channel.sendToQueue(queueName, msgBuffer, {
        correlationId,
        replyTo: queue,
      });
      console.log("📤 Message sent to queue:", queueName);
    });

  } catch (err) {
    console.error("❌ Error in sendRPC:", err.message);
    throw err;
  }
};
