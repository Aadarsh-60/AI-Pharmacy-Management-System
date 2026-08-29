import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './config/.env' });

// Utility function to send emails using Brevo's REST API (Bypasses SMTP port blocking)
export const sendEmail = async ({ to, subject, html }) => {
    const payload = {
        sender: {
            name: "Pharmacy Management System",
            email: process.env.BREVO_FROM_EMAIL
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_SMTP_KEY, // Uses your existing Brevo Key
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo API Error Response:', errorData);
            throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
        }

        console.log(`Email sent successfully to ${to} via API`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw new Error('Email sending failed');
    }
};

// Updated function to send 6-digit verification code email
export const sendVerificationCodeEmail = async (email, verificationCode) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0;">Pharmacy Management System</p>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Verify Your Email Address</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Thank you for registering with our Pharmacy Management System. To complete your registration, please use the verification code below:
                </p>
                
                <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                    <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Your Verification Code:</p>
                    <h1 style="color: #667eea; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${verificationCode}
                    </h1>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    • This code will expire in <strong>10 minutes</strong><br>
                    • Enter this code in the verification form to activate your account<br>
                    • If you didn't request this, please ignore this email
                </p>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email, please do not reply to this message.
                    </p>
                </div>
            </div>
        </div>
    `;

    try {
        await sendEmail({
            to: email,
            subject: 'Email Verification - Pharmacy Management System',
            html: htmlContent
        });
        console.log(`Verification code email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending verification code email to ${email}:`, error);
        throw new Error('Verification email sending failed');
    }
};

// Keep the old function for backward compatibility (but mark as deprecated)
export const sendVerificationEmail = async (email, token) => {
    console.warn('sendVerificationEmail with token is deprecated. Use sendVerificationCodeEmail instead.');

    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/api/users/verify-email?token=${token}`;

    const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
    `;

    try {
        await sendEmail({
            to: email,
            subject: 'Verify your email',
            html: message,
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

// Function to send email about expiring items
export const sendExpiryNotificationEmail = async (recipientEmail, expiringItems) => {
    if (!Array.isArray(expiringItems) || expiringItems.length === 0) {
        console.log('No expiring items to send.');
        return;
    }

    const itemsList = expiringItems.map(item => {
        return `
            Item Name: ${item.itemName}<br/>
            Batch: ${item.batch}<br/>
            Expiry Date: ${item.expiryDate.toISOString().split('T')[0]}<br/>
            Quantity: ${item.quantity}<br/>
            Purchase Rate: ${item.purchaseRate}<br/>
            MRP: ${item.mrp}<br/>
            GST Percentage: ${item.gstPercentage}<br/>
            Description: ${item.description}<br/>
            -------------------------------<br/>
        `;
    }).join('');

    try {
        await sendEmail({
            to: recipientEmail,
            subject: 'Expiring Items Notification',
            html: `The following items are expiring soon:<br/><br/>${itemsList}`
        });
        console.log(`Expiring items email sent successfully to ${recipientEmail}`);
    } catch (error) {
        console.error(`Error sending expiring items email to ${recipientEmail}:`, error);
    }
};