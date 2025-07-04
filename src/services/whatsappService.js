import axios from "axios";

export const sendGallaboxOTP = async (phoneNumber, otp, name = "Customer") => {
  try {
    const response = await axios.post(
      "https://server.gallabox.com/devapi/messages/whatsapp",
      {
        channelId: "68417ffaa15290a985a5fbd2",
        channelType: "whatsapp",
        recipient: {
          name,
          phone: `91${phoneNumber}`,
        },
        whatsapp: {
          type: "template",
          template: {
            templateName: "send_otp",
            bodyValues: {
              otp,
            },
          },
        },
      },
      {
        headers: {
          apiKey: process.env.GALLABOX_API_KEY,
          apiSecret: process.env.GALLABOX_API_SECRET,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 5000, // 5 seconds
      }
    );

    console.log("✅ OTP sent successfully:", response.data);
  } catch (error) {
    console.error("❌ Error sending OTP:", error.response?.data || error.message);
  }
};
