import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function env(name: string) {
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : v;
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  
  const host = env('SMTP_HOST');
  const port = Number(env('SMTP_PORT')) || 587;
  const user = env('SMTP_USER');
  const pass = env('SMTP_PASS');
  const secure = port === 465; 

  if (!host || !user || !pass) {
    console.error('[MAILER] Missing SMTP_HOST/SMTP_USER/SMTP_PASS');
    throw new Error('Mailer not configured');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    
  });

  transporter.verify((err) => {
    if (err) console.error('[MAILER VERIFY ERROR]', err.message);
    else console.log('[MAILER] SMTP ready: true');
  });

  return transporter!;
}

function buildResetEmailHTML(opts: {
  name?: string;
  resetLink: string;
  expiryText?: string;
}) {
  const name = opts.name || "User";
  const expiry = opts.expiryText || "1 hour";

  const bodyHtml = `
    <p class="main-text">Dear ${name},</p>

    <p class="main-text">
      We received a request to reset your AbleVu account password.
      Click the button below to continue.
    </p>

    <div style="text-align:center;">
      <a href="${opts.resetLink}" class="btn">Reset My Password</a>
    </div>

    <p class="main-text">
      This link will expire in <b>${expiry}</b> and can only be used once.
    </p>

    <p class="main-text">
      If you didn’t request this, you can safely ignore this email.
    </p>
  `;

  return buildAbleVuEmailTemplate("Password Reset Request", bodyHtml);
}

function buildV2ResetEmailHTML(opts: {
  name?: string;
  resetLink: string;
  expiryText?: string;
}) {
  const expiry = opts.expiryText || "1 hour";

  const bodyHtml = `
    <p class="main-text">
      We’re excited to let you know that <b>AbleVu V2 is now live</b> 🎉
    </p>

    <p class="main-text">
      As part of this major upgrade, we’ve enhanced security and improved how accounts are managed.
      To continue using AbleVu V2, <b>you’ll need to reset your password</b>.
    </p>

    <p class="main-text">
      Please click the button below to set a new password and access the updated platform.
    </p>

    <div style="text-align:center;">
      <a href="${opts.resetLink}" class="btn">Reset My Password</a>
    </div>

    <p class="main-text">
      This reset link will expire in <b>${expiry}</b> and can only be used once.
    </p>

    <p class="main-text">
      If you have any questions or need help, feel free to reply to this email — our team is happy to assist.
    </p>

    <p class="main-text" style="margin-top:22px;">
      Thank you for being part of AbleVu,<br/>
      <b>The AbleVu Team</b>
    </p>
  `;

  return buildAbleVuEmailTemplate("AbleVu V2 is Now Live 🎉", bodyHtml);
}


function buildAbleVuEmailTemplate(heading: string, bodyHtml: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    body { margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f4f4; }
    a { text-decoration:none; }

    .header-container {
      display: inline-flex;
      align-items: center;
      background-color: #e5e5e5;
      padding: 15px 30px;
      border-radius: 10px;
    }

    .logo { width:150px; margin-right:20px; }

    .main-content {
      padding: 40px 30px;
      background: #ffffff;
      max-width: 600px;
      margin: 20px auto;
      border-radius: 8px;
    }

    .main-heading {
      font-size: 26px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      color: #333;
    }

    .main-text {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      margin-bottom: 15px;
    }

    .btn {
      display:inline-block;
      background:#0519CE;
      color:#fff !important;
      padding:12px 24px;
      border-radius:6px;
      font-weight:bold;
      margin:20px auto;
    }

    .footer {
      background:#2d2d2d;
      padding:30px;
      text-align:center;
      color:#aaa;
      font-size:12px;
    }
  </style>
</head>

<body>
<center>

  <!-- Header -->
  <table cellpadding="0" cellspacing="0" border="0" style="margin:30px auto;">
    <tr>
      <td>
        <div class="header-container">
          <img src="https://ablevu-webapp.vercel.app/assets/images/logo.png" class="logo" />
          <span style="font-size:28px; font-weight:bold;">AbleVu</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- Content -->
  <div class="main-content">
    <div class="main-heading">${heading}</div>
    ${bodyHtml}
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>123 Able Vu Street, City, Country</p>
    <p>
      <a href="https://ablevu-webapp.vercel.app" style="color:white;">AbleVu.com</a>
      &nbsp;|&nbsp;
      <a href="[PRIVACY_POLICY_URL]" style="color:white;">Privacy Policy</a>
      &nbsp;|&nbsp;
      <a href="[HELP_CENTER_URL]" style="color:white;">Help Center</a>
    </p>
    <p>This is a notification-only email. Please do not reply.</p>
  </div>

</center>
</body>
</html>
`;
}

export async function sendMail(to: string, subject: string, html: string) {
  const t = getTransporter();
  const fromUser = env('SMTP_USER')!;
  return t.sendMail({
    from: `"Admin" <${fromUser}>`,
    to,
    subject,
    html,
  });
}

export async function sendResetEmail(params: {
  to: string;
  name?: string;
  resetLink: string;
  expiryText?: string;
  subject?: string;
  brand?: { header?: string; color?: string; supportEmail?: string };
}) {
  const html = buildResetEmailHTML({
    name: params.name,
    resetLink: params.resetLink,
    expiryText: params.expiryText ?? '1 hour',
  });

  return sendMail(params.to, params.subject ?? 'Password Reset Request', html);
}

export async function sendV2ResetEmail(params: {
  to: string;
  name?: string; // optional, kept for consistency
  resetLink: string;
  expiryText?: string;
  subject?: string;
}) {
  const html = buildV2ResetEmailHTML({
    name: params.name,
    resetLink: params.resetLink,
    expiryText: params.expiryText ?? "1 hour",
  });

  return sendMail(
    params.to,
    params.subject ?? "AbleVu V2 is now live — Reset your password",
    html
  );
}

