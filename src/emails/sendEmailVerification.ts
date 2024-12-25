import nodemailer from "nodemailer";
import { AppError } from "../middlewares/globalErrorMiddleware";
import { StatusCodes } from "http-status-codes";

export async function sendEmailVerification({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_ACCOUNT_PASSWORD,
      },
    });

    const mailOptions = {
      from: `${process.env.EMAIL_ACCOUNT_NAME} <${process.env.EMAIL_ACCOUNT}>`,
      to: `${to}`,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppError(
      "Error sending email",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}
