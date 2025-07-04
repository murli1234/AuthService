import otpSchema from "../models/schema/otp.schema.js";
import { generateUniqueUsername } from "../models/repository/user.repository.js";
import User from "../models/schema/user.schema.js"
import ReferralCodeSchema from "../models/schema/reference.code.js";
import salesPersonReferralCodeSchema from "../models/schema/salesPersonReferralCode.schema.js";
import jwt from "jsonwebtoken";
import * as userRepository from "../models/repository/user.repository.js";
import { sendGallaboxOTP } from "../services/whatsappService.js";
import { Axios } from "axios";
import blockedUserSchema from "../models/schema/blocked.user.schema.js";
import moment from "moment-timezone";
import bcrypt from "bcrypt";

// export const addUser = async (req, res) => {
//   try {
//     console.log("🚀 addUser called");

//     const data = req.body;
//     const files = req.files;
//     console.log("📥 Payload:", data);
//     console.log("📷 Uploaded Files:", Object.keys(files || {}));

//     if (data.have_a_bike === 'true') {
//       if (!files?.bike_image || !files?.driving_license_image || !data.bike_no) {
//         console.warn("⚠️ Missing bike details");
//         return res.status(400).json({ message: 'Bike details required' });
//       }
//     }

//     const existingUser = await User.findOne({
//       $or: [{ contact_no: data.contact_no }, { email: data.email }]
//     });
//     if (existingUser) {
//       console.warn("❌ User already exists");
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const username = await generateUniqueUsername(data.name, data.contact_no);
//     console.log("👤 Generated username:", username);

//     const otp = await otpSchema.findOne({ contact_no: data.contact_no, preUser: false, isVerified: true });
//     if (!otp) {
//       console.warn("📴 Mobile not verified");
//       return res.status(400).json({ message: 'Mobile no. not verified' });
//     }

//     const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;
//     console.log("🔐 Password hashed");

//     if(data?.referred_by_code && !data?.referred_by_code.trim() && data?.referred_by_code !== 'undefined' && data?.sales_person_referred_by_code !== 'undefined') {
//     const referral = data.referred_by_code
//       ? await ReferralCodeSchema.findOne({ code: data.referred_by_code })
//       : null;
//     const salesReferral = (data.account_type === 'COMPANY' && data.referred_by_code)
//       ? await salesPersonReferralCodeSchema.findOne({ code: data.referred_by_code })
//       : null;

//     if (data.referred_by_code && (!referral && !salesReferral)) {
//       console.warn("❌ Invalid referral code");
//       return res.status(400).json({ message: 'Invalid referral code' });
//     }
//   }
//     const newUser = new User({
//       ...data,
//       username,
//       password: hashedPassword,
//       referral_points: data?.referred_by_code ? 300 : 0,
//       referred_by: referral?.created_by,
//     });

//     await newUser.save();
//     console.log("✅ New user created with ID:", newUser._id);

//     const imageMap = {};
//     for (const field of ['profile_image', 'pan_card_image', 'bike_image', 'driving_license_image']) {
//       if (files?.[field]) {
//         const file = files[field][0];
//         const path = `user/${newUser._id}/${field}/${Date.now()}_${file.originalname}`;
//         console.log(`📤 Uploading ${field} to S3 at path:`, path);
//         const result = await uploadImageToS3(path, file.buffer, file.mimetype);
//         if (result?.result) {
//           imageMap[field] = result.result;
//           console.log(`✅ ${field} uploaded`);
//         } else {
//           console.warn(`⚠️ Failed to upload ${field}`);
//         }
//       }
//     }

//     await User.updateOne({ _id: newUser._id }, { $set: imageMap });
//     console.log("🖼️ User image fields updated");

//     await otpSchema.deleteOne({ _id: otp._id });
//     console.log("🗑️ OTP record deleted");

//     if (data.email) {
//       await sendMail({
//         to: data.email,
//         from: process.env.EMAIL_USER,
//         subject: 'Welcome to BlueHR',
//         type: 'welcome'
//       });
//       console.log("📧 Welcome email sent");
//     }

//     if (data.account_type === 'COMPANY') {
//       await Company.create({
//         company_name: data.name,
//         business_type: data.business_type,
//         user_id: newUser._id,
//         referred_by: salesReferral?.created_by
//       });
//       console.log("🏢 Company entry created");
//     }

//     const code = await generateUniqueReferralCode();
//     await ReferralCodeSchema.create({ created_by: newUser._id, code, max_usage_count: 100 });
//     console.log("🎁 Referral code created:", code);

//     const token = jwt.sign(
//       { id: newUser._id, username, account_type: data.account_type },
//       process.env.JWT_SECRET,
//       { expiresIn: '180d' }
//     );
//     console.log("🔑 JWT token generated");

//     await establishConnectionWithAdmin(newUser);
//     console.log("🤝 Admin connection established");

//     return res.status(200).json({
//       success: true,
//       message: 'User created successfully',
//       data: newUser,
//       token
//     });

