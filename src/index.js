import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors"; // Import cors
import { beyonderLogger } from "./utils/logger.js";
import userRouter from "./routes/user.routes.js";
import { connectDB } from "./config/database.js";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


// Load environment variables
dotenv.config();
// Determine which .env file to use based on NODE_ENV
const getEnvPath = () => {
  switch (process.env.NODE_ENV) {
    case "PROD":
      return ".env.prod";
      case "DEV":
        return ".env.dev";
        default:
          return ".env.test";
        }
      };
      
      let envFile = getEnvPath();
      
      // Load the appropriate .env file
      dotenv.config({ path: envFile });
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      console.log(
        "server.js 1 ----------- ",
        process.env.NODE_ENV,
        getEnvPath(),
        process.env.HOST,
        __dirname,
        envFile
      );
      
      
const app = express();
const PORT = process.env.PORT || 3000;

// --- Essential Middlewares ---
// Enable All CORS Requests (configure specific origins in production)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Optional: Parse URL-encoded request bodies
// app.use(express.urlencoded({ extended: true }));
app.use('/',userRouter); 

//swagger doc

// Swagger Setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'BlueCS HR portal API',
      version: '1.0.0',
      description: 'API documentation for BlueCS HR portal application',
      contact: {
        name: 'Deepanshu Sharma',
        email: 'in.prince.sharma@gmail.com',
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    servers: [ 
      {
        //when running locally
    // url:  `http://localhost:3000`,
     // url:'http://65.0.133.236:3000',
     url:`https://p3qw782za2.execute-api.ap-south-1.amazonaws.com/api/auth-service/`
     //when running in aws
      //url:`${process.env.APP_URL}`
      },
    ],
  },
  apis: [path.join(__dirname, 'swagger/*.swagger.js')]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
app.get('/uploads/:filename', (req, res) => {
  const filePath = join(dirname(__dirname), 'uploads', req.params.filename);
  return res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ message: 'File not found' });
  });
});

// --- API Routes ---


// --- Root Endpoint ---
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to the be_auth_service API! ✨" });
// });

// --- Global Error Handler (Example - Implement properly based on needs) ---
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      // Optionally include stack trace in development
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// --- Connect DB and Start Server ---
connectDB()
  .then(() => {
    app.listen(PORT, async () => {
      await beyonderLogger(); // Await the logger as it is now async
      console.log(`✅ Server listening on http://localhost:${PORT}`);
      console.log(`   MONGODB_URI: ${process.env.DATABASE_URL}`) // Log the db URI being used for confirmation
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1); // Exit if database connection fails
  });
