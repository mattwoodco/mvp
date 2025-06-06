# Twilio OTP Integration with BetterAuth

## Quick Start

### 1. Twilio Setup

1. **Sign up for Twilio**
   - Go to https://www.twilio.com/try-twilio
   - Create account with email verification
   - Get $15 free credit (enough for ~1000 SMS)

2. **Get Credentials**
   - Dashboard → Account Info
   - Copy: Account SID, Auth Token
   - Buy phone number ($1/month): Console → Phone Numbers → Buy Number

3. **Enable SMS Geographic Permissions**
   - Console → Messaging → Settings → Geographic Permissions
   - Enable countries you'll send to

### 2. Development Setup

```bash
# Install dependencies
pnpm install

# Copy env example
cp apps/website/.env.local.example apps/website/.env.local

# Add Twilio credentials to .env.local
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Run database migrations
pnpm db:push

# Start dev server
pnpm dev
```

### 3. Database Schema

Add phone number field to user table:

```sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
```

Or in your Drizzle schema:

```typescript
export const users = pgTable("users", {
  // ... existing fields
  phoneNumber: varchar("phone_number", { length: 20 }),
});
```

### 4. Testing

1. **Enable 2FA for user**:
   ```typescript
   await authClient.twoFactor.enable({ password: "userPassword" });
   ```

2. **Send OTP**:
   ```typescript
   await authClient.twoFactor.sendOtp();
   ```

3. **Verify OTP**:
   ```typescript
   await authClient.twoFactor.verifyOtp({ code: "123456" });
   ```

### 5. Production Deployment (Vercel)

1. **Add Environment Variables**:
   ```bash
   vercel env add TWILIO_ACCOUNT_SID
   vercel env add TWILIO_AUTH_TOKEN
   vercel env add TWILIO_PHONE_NUMBER
   vercel env add APP_NAME
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

### 6. Security Best Practices

- Store Twilio credentials in environment variables only
- Enable Twilio webhook signature validation
- Rate limit OTP requests (max 3 per 10 minutes)
- Set OTP expiry to 60 seconds
- Log all 2FA events for audit trail
- Use HTTPS in production
- Enable trusted devices feature

### 7. Troubleshooting

**OTP not sending:**
- Check Twilio balance
- Verify phone number format (+1234567890)
- Check geographic permissions
- Review Twilio logs

**Environment variables not loading:**
- Ensure turbo.json includes Twilio vars
- Restart dev server after .env changes
- Check Vercel env vars in dashboard

**Session issues in production:**
- Ensure NEXTAUTH_URL matches production URL
- Set secure cookies in production
- Check CORS settings

### 8. Cost Optimization

- SMS: $0.0075 per message (US)
- Use TOTP as primary, OTP as fallback
- Implement rate limiting
- Cache Twilio client initialization
- Monitor usage in Twilio console

### 9. API Reference

See https://www.better-auth.com/docs/plugins/2fa for full API documentation.