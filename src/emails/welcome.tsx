import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to AI Job Application Tracker</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {name}! 🎉</Heading>
          <Text style={text}>
            Your AI-powered job search command center is ready. Here&apos;s what
            you can do right away:
          </Text>
          <Section style={list}>
            <Text style={listItem}>
              • Track your first application and move it through your pipeline
            </Text>
            <Text style={listItem}>
              • Upload a resume to get an instant ATS score
            </Text>
            <Text style={listItem}>
              • Generate a tailored cover letter with AI
            </Text>
            <Text style={listItem}>
              • Prepare for interviews with the AI interview coach
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Questions? Reply to this email and we&apos;ll help you out.
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

const list = {
  margin: "16px 0",
};

const listItem = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "4px 0",
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

export default WelcomeEmail;
