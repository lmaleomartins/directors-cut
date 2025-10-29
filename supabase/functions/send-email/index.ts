import React from 'https://esm.sh/react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { renderToStaticMarkup } from 'https://esm.sh/react-dom@18.3.1/server'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'
import { PasswordResetEmail } from './_templates/password-reset-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.length <= 2000;
  } catch {
    return false;
  }
};

const isValidToken = (token: string): boolean => {
  return token.length > 0 && token.length <= 500;
};

const VALID_EMAIL_ACTIONS = ['recovery', 'signup', 'invite', 'magiclink'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    
    const verifiedData = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    // Validate the verified data
    const { user, email_data } = verifiedData;
    
    if (!isValidEmail(user.email)) {
      console.error('Invalid email format');
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidToken(email_data.token) || !isValidToken(email_data.token_hash)) {
      console.error('Invalid token format');
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidUrl(email_data.redirect_to)) {
      console.error('Invalid redirect URL');
      return new Response(
        JSON.stringify({ error: 'Invalid redirect URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VALID_EMAIL_ACTIONS.includes(email_data.email_action_type)) {
      console.error('Invalid email action type');
      return new Response(
        JSON.stringify({ error: 'Invalid email action type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email action type:', email_data.email_action_type)
    console.log('Redirect to:', email_data.redirect_to)

    let html: string
    let subject: string

    // Determinar o tipo de email e usar o template apropriado
    if (email_data.email_action_type === 'recovery') {
      // Email de redefinição de senha
      const resetUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent('https://bnetnodeuexpbfsyzuzy.supabase.co/auth/reset-password')}`
      
      html = renderToStaticMarkup(
        React.createElement(PasswordResetEmail, {
          resetUrl,
          token: email_data.token
        })
      )
      subject = 'Redefinir sua senha - Director\'s Cut'
    } else {
      // Email de confirmação
      const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`
      
      html = renderToStaticMarkup(
        React.createElement(ConfirmationEmail, {
          confirmUrl,
          token: email_data.token
        })
      )
      subject = 'Confirme sua conta - Director\'s Cut'
    }

    const { error } = await resend.emails.send({
      from: 'Director\'s Cut <noreply@resend.dev>',
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully to:', user.email)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
