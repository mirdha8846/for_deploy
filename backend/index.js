import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Resend } from "resend";
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
   
});
app.post('/', async (req, res) => {
    const student = req.body;

    
    if (
        !student ||
        typeof student !== 'object' ||
        !student.studentName ||
        !student.studentID ||
        !student.studentEmail ||
        !Array.isArray(student.friends) ||
        !student.reason ||
        !student.exitTime ||
        !student.entryTime
    ) {
        return res.status(400).json({ error: 'Invalid student data format.' });
    }
    console.log("route hit")
    process.env.BACKEND_URL = process.env.BACKEND_URL.replace(/\/+$/, '');
    
    // Construct the email body for the warden
    const mailBody = `
    <h3>Student Late Arrival Request</h3>
    <p>Below are the details of the student requesting permission:</p>
    <ul>
        <li><strong>Student Email:</strong> ${student.studentEmail}</li>
        <li><strong>Student Name:</strong> ${student.studentName}</li>
        <li><strong>Student ID:</strong> ${student.studentID}</li>
        <li><strong>Friends:</strong>
            <ul>
                ${student.friends
                    .map(friend => `<li>${friend.name} (Roll Number: ${friend.rollNumber})</li>`)
                    .join('')}
            </ul>
        </li>
        <li><strong>Reason:</strong> ${student.reason}</li>
        <li><strong>Exit Time:</strong> ${student.exitTime}</li>
        <li><strong>Entry Time:</strong> ${student.entryTime}</li>
    </ul>
    
    <div style="margin-top: 20px;">
        <a href="${process.env.BACKEND_URL_LOCAL}/warden-action?action=allow&student=${encodeURIComponent(JSON.stringify(student))}"
           style="display: inline-block; padding: 10px 20px; background-color: green; color: white; text-decoration: none; font-weight: bold; border-radius: 5px; margin-right: 10px;">
            Allow
        </a>
        <a href="${process.env.BACKEND_URL_LOCAL}/warden-action?action=not-allow&student=${encodeURIComponent(JSON.stringify(student))}"
           style="display: inline-block; padding: 10px 20px; background-color: red; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
            Not Allow
        </a>
    </div>
    `;
    
    try {
        // await resend.emails.send({
        //     from: 'onboarding@resend.dev',
        //     to: `${process.env.WARDEN_MAIL}`, // Warden's email
        //     subject: 'Late Arrival Request',
        //     html: mailBody,
        // });
       await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: `${process.env.WARDEN_MAIL}`,
            subject: 'Late Arrival Request',
            html: mailBody,
        })     
        console.log(student.studentEmail)
        
    
        res.status(200).json({ message: 'Email sent to warden successfully.', success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }
    
});
app.post('/verifyEmail', async (req, res) => {
    const {user}=req.body;

    if(user.email.includes("@iiitg.ac.in")===false){
        res.json({error:"Invalid Email || Email should be of IIITG domain only"})
        return;
    }
    res.json({success:true})
});

app.get('/warden-action', async (req, res) => {
    const { action, student } = req.query;

    
    if (!['allow', 'not-allow'].includes(action) || !student) {
        return res.status(400).json({ error: 'Invalid action or student details.' });
    }

    const studentDetails = JSON.parse(decodeURIComponent(student));
    
    
    // Determine the action message
    const actionMessage =
    action === 'allow'
    ? 'Your late arrival request has been approved.'
    : 'Your late arrival request has been denied.';
    
    // Construct the email body for the student
    const mailBody = `
    <h3>Late Arrival Request Response</h3>
    <p>Dear ${studentDetails.studentName},</p>
    <p>${actionMessage}</p>
    
    <p>If you have any questions, please contact your warden or teacher.</p>
    `;
    
    
    
    try {
       
        
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to:`${studentDetails.studentEmail}`,
            subject:'Late Arrival Request Response',
            html: mailBody,
            
        }).then(data=>console.log(data)).catch(err=>console.log(err));
        
        res.status(200).send(`
            <h1>Action Processed</h1>
            <p>The student has been notified successfully.</p>
            <p><strong>Action:</strong> ${action}</p>
            
        `);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send response email.', details: error.message });
    }
});




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});