//   } catch (err) {
//     console.error("🔥 Error in addUser:", err.message);
//     return res.status(500).json({ message: 'Error creating user', error: err.message });
//   }
// };

export const addUser = async (req, res) => {
  try {
    console.log("🚀 addUser called");

    const data = req.body;
    const files = req.files;
    console.log("📥 Payload:", data);
    console.log("📷 Uploaded Files:", Object.keys(files || {}));

    if (data.have_a_bike === "true") {
      if (
        !files?.bike_image ||
        !files?.driving_license_image ||
        !data.bike_no
      ) {
        console.warn("⚠️ Missing bike details");
        return res.status(400).json({ message: "Bike details required" });
      }
    }

    const existingUser = await User.findOne({
      $or: [{ contact_no: data.contact_no }, { email: data.email }],
    });
    if (existingUser) {
      console.warn("❌ User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const username = await generateUniqueUsername(data.name, data.contact_no);
    console.log("👤 Generated username:", username);

    const otp = await otpSchema.findOne({
      contact_no: data.contact_no,
      preUser: false,
      isVerified: true,
    });
    if (!otp) {
      console.warn("📴 Mobile not verified");
      return res.status(400).json({ message: "Mobile no. not verified" });
    }

    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : null;
    console.log("🔐 Password hashed");

    // Trim and handle optional referral fields
    const referralCode = data.referred_by_code?.trim() || null;
    const salesReferralCode =
      data.sales_person_referred_by_code?.trim() || null;

    let referral = null;
    let salesReferral = null;

    if (referralCode) {
      referral = await ReferralCodeSchema.findOne({ code: referralCode });
    }

    if (data.account_type === "COMPANY" && referralCode) {
      salesReferral = await salesPersonReferralCodeSchema.findOne({
        code: referralCode,
      });
    }

    if (referralCode && !referral && !salesReferral) {
      console.warn("❌ Invalid referral code");
      return res.status(400).json({ message: "Invalid referral code" });
    }

    const newUser = new User({
      ...data,
      username,
      password: hashedPassword,
      referral_points: referralCode ? 300 : 0,
      referred_by: referral?.created_by,
    });

    await newUser.save();
    console.log("✅ New user created with ID:", newUser._id);

    const imageMap = {};
    for (const field of [
      "profile_image",
      "pan_card_image",
      "bike_image",
      "driving_license_image",
    ]) {
      if (files?.[field]) {
        const file = files[field][0];
        const path = `user/${newUser._id}/${field}/${Date.now()}_${file.originalname}`;
        console.log(`📤 Uploading ${field} to S3 at path:`, path);
        const result = await uploadImageToS3(path, file.buffer, file.mimetype);
        if (result?.result) {
          imageMap[field] = result.result;
          console.log(`✅ ${field} uploaded`);
        } else {
          console.warn(`⚠️ Failed to upload ${field}`);
        }
      }
    }

    await User.updateOne({ _id: newUser._id }, { $set: imageMap });
    console.log("🖼️ User image fields updated");

    await otpSchema.deleteOne({ _id: otp._id });
    console.log("🗑️ OTP record deleted");

    // if (data.email) {
    //   await sendMail({
    //     to: data.email,
    //     from: process.env.EMAIL_USER,
    //     subject: 'Welcome to BlueHR',
    //     type: 'welcome'
    //   });
    //   console.log("📧 Welcome email sent");
    // }

    if (data.account_type === "COMPANY") {
      await Company.create({
        company_name: data.name,
        business_type: data.business_type || null,
        user_id: newUser._id,
        referred_by: salesReferral?.created_by,
      });
      console.log("🏢 Company entry created");
    }

    // const code = await generateUniqueReferralCode();
    // await ReferralCodeSchema.create({ created_by: newUser._id, code, max_usage_count: 100 });
    // console.log("🎁 Referral code created:", code);

    const token = jwt.sign(
      { id: newUser._id, username, account_type: data.account_type },
      process.env.JWT_SECRET,
      { expiresIn: "180d" }
    );
    console.log("🔑 JWT token generated");

    // await establishConnectionWithAdmin(newUser);
    // console.log("🤝 Admin connection established");

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      data: newUser,
      token,
    });
  } catch (err) {
    console.error("🔥 Error in addUser:", err.message);
    return res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { contact_no, action, type = "SMS" } = req.body;
    console.log("📩 sendOtp called with:", { contact_no, action, type });

    // Step 1: Check for deletion request
    const isDiscarded = await userRepository.discardAccountDeletionRequest(
      contact_no,
      action
    );
    console.log("🧹 Deletion request status:", isDiscarded);

    if (isDiscarded === "DELETION_REQUEST_INITIATED") {
      return res.status(400).json({
        message: "User account deletion request has been initiated already.",
        status: "DELETION_REQUEST_INITIATED",
      });
    }

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
    console.log("📋 OTP record fetched:", numberisExisting);

    if (!numberisExisting) {
      console.warn("⚠️ No OTP record found");
      return res.status(400).json({ message: "Send OTP first!" });
    }

    const curDate = new Date();
    const curDateIST = moment.tz(curDate, "Asia/Kolkata");
    const currentDate = moment(curDate);
    const lockTime = curDateIST.clone().add(60, "minutes").toDate();

    // OTP Expired
    if (
      numberisExisting.expiry_time &&
      currentDate.isAfter(numberisExisting.expiry_time)
    ) {
      console.warn("⏱️ OTP expired at:", numberisExisting.expiry_time);
      return res
        .status(400)
        .json({ message: "OTP is expired. Please resend OTP." });
    }

    // User is locked
    if (
      numberisExisting.lock_time &&
      currentDate.isBefore(numberisExisting.lock_time)
    ) {
      const diffMinutes = moment(numberisExisting.lock_time).diff(
        currentDate,
        "minutes"
      );
      console.warn(`🔒 OTP attempts locked. Wait ${diffMinutes} minutes.`);
      return res
        .status(400)
        .json({
          message: `Account locked for ${diffMinutes} mins. Try later.`,
        });
    }

    // Max Attempts
    if (numberisExisting.failure_attempts >= 3) {
      console.warn("🚫 Max failure attempts reached. Locking OTP.");
      await otpSchema.findByIdAndUpdate(numberisExisting._id, {
        preUser: false,
        isVerified: false,
        lock_time: lockTime,
        failure_attempts: 0,
      });
      return res
        .status(400)
        .json({ message: "Max attempts exceeded. Locked for 60 mins." });
    }

    // ✅ OTP Match
    if (numberisExisting.otp === otp) {
      console.log("✅ OTP matched");

      const preUser = await User.findOne({ contact_no });
      console.log("👤 User lookup:", preUser?._id || "Not Registered");

      if (preUser) {
        if (preUser.deleted_at) {
          console.warn("❌ User account deletion already requested");
          return res
            .status(400)
            .json({ message: "User account deletion was requested already." });
        }

        const isBlocked = await blockedUserSchema.findOne({
          blockedTo: preUser._id,
          status: "ADMIN_BLOCKED",
        });
        console.log("🛑 Admin block check:", isBlocked?.type || "Not Blocked");
        const {
          _id,
          name,
          username,
          email,
          contact_no,
          role,
          account_type,
          profile_image,
          referral_points,
          device_token,
          one_signal_player_id,
          language,
          registration_status,
          kyc_status,
        } = preUser.toObject(); // toObject strips Mongoose methods

        const tokenPayload = {
          _id,
          name,
          username,
          email,
          contact_no,
          role,
          account_type,
          profile_image,
          referral_points,
          device_token,
          one_signal_player_id,
          language,
          registration_status,
          kyc_status,
        };
        const token = jwt.sign(
          {
            tokenPayload,
          },
          process.env.JWT_SECRET,
          { expiresIn: "180d" }
        );

        const secKey = Buffer.from(process.env.CHAT_SERVER_SECRET, "base64");
        const chat_token = jwt.sign(
          {
            jid: `${preUser.username}@${process.env.CHAT_SERVER_HOST}`,
            exp: Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          },
          secKey,
          { noTimestamp: true }
        );

        await otpSchema.deleteMany({ contact_no });
        console.log("🗑️ Old OTP records deleted");

        if (!isBlocked) {
          await User.findByIdAndUpdate(preUser._id, {
            ...(device_token && { device_token }),
            ...(one_signal_player_id && { one_signal_player_id }),
          });
          console.log("📱 Device tokens updated");
        }

        const { deleted_at, ...userData } = preUser.toObject();

        return res.status(200).json({
          success: true,
          message: isBlocked
            ? `Your account is restricted by admin (${isBlocked.type}).`
            : "Login successful",
          token,
          data: userData,
          chat_token,
          isBlocked: !!isBlocked,
          blockedType: isBlocked?.type || null,
        });
      } else {
        console.warn("👥 OTP verified but user not found. Unregistered user.");
        await otpSchema.findByIdAndUpdate(numberisExisting._id, {
          isVerified: true,
          lock_time: null,
          preUser: false,
        });

        return res.status(200).json({
          success: true,
          message:
            "OTP verified, but user is not registered. Please complete registration.",
          token: false,
          data: null,
          chat_token: null,
        });
      }
    }

    // ❌ Invalid OTP
    console.warn("❌ Invalid OTP entered");
    await otpSchema.findByIdAndUpdate(numberisExisting._id, {
      preUser: false,
      isVerified: false,
      lock_time: null,
      failure_attempts:
        numberisExisting.failure_attempts >= 1 &&
        numberisExisting.failure_attempts < 4
          ? numberisExisting.failure_attempts + 1
          : 1,
    });

    return res.status(400).json({ message: "Invalid OTP" });
  } catch (err) {
    console.error("🔥 Error in verifyOtp:", err.message);
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};


export const getUser = async (req, res) => {
  try{

    
    const user = await User.findById(req.userId);
    return res.status(200).json({status:true, data:user, }) 
  }catch(err){
    console.error("🔥 Error in getUser:", err.message);
    return res.status(500).json({ message: "Error fetching user", error: err.message });
  }
}