import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = 'notifications@domainliq.com';
const FROM_NAME = 'DomainLiq Notifications';

interface ChatNotificationParams {
    sellerEmail: string;
    sellerName: string;
    domainName: string;
    visitorName?: string;
    visitorEmail?: string;
    messagePreview: string;
    chatUrl: string;
}

/**
 * Send email notification to seller when they receive their first chat message
 */
export async function sendChatNotification(params: ChatNotificationParams): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('[SendGrid] No API key configured, skipping email');
        return false;
    }

    const {
        sellerEmail,
        sellerName,
        domainName,
        visitorName,
        visitorEmail,
        messagePreview,
        chatUrl,
    } = params;

    const visitorDisplay = visitorName || visitorEmail || 'A visitor';
    const truncatedMessage = messagePreview.length > 150
        ? messagePreview.substring(0, 150) + '...'
        : messagePreview;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #f59e0b; padding: 24px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                                💬 New Chat Message
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px 24px;">
                            <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
                                Hi ${sellerName || 'there'},
                            </p>
                            <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
                                ${visitorDisplay} sent you a message about <strong>${domainName}</strong>:
                            </p>
                            
                            <!-- Message Preview -->
                            <div style="background-color: #f9fafb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                                <p style="margin: 0; color: #4b5563; font-size: 14px; font-style: italic;">
                                    "${truncatedMessage}"
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="${chatUrl}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                            Reply to Message
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                You received this because someone messaged you on DomainLiq.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    try {
        await sgMail.send({
            to: sellerEmail,
            from: {
                email: FROM_EMAIL,
                name: FROM_NAME,
            },
            subject: `💬 New message about ${domainName}`,
            html,
        });

        console.log(`[SendGrid] Chat notification sent to ${sellerEmail} for ${domainName}`);
        return true;
    } catch (error: any) {
        console.error('[SendGrid] Failed to send chat notification:', error?.response?.body || error.message);
        return false;
    }
}
