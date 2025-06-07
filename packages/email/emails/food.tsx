import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface FoodEmailProps {
  url: string;
  email: string;
  token?: string;
}

export const FoodEmail = ({ url, email }: FoodEmailProps) => (
  <Html>
    <Head />
    <Preview>The Food Email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You like food?</Heading>

        <Text style={text}>🍗</Text>
      </Container>
    </Body>
  </Html>
);

FoodEmail.PreviewProps = {
  url: "https://example.com/auth/magic-link?token=your-token-here",
  email: "user@example.com",
} as FoodEmailProps;

export default FoodEmail;

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
