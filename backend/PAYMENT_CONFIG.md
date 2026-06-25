# Payment Integration Configuration

AfriFund supports multiple payment providers for accepting pledges across Africa. This guide covers setup for Flutterwave, Paystack, M-Pesa, and the Mock provider for testing.

## Supported Payment Providers

| Provider | Regions | Currencies | Best For |
|----------|---------|------------|----------|
| **Flutterwave** | All Africa + Global | 150+ currencies | Pan-African coverage, cards, mobile money |
| **Paystack** | Nigeria, Ghana, South Africa | NGN, GHS, ZAR, USD | West Africa, cards, bank transfers |
| **M-Pesa** | Kenya, Tanzania, others | KES, TZS, etc. | East Africa, mobile money |
| **Mock** | Development | All | Testing without real transactions |

---

## Environment Variables

### Flutterwave Configuration

Sign up at https://flutterwave.com/

```env
# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret_hash
FLUTTERWAVE_REDIRECT_URL=https://yourdomain.com/payment/callback
```

**Setup Steps:**
1. Create account at https://dashboard.flutterwave.com/signup
2. Navigate to Settings → API Keys
3. Copy Public Key and Secret Key
4. Set webhook URL: https://yourdomain.com/api/payments/webhook/flutterwave
5. Copy webhook secret hash

**Test Credentials (Sandbox):**
- Public Key: `FLWPUBK_TEST-xxxxx`
- Secret Key: `FLWSECK_TEST-xxxxx`
- Test Cards: https://developer.flutterwave.com/docs/integration-guides/testing-helpers/

---

### Paystack Configuration

Sign up at https://paystack.com/

```env
# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=https://yourdomain.com/payment/callback
```

**Setup Steps:**
1. Create account at https://dashboard.paystack.com/signup
2. Navigate to Settings → API Keys & Webhooks
3. Copy Public Key and Secret Key
4. Add webhook URL: https://yourdomain.com/api/payments/webhook/paystack
5. Webhook sends signature in `x-paystack-signature` header

**Test Credentials:**
- Test Public Key: `pk_test_xxxxx`
- Test Secret Key: `sk_test_xxxxx`
- Test Cards:
  - Success: 4084084084084081 (any CVV, future expiry)
  - Decline: 4084080000000409

---

### M-Pesa Configuration

Apply at https://developer.safaricom.co.ke/

```env
# M-Pesa (Safaricom Kenya)
MPESA_CONSUMER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MPESA_CONSUMER_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MPESA_PASSKEY=your_lipa_na_mpesa_passkey
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox  # or 'production'
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/webhook/mpesa
```

**Setup Steps:**
1. Create account at https://developer.safaricom.co.ke/
2. Create a new app (Lipa Na M-Pesa Online)
3. Get Consumer Key and Consumer Secret
4. Apply for Paybill/Till number for production
5. Obtain Passkey for your shortcode
6. Whitelist your server IP for callbacks

**Sandbox Testing:**
- Shortcode: `174379`
- Passkey: Provided in sandbox docs
- Test Phone: `254708374149`

---

### Mock Provider (Testing)

No configuration needed! Works out of the box for development.

```env
# No credentials needed for Mock provider
# Automatically used when real provider credentials are missing
```

---

## Payment Flow

### 1. Initialize Payment

**Frontend** → `POST /api/payments/initiate`

```json
{
  "pledgeId": "pledge_xxx",
  "provider": "FLUTTERWAVE" | "PAYSTACK" | "MPESA" | "MOCK",
  "amount": 1000,
  "currency": "USD",
  "email": "user@example.com",
  "metadata": {
    "phoneNumber": "254700000000"  // Required for M-Pesa
  }
}
```

**Response:**
```json
{
  "transactionId": "txn_xxx",
  "paymentUrl": "https://checkout.flutterwave.com/...",
  "reference": "FLW-xxx-1234567890"
}
```

### 2. User Completes Payment

- **Flutterwave/Paystack**: User redirected to payment page
- **M-Pesa**: User enters PIN on mobile phone
- **Mock**: Auto-completes for testing

### 3. Webhook Callback

Provider sends webhook to:
- Flutterwave: `/api/payments/webhook/flutterwave`
- Paystack: `/api/payments/webhook/paystack`
- M-Pesa: `/api/payments/webhook/mpesa`

Webhook verifies signature and updates transaction status.

### 4. Redirect to Frontend

User redirected to: `REDIRECT_URL?reference=xxx&status=success`

