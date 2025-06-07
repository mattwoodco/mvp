# @mvp/email

A minimal email package using React Email and Resend for sending beautiful emails.

## Features

- 📧 React Email templates
- 🔗 Magic link authentication emails
- 🚀 Resend integration
- 📝 TypeScript support

## Setup

### Environment Variables

Make sure to set the following environment variables in your `.env` file:

```env
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

These variables are already included in the turbo.json configuration, so they'll be available to the email package during development and build.

### Development

To preview email templates during development:

```bash
bun run dev
```

This will start the React Email preview server at `http://localhost:3000`.

## Usage

### Send Magic Link Email

```typescript
import { sendMagicLinkEmail } from '@mvp/email';

await sendMagicLinkEmail({
  email: 'user@example.com',
  token: 'magic-token',
  url: 'https://app.com/auth/magic-link?token=magic-token'
});
```

### Send Custom Email

```typescript
import { sendEmail } from '@mvp/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our app!</h1>',
  // or use React component
  react: <YourEmailTemplate />
});
```

## Deployment on Vercel

### 1. Update Turborepo Configuration

Add the email package to your root `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", ".react-email/**"]
    }
  }
}
```

### 2. Vercel Project Settings

When deploying to Vercel, configure the following:

1. **Framework Preset**: Set to `Next.js`
2. **Build Command**: Keep as `bun run build` (or your turbo build command)
3. **Output Directory**: `.react-email/.next`
4. **Install Command**: `bun install`

### 3. Environment Variables

Add these environment variables in your Vercel project settings:

- `RESEND_API_KEY`: Your Resend API key
- `FROM_EMAIL`: Your verified sender email

### 4. Add Next.js to devDependencies

The email package includes `next` in devDependencies to work with Vercel's Next.js preset:

```json
{
  "devDependencies": {
    "next": "*"
  }
}
```

## Scripts

- `bun run dev` - Start the email preview server
- `bun run build` - Build email templates for production
- `bun run typecheck` - Run TypeScript type checking

## Adding New Email Templates

1. Create a new React component in `src/emails/`:

```tsx
// src/emails/welcome.tsx
import { Html, Text, Button } from '@react-email/components';

export const WelcomeEmail = ({ name }: { name: string }) => (
  <Html>
    <Text>Welcome {name}!</Text>
    <Button href="https://app.com">Get Started</Button>
  </Html>
);
```

2. Export it from `src/index.ts`:

```typescript
export { WelcomeEmail } from './emails/welcome';
```

3. Create a utility function if needed:

```typescript
// src/utils/welcome.ts
import { sendEmail } from './send-email';
import { WelcomeEmail } from '../emails/welcome';

export async function sendWelcomeEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome!',
    react: WelcomeEmail({ name }),
  });
}
```

## Development Tips

- Use the React Email preview server to design and test your emails
- Keep email templates simple and use inline styles
- Test your emails across different email clients
- Use the `Preview` component to set preview text for email clients