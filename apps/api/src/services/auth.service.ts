import { transporter } from "../config/nodemailer";
import { OTP_EMAIL_HTML } from "../utils/email_templates";

export const sendOTPEmail = async (to: string, otp: string) => {
	const mailOptions = {
		to,
		subject: "Your One-Time Password (OTP)",
		html: OTP_EMAIL_HTML(otp),
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`OTP email sent to ${to}`);
	} catch (error) {
		console.error(`Error sending OTP email to ${to}:`, error);
		throw new Error("Failed to send OTP email");
	}
};
