import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  username?: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  username = "there",
  loginUrl = "https://example.com/login",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome {username}!</Heading>
          <Text style={text}>
            We're excited to have you on board. Click the button below to get
            started.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>
          <Text style={footer}>
            If you didn't request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "16px 0",
};

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "16px 0",
};

const buttonContainer = {
  padding: "24px 0",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "16px 0",
};

export default WelcomeEmail;