Frontend polls: `GET /api/payments/status/:transactionId`

---

## Webhook Security

### Flutterwave
Verifies using HMAC SHA256:
```typescript
const hash = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### Paystack
Verifies using HMAC SHA512:
```typescript
const hash = crypto
  .createHmac('sha512', SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### M-Pesa
Uses IP whitelisting - no signature verification needed.

---

## Currency Support

| Provider | Primary Currencies | Notes |
|----------|-------------------|-------|
| Flutterwave | USD, NGN, GHS, KES, ZAR, UGX, TZS, XAF, XOF, RWF | 150+ total |
| Paystack | NGN, GHS, ZAR, USD | Nigeria-focused |
| M-Pesa | KES, TZS | Mobile money |
| Mock | Any | Testing |

---

## Testing

### Development Mode

1. **Leave credentials empty** - Mock provider automatically used
2. Frontend redirects to `/payment/mock` page
3. Click "Complete Payment" to simulate success
4. Transaction completes instantly

### Sandbox Mode

1. Set sandbox/test credentials
2. Use test cards/phone numbers
3. Real API calls, no real money
4. Webhooks work normally

### Production Mode

1. Set production credentials
2. Complete KYC/verification with provider
3. Real transactions, real money
4. Monitor webhook logs

---

## Common Issues

### Flutterwave

**Issue**: "Invalid authorization key"
- Solution: Verify SECRET_KEY is correct
- Check: Using `FLWSECK-` not `FLWPUBK-`

**Issue**: Webhook not received
- Solution: Ensure HTTPS (Flutterwave requires SSL)
- Check: Webhook URL is publicly accessible

### Paystack

**Issue**: "Amount should be in kobo"
- Solution: Multiply by 100 (automatically done)
- NGN 100 = 10,000 kobo

**Issue**: Webhook signature fails
- Solution: Use `x-paystack-signature` header
- Verify: SHA512 not SHA256

### M-Pesa

**Issue**: "Invalid access token"
- Solution: Token expires after 1 hour
- Check: Auth credentials are correct

**Issue**: STK Push not received
- Solution: Verify phone format (254XXXXXXXXX)
- Check: Phone has M-Pesa registered

---

## Production Checklist

Before going live:

### Flutterwave
- [ ] Switch to production keys
- [ ] Complete KYC verification
- [ ] Set live webhook URL (HTTPS required)
- [ ] Test with small amount first
- [ ] Configure settlement account

### Paystack
- [ ] Switch to production keys (`pk_live_`, `sk_live_`)
- [ ] Submit business documents
- [ ] Activate live mode
- [ ] Configure settlements
- [ ] Add webhook URL

### M-Pesa
- [ ] Apply for Paybill/Till number
- [ ] Complete Safaricom KYC
- [ ] Get production passkey
- [ ] Whitelist production server IP
- [ ] Test in production sandbox first
- [ ] Go-live approval from Safaricom

---

## Provider Comparison

### Best for Nigeria
**Paystack** - Optimized for Nigerian market, excellent local support

### Best for Kenya
**M-Pesa** - Dominant mobile money platform

### Best for Pan-Africa
**Flutterwave** - Widest coverage, supports most countries/currencies

### Best for Testing
**Mock** - Instant, no setup, perfect for development

---

## Support & Resources

### Flutterwave
- Docs: https://developer.flutterwave.com/docs
- Support: developers@flutterwavego.com
- Dashboard: https://dashboard.flutterwave.com

### Paystack
- Docs: https://paystack.com/docs
- Support: support@paystack.com
- Dashboard: https://dashboard.paystack.com

### M-Pesa
- Docs: https://developer.safaricom.co.ke/docs
- Support: apisupport@safaricom.co.ke
- Dashboard: https://developer.safaricom.co.ke/

---

## Environment Template

Copy to `.env`:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Application
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://afrifund.vercel.app

# Flutterwave (Optional - leave empty for Mock)
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_WEBHOOK_SECRET=
FLUTTERWAVE_REDIRECT_URL=https://afrifund.vercel.app/payment/callback

# Paystack (Optional - leave empty for Mock)
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_CALLBACK_URL=https://afrifund.vercel.app/payment/callback

# M-Pesa (Optional - leave empty for Mock)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-api.com/api/payments/webhook/mpesa

# Email (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=noreply@afrifund.com
```

**Note**: If payment provider credentials are empty, the Mock provider is automatically used for development.
