import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for AI Job Application Tracker</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            We received a request to reset your password for your AI Job
            Application Tracker account. Click the button below to choose a new
            password. This link expires in 1 hour.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={resetUrl}>
              Reset password
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          <Link href={resetUrl} style={link}>
            {resetUrl}
          </Link>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request a password reset, you can safely ignore
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "40px 32px",
};

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: 700,
  margin: "0 0 16px",
};

const text = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "8px 0",
};

const buttonSection = {
  margin: "24px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
};

const link = {
  color: "#7c3aed",
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

const hr = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "24px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "8px 0",
};

export default ResetPasswordEmail;
