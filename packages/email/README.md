# @mvp/email

Email package using Resend and React Email for transactional emails.

## Usage

### Sending emails

```typescript
import { sendEmail } from '@mvp/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Welcome to our app',
  html: '<h1>Welcome to our app</h1>'
})
```

### Magic link emails

```typescript
import { sendMagicLinkEmail } from '@mvp/email'

await sendMagicLinkEmail({
  email: 'user@example.com',
  token: 'abc123',
  url: 'https://yourapp.com/auth/verify?token=abc123'
})
```

## Development

Start the email preview server on port 3001:

```bash
bun email:dev
# or
bun email:dev dev  # uses .env.dev
```

Visit http://localhost:3001 to preview your email templates.

## Creating new templates

1. Add your template in `/emails/your-template.tsx`:

```tsx
import { Html, Button } from '@react-email/components'

export const YourTemplate = ({ name }: { name: string }) => (
  <Html>
    <Button href="https://example.com">
      Hello {name}!
    </Button>
  </Html>
)

export default YourTemplate
```

2. Use it in your code:

```typescript
import { render } from '@react-email/components'
import { YourTemplate } from '@mvp/email/emails/your-template'
import { sendEmail } from '@mvp/email'

const html = await render(YourTemplate({ name: 'John' }))
await sendEmail({ to: 'john@example.com', subject: 'Hi!', html })
```

## Environment Variables

Required in your `.env` files:
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Sender email address

## Deployment

For deploying the email preview server:
1. Set Framework Preset to Next.js in Vercel
2. Set Output Directory to `.react-email/.next`
3. Add `"next": "*"` to devDependencies 
