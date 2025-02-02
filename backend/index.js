import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Resend } from "resend";
dotenv.config();
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const resend = new Resend(process.env.RESEND_API_KEY);
app.post('/', async (req, res) => {
    const student = req.body;

    // Validate the incoming object
    if (
        !student ||
        typeof student !== 'object' ||
        !student.studentName ||
        !student.studentID ||
        !Array.isArray(student.friends) ||
        !student.reason ||
        !student.exitTime ||
        !student.entryTime
    ) {
        return res.status(400).json({ error: 'Invalid student data format.' });
    }

    // Construct the email body for the warden
    const mailBody = `
        <h3>Student Late Arrival Request</h3>
        <p>Below are the details of the student requesting permission:</p>
        <ul>
            <li><strong>Student Name:</strong> ${student.studentName}</li>
            <li><strong>Student ID:</strong> ${student.studentID}</li>
            <li><strong>Friends:</strong>
                <ul>
                    ${student.friends
                        .map(
                            friend => `
                                <li>${friend.name} (Roll Number: ${friend.rollNumber})</li>
                            `
                        )
                        .join('')}
                </ul>
            </li>
            <li><strong>Reason:</strong> ${student.reason}</li>
            <li><strong>Exit Time:</strong> ${student.exitTime}</li>
            <li><strong>Entry Time:</strong> ${student.entryTime}</li>
        </ul>
        <p>Action links for the warden:</p>
        <a href="${process.env.BACKEND_URL}/warden-action?action=allow&student=${encodeURIComponent(
            JSON.stringify(student)
        )}" 
           style="padding: 10px 20px; background-color: green; color: white; text-decoration: none;">Allow</a>
        <a href="${process.env.BACKEND_URL}/warden-action?action=not-allow&student=${encodeURIComponent(
            JSON.stringify(student)
        )}"
           style="padding: 10px 20px; background-color: red; color: white; text-decoration: none;">Not Allow</a>
    `;

    try {
        // Send email to the warden
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'pankajmirdha303@gmail.com', // Warden's email
            subject: 'Late Arrival Request',
            html: mailBody,
        });

        res.status(200).json({ message: 'Email sent to warden successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }
});

app.get('/warden-action', async (req, res) => {
    const action = req.query.action;
    const student = req.query.student;

    if (!['allow', 'not-allow'].includes(action) || !student) {
        return res.status(400).json({ error: 'Invalid action or student details.' });
    }

    try {
        // Parse the student object
        const studentDetails = JSON.parse(student);
        console.log(studentDetails);
        // Construct the email body for the student
        const actionMessage =
            action === 'allow'
                ? 'Your late arrival request has been approved.'
                : 'Your late arrival request has been denied.';
        const mailBody = `
            <h3>Late Arrival Request Response</h3>
            <p>Dear ${studentDetails.name},</p>
            <p>${actionMessage}</p>
            <p>Reason: ${studentDetails.reason}</p>
        `;

        // Send email to the student
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'pankajmirdha303@gmail.com', // Email of the student
            subject: 'Late Arrival Request Response',
            html: mailBody,
        });

        // Respond with success message
        res.status(200).send(`
            <h1>Action Processed</h1>
            <p>The student has been notified successfully.</p>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send response email.', details: error.message });
    }

});




app.listen(5000, () => {
    console.log('Server is running on port 5000');
});