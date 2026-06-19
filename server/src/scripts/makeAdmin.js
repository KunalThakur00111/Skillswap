import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const makeAdmin = async() => {
    try {
        const email = process.argv[2];

        if (!email) {
            console.log("Please provide an email");
            console.log("Example: npm run make-admin user@college.edu");
            process.exit(1);
        }

        await connectDB();

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOneAndUpdate({ email: normalizedEmail }, { role: "admin" }, {
            returnDocument: "after",
            runValidators: true
        }).select(
            "-password -verificationCode -verificationCodeExpires -verificationCodeLastSentAt -passwordResetCode -passwordResetCodeExpires -passwordResetCodeLastSentAt"
        );

        if (!user) {
            console.log("User not found");
            process.exit(1);
        }

        console.log("User promoted to admin successfully");
        console.log({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        });

        process.exit(0);
    } catch (error) {
        console.log("Failed to promote user to admin");
        console.log(error.message);
        process.exit(1);
    }
};

makeAdmin();