import * as React from 'https://esm.sh/react@18.3.1'

interface PasswordResetEmailProps {
  resetUrl: string
  token: string
}

export const PasswordResetEmail = ({
  resetUrl,
  token,
}: PasswordResetEmailProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto; margin-bottom: 64px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1a1a1a; padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 8px;">Director's Cut</h1>
                    <p style="color: #cccccc; font-size: 16px; margin: 0;">Plataforma de Filmes</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 32px 24px;">
                    <h2 style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin: 0 0 16px; text-align: center;">Redefinir Senha</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                      Recebemos uma solicitação para redefinir a senha da sua conta no Director's Cut. 
                      Clique no botão abaixo para criar uma nova senha.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 32px 0;">
                          <a href="${resetUrl}" style="background-color: #dc2626; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; padding: 16px 32px; text-decoration: none; text-align: center;">
                            Redefinir Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                      Ou copie e cole este código de redefinição temporário:
                    </p>
                    
                    <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0 32px; padding: 16px; text-align: center;">
                      <p style="color: #1a1a1a; font-size: 18px; font-weight: bold; letter-spacing: 2px; margin: 0;">${token}</p>
                    </div>
                    
                    <p style="color: #e53e3e; font-size: 14px; font-weight: bold; margin: 16px 0; text-align: center;">
                      Este link expira em 1 hora por motivos de segurança.
                    </p>
                    
                    <p style="color: #718096; font-size: 14px; line-height: 1.5; margin: 24px 0 0; text-align: center;">
                      Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. 
                      Sua senha atual continuará ativa.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="border-top: 1px solid #e2e8f0; padding: 24px; text-align: center;">
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      Director's Cut - Plataforma para cineastas e estudantes de cinema
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export default PasswordResetEmail
