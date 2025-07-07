
import Axios from 'axios'; // or const Axios = require('axios');

// export const generateUniqueUsername = async (firstName, contactNo) => {
//   try {
//     let baseUsername = '';

//     if (firstName) {
//       baseUsername = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
//     } else {
//       baseUsername = 'user';
//     }

//     if (contactNo && contactNo.length >= 4) {
//       baseUsername += contactNo.slice(-4);
//     } else {
//       baseUsername += Math.floor(1000 + Math.random() * 9000);
//     }

//     // Get existing chat usernames from chat server
//     const registeredUsers = await Axios.post(
//       `http://${process.env.CHAT_SERVER_HOST}:${process.env.CHAT_SERVER_PORT}/api/registered_users`,
//       {
//         host: process.env.CHAT_SERVER_HOST,
//       },
//       {
//         auth: {
//           username: process.env.CHAT_HTTP_USERNAME,
//           password: process.env.CHAT_HTTP_PASSWORD,
//         },
//         httpsAgent,
//       }
//     );

//     const existingChatUsernames = registeredUsers?.data || [];

//     let usernameExists = true;
//     let uniqueUsername = baseUsername;
//     let counter = 0;
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (usernameExists && attempts < maxAttempts) {
//       attempts++;

//       const existingUser = await User.findOne({ username: uniqueUsername });
//       const existingSalesPerson = await SalesPerson.findOne({ username: uniqueUsername });
//       const existsInChatServer = existingChatUsernames.includes(uniqueUsername.toLowerCase());

//       if (!existingUser && !existingSalesPerson && !existsInChatServer) {
//         usernameExists = false;
//       } else {
//         counter++;
//         if (attempts % 4 === 0) {
//           uniqueUsername = baseUsername + Date.now().toString().slice(-5);
//         } else if (attempts % 4 === 1) {
//           uniqueUsername = baseUsername + Math.random().toString(36).substring(2, 5);
//         } else if (attempts % 4 === 2) {
//           uniqueUsername = baseUsername + counter + Math.floor(100 + Math.random() * 900);
//         } else {
//           uniqueUsername = baseUsername + new Date().getFullYear().toString().slice(-2) + Math.floor(1000 + Math.random() * 9000);
//         }
//       }
//     }

//     if (usernameExists) {
//       uniqueUsername = `user${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
//     }

//     return uniqueUsername;
//   } catch (error) {
//     console.error('Error generating unique username:', error);
//     return `user${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
//   }
// };



// export const discardAccountDeletionRequest = async (contact_no, action) => {
//   const preUser = await prisma.user.findFirst({
//     where: {
//       contact_no,
//     },
//   });

//   if (preUser?.deleted_at && action !== "DISCARD") {
//     return "DELETION_REQUEST_INITIATED";
//   } else if (preUser?.deleted_at && action === "DISCARD") {
//     // if user account deletion request has been initiated and Again, user loggedin before 24hrs,
//     // then deletion request will be discarded.

//     const user = await prisma.user.update({
//       where: {
//         contact_no,
//         deleted_at: {
//           not: null,
//         },
//       },
//       data: {
//         deleted_at: null,
//       },
//     });
//     return true;
//   }
// };


export const discardAccountDeletionRequest = async (contact_no, action) => {
  try {
    const preUser = await User.findOne({ contact_no });

    if (preUser?.deleted_at && action !== "DISCARD") {
      return "DELETION_REQUEST_INITIATED";
    } else if (preUser?.deleted_at && action === "DISCARD") {
      // If user logged in again before 24hrs, discard the deletion request
      const updatedUser = await UserModel.findOneAndUpdate(
        { contact_no, deleted_at: { $ne: null } },
        { $set: { deleted_at: null } },
        { new: true }
      );
      return true;
    }

    return false; // optional: return false if no deletion flag
  } catch (error) {
    console.error("Error in discardAccountDeletionRequest:", error.message);
    throw error;
  }
};