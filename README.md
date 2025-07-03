# be_auth_service - Backend

This is the backend service for the **be_auth_service** application, built with Node.js, Express, and MongoDB. It provides API endpoints for the application features.

Generated using a bootstrapping script.

## Features

* **Express Server:** Handles HTTP requests.
* **MongoDB Integration:** Uses Mongoose for database interactions.
* **ES Modules:** Modern JavaScript module system.
* **Environment Variables:** Configuration via `.env` file using `dotenv`.
* **Linting & Formatting:** ESLint and Prettier configured for code consistency.
* **Testing:** Jest setup for unit and potentially integration testing.
* **Structured:** Organized folder structure for scalability.
* **CORS Enabled:** Basic Cross-Origin Resource Sharing enabled.
* **Dockerized:** Ready to be built and run as a Docker container.

## Prerequisites

* Node.js (LTS version recommended, e.g., v18+)
* npm (usually comes with Node.js)
* MongoDB (running locally or accessible via URI)
* Docker (for containerization)

## Installation

1. **Clone the repository (if applicable):**

   ```bash
   # git clone <your-repo-url>
   # cd be_auth_service
   ```
2. **Install dependencies:**

   ```bash
   npm install
   ```

## Environment Variables

1. **Copy the example environment file:**

   ```bash
   cp .env.example .env
   ```
2. **Edit the `.env` file** with your specific settings:

   * `PORT`: The port the server will run on (default: 3000).
   * `MONGO_URI`: Your MongoDB connection string (default: mongodb://localhost:27017/be_auth_service).
   * Add any other necessary variables (e.g., JWT secrets, API keys).

## Running the Application

* **Development Mode (with auto-reload):**

  ```bash
  npm run dev
  ```

  This uses `nodemon` to automatically restart the server when files change.
* **Production Mode:**

  ```bash
  npm run start
  ```

  This runs the application using `node`. Ensure your `.env` file has production-ready settings.

## Running Tests

* **Run all tests:**

  ```bash
  npm test
  ```
* **Run tests with coverage report:**

  ```bash
  npm run test:coverage
  ```

  Coverage reports will be generated in the `coverage/` directory.

## Linting

* **Check for linting errors:**

  ```bash
  npm run lint
  ```
* **Optional: Fix linting errors automatically (if possible):**

  ```bash
  npm run lint -- --fix
  ```

## Docker Usage

Make sure Docker is installed and running on your system.

* **Build the Docker Image:**

  ```bash
  npm run docker:build
  # or directly: docker build -t be_auth_service .
  ```

  This will build a Docker image named `be_auth_service` based on the .
* **Run the Docker Container (detached mode):**

  ```bash
  npm run docker:run
  # or directly: docker run -p 3000:3000 -d be_auth_service
  ```

  This will run the built image as a detached container, mapping port 3000 from the container to your host.
* **Run the Docker Container (development mode - with volume mount):**

  ```bash
  npm run docker:run-dev
  # or directly: docker run -p 3000:3000 -it --rm -v $(pwd):/app be_auth_service
  ```

  This runs the container in interactive mode, removes it after exit, and mounts your current working directory into the container's  directory. This is useful for development as changes on your host will reflect inside the container without rebuilding the image.

## Project Structure

```
.
├── node_modules/     # Dependencies
├── public/           # Static assets or configuration files
│   └── config.json   # Example public config (used by logger)
├── src/              # Source code
│   ├── config/       # Environment, database config
│   │   └── database.js
│   ├── controllers/  # Request handlers
│   │   └── hello.controller.js
│   ├── middlewares/  # Express middlewares
│   │   └── hello.middleware.js
│   ├── models/       # Mongoose models (if any)
│   ├── routes/       # API route definitions
│   │   ├── index.js        # Main API router
│   │   └── hello.route.js  # Example route file
│   ├── services/     # Business logic (optional separation)
│   ├── socket/       # WebSocket logic (if any)
│   ├── tests/        # Test files (Jest)
│   │   └── hello.test.js
│   ├── utils/        # Utility functions
│   │   └── logger.js
│   ├── webhooks/     # Webhook handlers (if any)
│   └── index.js      # Application entry point
├── .env              # Local environment variables (DO NOT COMMIT)
├── .env.example      # Example environment variables
├── .eslintrc.json    # ESLint configuration
├── .gitignore        # Git ignore rules
├── .prettierrc       # Prettier configuration
├── .dockerignore     # Files to ignore when building Docker image
├── Dockerfile        # Docker build instructions
├── jest.config.js    # Jest configuration
├── package.json      # Project manifest
├── package-lock.json # Dependency lock file
└── README.md         # This file
```

## Contributing

Contributions are welcome! Please follow standard Git workflow (fork, branch, commit, pull request). Ensure tests pass and linting rules are followed.
