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
  brand?: { header?: string; color?: string; supportEmail?: string };
}) {
  const name = opts.name || 'User';
  const link = opts.resetLink;
  const expiry = opts.expiryText || '1 hour';
  const brand = {
    header: opts.brand?.header ?? 'Password Reset Request',
    color: opts.brand?.color ?? '#4c416aff', 
    supportEmail: opts.brand?.supportEmail ?? 'support@ablevu.com',
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${brand.header}</title>
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #f5f7fa;
    color: #333;
    margin: 0;
    padding: 0;
  }
  .wrap {
    max-width: 600px;
    margin: 40px auto;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 3px 12px rgba(0,0,0,0.08);
    overflow: hidden;
  }
  .hdr {
    background: ${brand.color};
    color: #fff;
    padding: 20px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
  }
  .cnt {
    padding: 30px;
    line-height: 1.6;
    border-left: 6px solid ${brand.color};
  }
  .cnt p:first-child { margin-top: 0; }
  .btn {
    display: inline-block;
    background: ${brand.color};
    color: #fff !important;
    text-decoration: none;
    font-weight: 700;
    padding: 12px 22px;
    border-radius: 6px;
    margin-top: 20px;
  }
  .ftr {
    font-size: 13px;
    color: #777;
    text-align: center;
    padding: 20px;
    background: #fafafa;
    border-top: 1px solid #eee;
  }
  a { color: ${brand.color}; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">${brand.header}</div>
    <div class="cnt">
      <p>Dear ${name},</p>
      <p>We’ve received your request to reset your password. Please click the button below to complete the reset.</p>
      <p style="text-align:center;">
        <a class="btn" href="${link}">Reset My Password</a>
      </p>
      <p>This link is valid for a single use and expires in <b>${expiry}</b>.</p>
      <p>If you did not initiate this request, please ignore this email. Your account will remain secure.</p>
    </div>
    <div class="ftr">— Admin | <a href="mailto:${brand.supportEmail}">${brand.supportEmail}</a></div>
  </div>
</body>
</html>`;
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
    brand: params.brand,
  });

  return sendMail(params.to, params.subject ?? 'Password Reset Request', html);
}
