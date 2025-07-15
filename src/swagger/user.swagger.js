/**
 * @swagger
 * /sent-otp:
 *   post:
 *     summary: Send OTP to a user
 *     description: |
 *       Sends an OTP to the user's mobile number via SMS or WhatsApp depending on the `type` specified.
 *       - Handles OTP resend limit, lock time, and supports multiple gateways (SMSWALA, MSG91, Gallabox).
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact_no
 *               - action
 *             properties:
 *               contact_no:
 *                 type: string
 *                 description: Mobile number of the user
 *                 example: "9876543210"
 *               action:
 *                 type: string
 *                 description: The action triggering the OTP (e.g., login, registration)
 *                 example: "REGISTER"
 *               type:
 *                 type: string
 *                 enum: [SMS, WHATSAPP]
 *                 description: Preferred delivery method for OTP
 *                 default: SMS
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP created successfully.
 *       400:
 *         description: Bad Request (locked, resend limit exceeded, or deletion initiated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Locked for 10 mins. Try later.
 *                 status:
 *                   type: string
 *                   example: DELETION_REQUEST_INITIATED
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP and authenticate user
 *     description: |
 *       Verifies the OTP provided by the user.
 *       - If user exists and is not blocked, returns access token and chat token.
 *       - Handles account lock due to repeated failed attempts or expiry.
 *       - If user does not exist, prompts registration.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contact_no
 *               - otp
 *             properties:
 *               contact_no:
 *                 type: string
 *                 example: "9876543210"
 *                 description: Mobile number to verify
 *               otp:
 *                 type: string
 *                 example: "112233"
 *                 description: The one-time password sent to the user
 *               device_token:
 *                 type: string
 *                 example: "fcmDeviceTokenExample123"
 *                 description: Optional device token for push notifications
 *               one_signal_player_id:
 *                 type: string
 *                 example: "playerIdExample456"
 *                 description: Optional OneSignal player ID
 *     responses:
 *       200:
 *         description: OTP verification success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 chat_token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 data:
 *                   type: object
 *                   description: User object
 *                 isBlocked:
 *                   type: boolean
 *                   example: false
 *                 blockedType:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: OTP invalid, expired, locked, or too many attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP is expired. Please resend OTP.
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /adminLogin:
 *   post:
 *     summary: Admin login using email and password
 *     tags:
 *       - User Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: yourpassword123
 *     responses:
 *       200:
 *         description: Login response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64abc12345de678f90123456
 *                     contact_no:
 *                       type: string
 *                       example: "+911234567890"
 *                     name:
 *                       type: string
 *                       example: Admin Name
 *                     username:
 *                       type: string
 *                       example: adminuser
 *                     profile_image:
 *                       type: string
 *                       example: https://example.com/image.png
 *                     account_type:
 *                       type: string
 *                       example: ADMIN
 *                     referral_code:
 *                       type: string
 *                       example: REF123
 *                     referral_points:
 *                       type: number
 *                       example: 100
 *                     language:
 *                       type: string
 *                       example: ENG
 *                 role:
 *                   type: string
 *                   example: ADMIN
 *       400:
 *         description: Missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Both the fields are required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error Login By Email And Password
 *                 error:
 *                   type: string
 *                   example: Error details
 */
