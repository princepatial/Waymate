import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, name, otp) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"WayMate" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Verification Code - WayMate",
        html: `
            <!DOCTYPE html>
            <html>
                <body style="
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                ">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table width="500" cellpadding="0" cellspacing="0" style="
                                    background-color: #ffffff;
                                    border-radius: 12px;
                                    overflow: hidden;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                ">
                                    <!-- Header -->
                                   <!-- Logo area -->
                                    <tr>
                              <td align="center" style="padding: 36px 48px 0px 48px;">
                             <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                               <tr>
                          <td style="font-size:22px; font-weight:700; color:#4F46E5; letter-spacing:1px; vertical-align:middle;">WayMate</td>
                           <td style="font-size:26px; line-height:1; vertical-align:middle; padding-left:8px;">🛣️</td>
                         </tr>
                        </table>
                  <p style="margin:6px 0 0 0; font-size:12px; color:#9ca3af; letter-spacing:2px; text-transform:uppercase;">Your Journey Companion</p>
                    </td>
                      </tr>

                                    <!-- Body -->
                                    <tr>
                                        <td style="padding: 40px 32px;">
                                            <h2 style="
                                                color: #1f2937;
                                                margin: 0 0 8px 0;
                                                font-size: 22px;
                                            ">Hi ${name}</h2>
                                            <p style="
                                                color: #6b7280;
                                                font-size: 15px;
                                                line-height: 1.6;
                                                margin: 0 0 32px 0;
                                            ">
                                                Welcome to WayMate! Use the OTP below to verify
                                                your email address and activate your account.
                                            </p>

                                            <!-- OTP Box -->
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td align="center">
                                                        <div style="
                                                            background-color: #f5f3ff;
                                                            border: 2px dashed #4F46E5;
                                                            border-radius: 12px;
                                                            padding: 24px;
                                                            display: inline-block;
                                                        ">
                                                            <p style="
                                                                margin: 0 0 8px 0;
                                                                color: #6b7280;
                                                                font-size: 13px;
                                                                text-transform: uppercase;
                                                                letter-spacing: 1px;
                                                            ">Your verification code</p>
                                                            <h1 style="
                                                                margin: 0;
                                                                color: #4F46E5;
                                                                font-size: 42px;
                                                                letter-spacing: 12px;
                                                            ">${otp}</h1>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Expiry Warning -->
                                            <p style="
                                                text-align: center;
                                                color: #ef4444;
                                                font-size: 13px;
                                                margin: 20px 0 32px 0;
                                            ">⏱ This code expires in <strong>10 minutes</strong></p>

                                            <!-- Divider -->
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;" />

                                            <!-- Security Note -->
                                            <p style="
                                                color: #9ca3af;
                                                font-size: 13px;
                                                line-height: 1.6;
                                                margin: 0;
                                            ">
                                                If you did not create a WayMate account,
                                                you can safely ignore this email.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td align="center" style="
                                            background-color: #f9fafb;
                                            padding: 20px;
                                            border-top: 1px solid #e5e7eb;
                                        ">
                                            <p style="
                                                color: #9ca3af;
                                                font-size: 12px;
                                                margin: 0;
                                            ">© 2026 WayMate. All rights reserved.</p>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>
        `
    });
};