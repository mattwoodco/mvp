import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
  email: string;
  token?: string;
}

export const MagicLinkEmail = ({ url, email }: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Sign in to your account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Magic Link</Heading>
        <Text style={text}>Hi {email},</Text>
        <Text style={text}>
          Click the button below to sign in to your account. This link will
          expire in 10 minutes.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={url}>
            Sign In
          </Button>
        </Section>
        <Text style={text}>
          If you didn't request this email, you can safely ignore it.
        </Text>
        <Text style={text}>
          Or copy and paste this URL into your browser:{" "}
          <Link href={url} style={link}>
            {url}
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

MagicLinkEmail.PreviewProps = {
  url: "https://example.com/auth/magic-link?token=your-token-here",
  email: "user@example.com",
} as MagicLinkEmailProps;

export default MagicLinkEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
};

const text = {
  color: "#404040",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 10px",
};

const buttonContainer = {
  margin: "30px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1",
  padding: "16px 32px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};
