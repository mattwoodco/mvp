import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
}

export const MagicLinkEmail = ({ url }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Body
        style={{ backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            padding: "20px",
            maxWidth: "500px",
            backgroundColor: "white",
            margin: "40px auto",
            borderRadius: "8px",
          }}
        >
          <Heading style={{ color: "#333", textAlign: "center" }}>
            Sign in to your account
          </Heading>
          <Text style={{ color: "#666", fontSize: "16px", lineHeight: "24px" }}>
            Click the button below to securely sign in to your account. This
            link will expire in 15 minutes.
          </Text>
          <Button
            href={url}
            style={{
              background: "#000",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              fontSize: "16px",
              fontWeight: "bold",
              margin: "20px 0",
            }}
          >
            Sign In
          </Button>
          <Text style={{ color: "#999", fontSize: "14px" }}>
            If you didn't request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;
