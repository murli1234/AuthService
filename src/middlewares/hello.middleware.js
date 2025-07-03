/**
 * Example middleware for the hello route.
 * @param {import('express').Request} req Express request object
 * @param {import('express').Response} res Express response object
 * @param {import('express').NextFunction} next Express next function
 */
export const helloMiddleware = (req, res, next) => {
  console.log("🌀 Hello Middleware triggered for route:", req.originalUrl);

  // Example: You could add data to the request object
  req.middlewareMessage = "Data added by helloMiddleware!";

  // Continue to the next middleware or route handler
  next();
};
