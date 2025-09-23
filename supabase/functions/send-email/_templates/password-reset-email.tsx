import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  resetUrl: string
  token: string
}

export const PasswordResetEmail = ({
  resetUrl,
  token,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefina sua senha no Director's Cut</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Director's Cut</Heading>
          <Text style={subtitle}>Plataforma de Filmes</Text>
        </Section>
        
        <Section style={content}>
          <Heading style={h2}>Redefinir Senha</Heading>
          <Text style={text}>
            Recebemos uma solicitação para redefinir a senha da sua conta no Director's Cut. 
            Clique no botão abaixo para criar uma nova senha.
          </Text>
          
          <Section style={buttonContainer}>
            <Link href={resetUrl} style={button}>
              Redefinir Senha
            </Link>
          </Section>
          
          <Text style={text}>
            Ou copie e cole este código de redefinição temporário:
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{token}</Text>
          </Section>
          
          <Text style={warningText}>
            Este link expira em 1 hora por motivos de segurança.
          </Text>
          
          <Text style={smallText}>
            Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. 
            Sua senha atual continuará ativa.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            Director's Cut - Plataforma para cineastas e estudantes de cinema
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#1a1a1a',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const subtitle = {
  color: '#cccccc',
  fontSize: '16px',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '32px 24px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
  textAlign: 'left' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const codeContainer = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  margin: '16px 0 32px',
  padding: '16px',
  textAlign: 'center' as const,
}

const code = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0',
}

const warningText = {
  color: '#e53e3e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const smallText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const footer = {
  borderTop: '1px solid #e2e8f0',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#718096',
  fontSize: '12px',
  margin: '0',
}