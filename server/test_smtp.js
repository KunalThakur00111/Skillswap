import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    family: 4
});

console.log(`Testing SMTP Connection to ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}...`);

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Diagnostics Error:", error);
        console.error("Stack trace:", error.stack);
    } else {
        console.log("SMTP Diagnostics Success:", success);
    }
    process.exit(0);
});
