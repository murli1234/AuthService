import otpSchema from "../models/schema/otp.schema.js";
import jwt from "jsonwebtoken";
import { sendGallaboxOTP } from "../services/whatsappService.js";
import { Axios } from "axios";
import moment from "moment-timezone";
import {sendRPC} from "../helper/rabbitMq/rabbitMQ.js"


export const sendOtp = async (req, res) => {
  try {
    const { contact_no, action, type = "SMS" } = req.body;
    console.log("📩 sendOtp called with:", { contact_no, action, type });

    // // Step 1: Check for deletion request
    // const isDiscarded = await userRepository.discardAccountDeletionRequest(
    //   contact_no,
    //   action
    // );
    // console.log("🧹 Deletion request status:", isDiscarded);

    // if (isDiscarded === "DELETION_REQUEST_INITIATED") {
    //   return res.status(400).json({
    //     message: "User account deletion request has been initiated already.",
    //     status: "DELETION_REQUEST_INITIATED",
    //   });
    // }

    // Step 2: Check for existing OTP
    const existingOtp = await otpSchema.findOne({ contact_no });
    console.log("📄 Existing OTP Record:", existingOtp);

    const expireMinutes = 5;
    const lockMinutes = 60;
    const now = moment().tz("Asia/Kolkata");
    const expiryTime = now.clone().add(expireMinutes, "minutes").toDate();
    const lockTime = now.clone().add(lockMinutes, "minutes").toDate();

    // Step 3: Check lock
    if (existingOtp?.lock_time && now.isBefore(existingOtp.lock_time)) {
      const diff = moment(existingOtp.lock_time).diff(now, "minutes");
      console.warn(`⏳ Account is locked for ${diff} minutes`);
      return res
        .status(400)
        .json({ message: `Locked for ${diff} mins. Try later.` });
    }

    // Step 4: Max resend count check
    if (existingOtp?.resend_count >= 5) {
      console.warn("❌ Max resend count reached. Locking for 60 mins.");
      await otpSchema.updateOne(
        { _id: existingOtp._id },
        {
          preUser: false,
          isVerified: false,
          lock_time: lockTime,
          resend_count: 0,
        }
      );
      return res
        .status(400)
        .json({ message: "Max resend count exceeded. Locked for 60 mins." });
    }

    // Step 5 & 6: Generate & (conditionally) Send OTP
    let OTP = "112233";
    const isProd = process.env.NODE_ENV === "PROD" ? true : false;
    console.log("🌍 Environment:", isProd);

    if (
      isProd &&
      !["1122334455", "1234567890", "1234567899"].includes(contact_no)
    ) {
      OTP = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("✅ [PROD] Generated OTP:", OTP);

      const count = existingOtp?.resend_count || 0;

      if (type === "WHATSAPP") {
        console.log("📤 [PROD] Sending OTP via WhatsApp using Gallabox");
        sendGallaboxOTP(contact_no, OTP);
      } else if (count === 0) {
        const smsUrl = `https://sms.smswala.in/app/smsapi/index.php?key=${process.env.SMS_WALA_KEY}&routeid=${process.env.SMS_WALA_ROUTE_ID}&senderid=${process.env.SMS_WALA_NEW_SENDER_ID}&campaign=${process.env.SMS_WALA_CAMPAIGN}&type=text&contacts=${contact_no}&msg=${encodeURIComponent(
          OTP +
            " is the OTP to login to your BlueEra account. It is valid for 5 minutes. Do not share with anyone. zULpRrKsNN3"
        )}&template_id=${BigInt(process.env.SMS_WALA_NEW_OTP_TEMPLATE_ID)}`;
        console.log("📤 [PROD] Sending SMS via SMSWALA:", smsUrl);
        Axios.get(smsUrl).catch((err) =>
          console.error("SMSWALA Error:", err.message)
        );
      } else {
        const data = {
          template_id: process.env.MSG91_TEMPLATE_ID,
          recipients: [{ mobiles: `91${contact_no}`, OTP }],
        };
        console.log("📤 [PROD] Sending SMS via MSG91:", data);
        Axios.post("https://control.msg91.com/api/v5/flow", data, {
          headers: {
            authkey: process.env.MSG91_AUTH_KEY,
            accept: "application/json",
            "content-type": "application/json",
          },
        })
          .then((res) => console.log("MSG91 Response:", res.data))
          .catch((err) =>
            console.error("MSG91 Error:", err.response?.data || err.message)
          );
      }
    } else {
      console.log("🧪 [DEV/TEST] Skipping OTP send. Using default OTP:", OTP);
    }

    // Step 7: Save or update OTP record
    if (existingOtp) {
      console.log("🔄 Updating existing OTP record");
      await otpSchema.updateOne(
        { _id: existingOtp._id },
        {
          otp: OTP,
          preUser: false,
          isVerified: false,
          resend_count:
            existingOtp.resend_count > 0 && existingOtp.resend_count < 6
              ? existingOtp.resend_count + 1
              : 1,
          expiry_time: expiryTime,
          lock_time: null,
          failure_attempts: 0,
        }
      );
    } else {
      console.log("🆕 Creating new OTP record");
      await otpSchema.create({
        contact_no,
        otp: OTP,
        resend_count: 1,
        preUser: false,
        isVerified: false,
        lock_time: null,
        expiry_time: expiryTime,
        failure_attempts: 0,
      });
    }

    console.log("✅ OTP creation process completed");
    return res.status(200).json({ message: "OTP created successfully." });
  } catch (err) {
    console.error("🔥 Error in sendOtp:", err.message);
    return res
      .status(500)
      .json({ message: "Error sending OTP", error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { contact_no, otp, device_token, one_signal_player_id } = req.body;
    console.log("📨 verifyOtp called with:", { contact_no, otp });

    const numberisExisting = await otpSchema.findOne({ contact_no });
    if (!numberisExisting) {
      return res.status(400).json({ message: "Send OTP first!" });
    }

    const currentDate = moment();
    const lockTime = currentDate.clone().add(60, "minutes").toDate();

    // Expired
    if (numberisExisting.expiry_time && currentDate.isAfter(numberisExisting.expiry_time)) {
      return res.status(400).json({ message: "OTP expired. Please resend." });
    }

    // Locked
    if (numberisExisting.lock_time && currentDate.isBefore(numberisExisting.lock_time)) {
      const diff = moment(numberisExisting.lock_time).diff(currentDate, "minutes");
      return res.status(400).json({ message: `Account locked for ${diff} mins. Try later.` });
    }

    // Too many attempts
    if (numberisExisting.failure_attempts >= 3) {
      await otpSchema.findByIdAndUpdate(numberisExisting._id, {
        preUser: false,
        isVerified: false,
        lock_time: lockTime,
        failure_attempts: 0,
      });
      return res.status(400).json({ message: "Too many attempts. Locked for 60 mins." });
    }

    // ✅ OTP Match
    if (numberisExisting.otp === otp) {
      console.log("✅ OTP matched");

      const user = await sendRPC('require_user_data', {
        action: 'GET_USER_BY_CONTACT',
        contact_no,
      });
      console.log("📋 User fetched:", user);
      
      if (!user || user.deleted_at) {
        return res.status(200).json({
          success: false,
          user:false,
          message: "No User Found. Create A New User",
        });
      }

      // Admin block check (optional, could be part of user payload from RabbitMQ too)
      const isBlocked = user?.blocked_type === "ADMIN_BLOCKED"; // if you add that in RabbitMQ response


      const payload = {
  _id: user._id,
  contact_no: user.contact_no,
};
if (user.username) payload.username = user.username;
if (user.name) payload.name = user.name;
if (user.role) payload.role = user.role;
if (user.account_type) payload.account_type = user.account_type;
if (user.language) payload.language = user.language;
if (user.referral_code) payload.referral_code = user.referral_code;
if (user.referral_points !== undefined) payload.referral_points = user.referral_points;
if (user.profile_image) payload.profile_image = user.profile_image;

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: "180d",
});


      // Clean up old OTP
      await otpSchema.deleteMany({ contact_no });


      //sending RPC to update user device token

      
      return res.status(200).json({
        success: true,
        message: isBlocked
          ? "Your account is restricted by admin."
          : "Login successful",
        token,
        user:user._id,
        chat_token: null, // You can implement chat_token generation later
        isBlocked,
        blockedType: isBlocked ? "ADMIN_BLOCKED" : null,
      });
    }

    // ❌ Invalid OTP
    const updatedAttempts =
      numberisExisting.failure_attempts >= 1 && numberisExisting.failure_attempts < 4
        ? numberisExisting.failure_attempts + 1
        : 1;

    await otpSchema.findByIdAndUpdate(numberisExisting._id, {
      preUser: false,
      isVerified: false,
      lock_time: null,
      failure_attempts: updatedAttempts,
    });

    return res.status(400).json({ message: "Invalid OTP", status: false });
  } catch (err) {
    console.error("🔥 Error in verifyOtp:", err.message); 
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};

