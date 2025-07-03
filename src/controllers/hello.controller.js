/**
 * @desc    Handles the GET /api/hello request
 * @param   {import('express').Request} req Express request object
 * @param   {import('express').Response} res Express response object
 */
export const helloController = (req, res) => {
  // Access data potentially added by middleware
  const middlewareMessage = req.middlewareMessage || "Middleware ran successfully!";

  console.log("✅ Hello Controller executed");
  res.status(200).json({
    message: "Hello from the be_auth_service API!⚡",
    note: middlewareMessage,
  });
};
