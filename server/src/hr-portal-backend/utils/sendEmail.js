const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    // Define the email message
    const msg = {
        to: options.to,
        cc: options.cc,
        from: {
            email: process.env.FROM_EMAIL,
            name: 'AVANI ENTERPRISES'
        },
        subject: options.subject,
        html: options.html,
    };

    // Send the email
    try {
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid');
    } catch (error) {
        console.error('Error sending email via SendGrid:', error);

        if (error.response) {
            console.error(error.response.body);
        }

        const statusCode = error?.code || error?.response?.statusCode || error?.response?.status;
        const sgErrors = error?.response?.body?.errors;
        const sgMessage =
            Array.isArray(sgErrors) && sgErrors.length > 0 && sgErrors[0]?.message
                ? sgErrors[0].message
                : undefined;

        throw new Error(
            sgMessage
                ? `SendGrid error${statusCode ? ` (${statusCode})` : ''}: ${sgMessage}`
                : `Email could not be sent via SendGrid${statusCode ? ` (${statusCode})` : ''}. Please check server logs.`
        );
    }
};

module.exports = sendEmail;