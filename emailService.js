const FIREBASE_EMAIL_URL = '/sendEmail';

function formatConfirmationMessage(user, type) {
    const name = user.username || 'Friend';
    if (type === 'signup') {
        return {
            subject: 'Welcome to Rise of the Remnant!',
            body: `Hi ${name},\n\nThank you for signing up for Rise of the Remnant. Your account is now ready to use.\n\nEnjoy daily inspiration and a fresh way to grow in faith.\n\nBlessings,\nThe Rise of the Remnant Team`
        };
    }

    return {
        subject: 'Login Confirmation from Rise of the Remnant',
        body: `Hi ${name},\n\nYou have successfully signed in to Rise of the Remnant. If this wasn't you, please secure your account immediately.\n\nPeace and grace,\nThe Rise of the Remnant Team`
    };
}

function createMailtoLink(recipient, subject, body) {
    const safeRecipient = encodeURIComponent(recipient);
    const safeSubject = encodeURIComponent(subject);
    const safeBody = encodeURIComponent(body);
    return `mailto:${safeRecipient}?subject=${safeSubject}&body=${safeBody}`;
}

async function sendEmailViaFirebase(recipient, subject, body) {
    try {
        const response = await fetch(FIREBASE_EMAIL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to_email: recipient,
                subject,
                body
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Firebase send failed');
        }

        return true;
    } catch (error) {
        console.warn('Firebase email send failed:', error);
        return false;
    }
}

async function sendEmailConfirmation(user, type) {
    if (!user || !user.email) {
        return false;
    }

    const template = formatConfirmationMessage(user, type);
    const sent = await sendEmailViaFirebase(user.email, template.subject, template.body);

    if (sent) {
        return true;
    }

    window.open(createMailtoLink(user.email, template.subject, template.body), '_blank');
    return true;
}

function sendSignupConfirmation(user) {
    return sendEmailConfirmation(user, 'signup');
}

function sendLoginConfirmation(user) {
    return sendEmailConfirmation(user, 'login');
}

// This client script expects Firebase Hosting rewrites to route /sendEmail to the Cloud Function.
// Deploy the Firebase function and configure SMTP credentials with:
// firebase functions:config:set smtp.user="YOUR_EMAIL" smtp.pass="YOUR_PASSWORD" smtp.host="smtp.gmail.com" smtp.port="465"
