-- Update email templates for better styling and messaging
UPDATE auth.email_templates
SET template = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 10px;
      padding: 30px;
      color: white;
      margin-bottom: 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
      font-size: 24px;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: white;
      color: #6366f1;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      🎉 EventX Studio
    </div>
    <h2>Welcome to EventX Studio!</h2>
    <p>Thank you for joining our vibrant community of event creators and attendees. We''re excited to have you on board!</p>
    <p>Please confirm your email address by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
    </div>
    <p>If you didn''t create this account, you can safely ignore this email.</p>
  </div>
  <div class="footer">
    <p>EventX Studio - Where Amazing Events Come to Life</p>
    <p>© 2025 EventX Studio. All rights reserved.</p>
  </div>
</body>
</html>',
subject = '🎉 Welcome to EventX Studio - Please Verify Your Email'
WHERE template_type = 'confirmation';

-- Update the successful confirmation redirect
INSERT INTO auth.flow_state (auth_code, code_challenge_method, code_challenge)
VALUES ('confirmation_success', 'plain', 'success');

CREATE OR REPLACE FUNCTION auth.handle_confirmation_success()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.flow_state WHERE NOW() - created_at > interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy to disable duplicate email signups
ALTER TABLE auth.users
ADD CONSTRAINT unique_email UNIQUE (email);

-- Create a function to handle email confirmation success
CREATE OR REPLACE FUNCTION auth.handle_email_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Show success message
  RAISE NOTICE 'Email confirmed successfully! Welcome to EventX Studio.';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
