/**
 * @swagger
 * /api/add-user:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Register a new user account with optional referral code and image uploads.
 *       Verifies OTP and stores uploaded images to AWS S3.
 *       Returns a JWT token upon successful registration.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact_no
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 description: Optional email address
 *               contact_no:
 *                 type: string
 *                 description: Mobile number of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Optional password (if set)
 *               account_type:
 *                 type: string
 *                 enum: [PERSONAL, COMPANY]
 *                 description: Account type (default PERSONAL)
 *               business_type:
 *                 type: string
 *                 description: Required only if account_type is COMPANY
 *               have_a_bike:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 description: Set true if user owns a bike
 *               bike_no:
 *                 type: string
 *                 description: Required if have_a_bike is true
 *               referred_by_code:
 *                 type: string
 *                 description: Optional referral code from another user
 *               profile_image:
 *                 type: string
 *                 format: binary
 *                 description: Upload profile image
 *               pan_card_image:
 *                 type: string
 *                 format: binary
 *                 description: Upload PAN card image
 *               bike_image:
 *                 type: string
 *                 format: binary
 *                 description: Upload bike image if have_a_bike is true
 *               driving_license_image:
 *                 type: string
 *                 format: binary
 *                 description: Upload driving license image if have_a_bike is true
 *     responses:
 *       200:
 *         description: User created successfully
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
 *                   example: User created successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad Request (validation failed, user exists, invalid OTP, etc.)
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /api/sent-otp:
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
 * /api/verify-otp:
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
 * /api/get-user:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Successfully fetched user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error while fetching user
 */
