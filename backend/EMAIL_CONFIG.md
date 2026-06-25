# Email Configuration

The AfriFund platform now includes an email notification system that sends emails for important events like campaign approvals, KYC updates, pledges, and more.

## Email Service Features

- **Welcome Emails**: Sent when users register
- **Campaign Notifications**: Creation, approval, rejection, funding milestones
- **KYC Notifications**: Verification approval/rejection
- **Pledge Notifications**: New pledges received, payment completed
- **Certificate Notifications**: When certificates are ready
- **Mentor Notifications**: Session completions
- **Payout Notifications**: When payouts are processed

## Development Setup

In development, the email service automatically uses **Ethereal Email** (https://ethereal.email/) - a fake SMTP service for testing. No configuration is needed.

When an email is sent in development:
- Check the console logs for the Ethereal preview URL
- Click the URL to view the email in a web browser
- All emails are caught and displayed, never actually delivered

## Production Setup

For production, configure the following environment variables in your `.env` file:

### Required Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.sendgrid.net        # Or your email provider's SMTP host
SMTP_PORT=587                      # Usually 587 for TLS, 465 for SSL
SMTP_USER=apikey                   # Your SMTP username (SendGrid uses 'apikey')
SMTP_PASS=your_sendgrid_api_key   # Your SMTP password or API key

# Email Sender
SMTP_FROM_EMAIL=noreply@afrifund.com
SMTP_FROM_NAME=AfriFund

# Application URL (for email links)
APP_URL=https://afrifund.vercel.app
```

### Recommended Email Providers

#### 1. **SendGrid** (Recommended)
- Free tier: 100 emails/day
- Excellent deliverability
- Easy setup
- Setup:
  1. Sign up at https://sendgrid.com
  2. Create an API key
  3. Set `SMTP_HOST=smtp.sendgrid.net`, `SMTP_USER=apikey`, `SMTP_PASS=<your_api_key>`

#### 2. **Mailgun**
- Free tier: 5,000 emails/month for first 3 months
- Good for transactional emails
- Setup:
  1. Sign up at https://mailgun.com
  2. Get SMTP credentials
  3. Set SMTP_HOST, SMTP_USER, SMTP_PASS from Mailgun dashboard

#### 3. **AWS SES**
- Very cheap ($0.10 per 1,000 emails)
- Requires domain verification
- Good for high volume

#### 4. **Gmail SMTP** (Not recommended for production)
- Free but limited (500 emails/day)
- Not reliable for transactional emails
- Risk of being flagged as spam

## Email Templates

Email templates are defined in `/backend/src/modules/email/templates/email-templates.ts`. Each notification type has:
- Custom subject line
- Branded HTML template with icons and styling
- Plain text fallback
- Action button linking to relevant page

### Customizing Templates

To customize email appearance:
1. Edit the `baseStyles` in `email-templates.ts`
2. Modify the `getBaseTemplate()` function for layout changes
3. Update individual notification cases for content changes

## Testing Emails

### Development Testing
```bash
# Start the backend
cd backend
npm run start:dev

# Register a new user or trigger an event
# Check console for Ethereal preview URL
```

### Production Testing
```bash
# Set production SMTP credentials in .env
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your_key

# Test with a real email address
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test@email.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "CREATOR"
  }'
```

## Email Events

The system listens to the following events:

| Event | Description | Recipient |
|-------|-------------|-----------|
| `user.registered` | Welcome email | New user |
| `campaign.created` | Campaign submitted | Creator |
| `campaign.approved` | Campaign approved | Creator |
| `campaign.rejected` | Campaign not approved | Creator |
| `campaign.funded` | Funding goal reached | Creator |
| `pledge.completed` | New pledge received | Creator |
| `payment.completed` | Payment processed | Backer |
| `kyc.approved` | KYC verification passed | User |
| `kyc.rejected` | KYC verification failed | User |
| `certificate.issued` | Certificate ready | User |
| `mentor.session.completed` | Session completed | Creator |
| `payout.processed` | Payout completed | Creator |

## Troubleshooting

### Emails not sending

1. **Check logs**: Look for "Email sent to" or error messages
2. **Verify SMTP credentials**: Test with a SMTP testing tool
3. **Check firewall**: Ensure outbound SMTP port (587/465) is open
4. **SPF/DKIM**: Configure DNS records for better deliverability

### Emails going to spam

1. **Use a verified domain**: Set up SPF, DKIM, and DMARC records
2. **Warm up your domain**: Start with low volume and increase gradually
3. **Use a reputable provider**: SendGrid/Mailgun handle this automatically
4. **Avoid spam triggers**: Don't use ALL CAPS, excessive exclamation marks, etc.

### Rate limits exceeded

1. **Upgrade your plan**: Most providers offer higher tiers
2. **Implement queuing**: Use Bull queues (already configured) to batch emails
3. **Reduce frequency**: Consolidate notifications into digest emails

## Security Best Practices

1. **Never commit SMTP credentials**: Use environment variables only
2. **Use API keys instead of passwords**: Especially for SendGrid/Mailgun
3. **Rotate credentials regularly**: Update API keys every 3-6 months
4. **Monitor usage**: Set up alerts for unusual sending patterns
5. **Validate email addresses**: Already implemented with class-validator

## Production Deployment (Vercel)

To deploy with email support:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the SMTP configuration variables
4. Redeploy the backend

The email service will automatically use production SMTP when configured, and fall back to Ethereal in development.
