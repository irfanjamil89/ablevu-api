import { Injectable } from '@nestjs/common';
import { sendMail } from '../shared/mailer';

@Injectable()
export class EmailService {

    private buildCustomEmail(body: string) {
        return `
    
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AbleVu Email</title>
  <style>
    body { margin:0; padding:0; font-family:Arial, sans-serif; background:#f4f4f4; }
  </style>
</head>
<body>
<center>

<!-- Header -->
<div style="background: linear-gradient(90deg, #0072ce, #00b386, #ff6600); padding:40px 0;">
  <table style="background:#e5e5e5; padding:15px 30px; border-radius:10px;">
    <tr>
      <td><img src="https://ablevu-webapp.vercel.app/assets/images/logo.png" width="150" /></td>
      <td style="padding-left:20px; font-size:28px; font-weight:bold; color:black;">AbleVu</td>
    </tr>
  </table>
</div>

<!-- Body -->
<div style="background:#ffffff; padding:30px; margin:20px auto; width:600px; border-radius:8px; text-align:left; font-size:16px; line-height:1.6;">
  ${body}
</div>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#2d2d2d">
        <tr>
            <td align="center" style="padding:30px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="padding:20px; border-radius:8px;">
                    <tr>
                        <td style="text-align:center; color:#aaaaaa; font-size:12px; line-height:1.5; padding-bottom:5px;">
                            123 Able Vu Street, City, Country
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center; color:#aaaaaa; font-size:12px; line-height:1.5; padding-bottom:5px;">
                            <a href="" style="color:white; text-decoration:none; font-weight:bold;">AbleVu.com</a>
                            &nbsp;|&nbsp;
                            <a href="[PRIVACY_POLICY_URL]" style="color:white; text-decoration:none; font-weight:bold;">Privacy Policy</a>
                            &nbsp;|&nbsp;
                            <a href="[HELP_CENTER_URL]" style="color:white; text-decoration:none; font-weight:bold;">Help Center</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center; color:#aaaaaa; font-size:12px; line-height:1.5;">
                            This email comes from a notification-only address. Replies are not monitored. For assistance, please visit our Help Center.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </center>
</body>
</html> `;
}

async sendEmail(to: string, subject: string, body: string) {
    const html = this.buildCustomEmail(body);
    await sendMail(to, subject, html);
    return { success: true };
  }
}