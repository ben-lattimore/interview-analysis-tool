
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: 'signup' | 'recovery' | 'invite' | 'magic_link' | 'email_change';
  token?: string;
  redirectTo?: string;
  userData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, token, redirectTo, userData }: AuthEmailRequest = await req.json();
    
    console.log(`Sending ${type} email to ${email}`);

    let subject = "";
    let html = "";
    const baseUrl = redirectTo || "https://thought-weaver-insights.lovable.app";

    switch (type) {
      case "signup":
        subject = "Confirm your email - TranscriptIQ";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TranscriptIQ!</h1>
              <p style="color: #E5E7EB; margin: 10px 0 0 0;">Interview Analysis Platform</p>
            </div>
            <div style="padding: 40px; background: white;">
              <h2 style="color: #1F2937; margin-bottom: 20px;">Confirm your email address</h2>
              <p style="color: #6B7280; line-height: 1.6; margin-bottom: 30px;">
                Thank you for signing up! Please click the button below to confirm your email address and complete your registration.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${baseUrl}/auth/confirm?token=${token}&type=signup" 
                   style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Confirm Email Address
                </a>
              </div>
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
                If you didn't create an account with TranscriptIQ, you can safely ignore this email.
              </p>
            </div>
          </div>
        `;
        break;

      case "recovery":
        subject = "Reset your password - TranscriptIQ";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
              <p style="color: #E5E7EB; margin: 10px 0 0 0;">TranscriptIQ</p>
            </div>
            <div style="padding: 40px; background: white;">
              <h2 style="color: #1F2937; margin-bottom: 20px;">Reset your password</h2>
              <p style="color: #6B7280; line-height: 1.6; margin-bottom: 30px;">
                You requested a password reset for your TranscriptIQ account. Click the button below to set a new password.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${baseUrl}/auth/reset-password?token=${token}" 
                   style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </div>
        `;
        break;

      case "magic_link":
        subject = "Sign in to TranscriptIQ";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Sign In</h1>
              <p style="color: #E5E7EB; margin: 10px 0 0 0;">TranscriptIQ</p>
            </div>
            <div style="padding: 40px; background: white;">
              <h2 style="color: #1F2937; margin-bottom: 20px;">Sign in to your account</h2>
              <p style="color: #6B7280; line-height: 1.6; margin-bottom: 30px;">
                Click the button below to sign in to your TranscriptIQ account.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${baseUrl}/auth/confirm?token=${token}&type=magiclink" 
                   style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Sign In
                </a>
              </div>
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
                This link will expire in 1 hour for security reasons.
              </p>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "TranscriptIQ <no-reply@castfromclay.co.uk>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
