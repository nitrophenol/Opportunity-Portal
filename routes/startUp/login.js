import express from "express"
const router = express.Router()
import StartUp from '../../models/startUp/register.js';

// OTP
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
const transporter = nodemailer.createTransport(smtpTransport({
    host: 'email-smtp.ap-south-1.amazonaws.com',
    port: 465,
    auth: {
        user: 'AKIAZJ2NPFB7G5TKIDNR',
        pass: 'BJcAh3Yfhc06dt1k18tNTIAYbWraXxnD9OYzjmEeAqYE'
    }
}));

//POST
router.post('/', async (req, res) => {
    try {
        const startUpDetails = await StartUp.findOne({ email: req.body.email })
        if (startUpDetails === null) {
            res.status(401).json({
                status: 401,
                message: "Account does not exist"
            })
        }
        else {
            const otp = otpGenerator.generate(6, { digits:true,lowerCaseAlphabets:false, upperCaseAlphabets: false, specialChars: false });
            const findAndUpdateStartup=await StartUp.findOneAndUpdate({email:req.body.email},{
                $set:{
                    otp: otp
                }
            },{ 'new': true })
            res.status(200).json({
                status: 200,
                startUpDetails: findAndUpdateStartup
            })
            var mailOptions = {
                from: "opportunity.portal.edciitd@gmail.com",
                to: findAndUpdateStartup.email,
                subject: "Your One-Time Password (OTP) for Sign In Verification",
                html: `
                    Dear ${findAndUpdateStartup.companyName},<br><br>
                    To complete your sign in process, we require you to enter a One-Time Password (OTP) which has been generated exclusively for you.<br><br>
                    Please enter the following OTP to complete the sign in process: <b>${findAndUpdateStartup.otp}</b><br><br>
                    If you did not initiate this sign-in request, please disregard this email and notify our customer support team immediately at <u>opportunity.portal.edciitd@gmail.com</u><br><br>
                    Thank you for choosing to sign in. We look forward to providing you with a seamless and enjoyable experience.<br><br>
                    Best regards,<br>
                    eDC IIT Delhi<br>
               `
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
            });
        }
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

//OTP Verify
router.post('/otp/verify', async (req, res) => {
    try {
        const startUpDetails = await StartUp.findOne({ email: req.body.email })
        if (startUpDetails.otp === req.body.otp) {
            res.status(200).json({
                status: 200,
                startUpDetails: startUpDetails
            })
        }
        else {
            res.status(401).json({
                status: 401,
                message: "Wrong OTP"
            })
        }
    }
    catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        })
    }
})

export default router