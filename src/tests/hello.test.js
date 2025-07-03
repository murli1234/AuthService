import { helloController } from "../controllers/hello.controller.js";
import { jest } from "@jest/globals"; // Import jest for mocking

// Helper function to create mock Request and Response objects
const mockRequest = (customProps = {}) => ({
  ...customProps, // Allow adding custom properties like body, params, query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // Chainable status
  res.json = jest.fn().mockReturnValue(res);   // Chainable json
  return res;
};

describe("Hello Controller", () => {
  test("should respond with status 200 and correct JSON message", () => {
    const req = mockRequest(); // Use mock request
    const res = mockResponse(); // Use mock response

    helloController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: "Hello from the be_auth_service API!⚡",
      note: "Middleware ran successfully!", // Default note if middleware didn't modify req
    });
  });

  test("should include message from middleware if present on request object", () => {
    // Simulate middleware adding data to req
    const req = mockRequest({ middlewareMessage: "Custom data from middleware!" });
    const res = mockResponse();

    helloController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Hello from the be_auth_service API!⚡",
      note: "Custom data from middleware!",
    });
  });
});
