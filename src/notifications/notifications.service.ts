import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entity/notifications.entity';
import { User } from '../entity/user.entity';
import { sendMail } from '../shared/mailer';
import { Business } from '../entity/business.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) { }

  private buildEmail(
    heading: string,
    bodyHtml: string,
  ) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Business Created</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        a { text-decoration: none; }

        /* Header */
        .header-container { display: inline-flex; align-items: center; background-color: #e5e5e5; padding: 15px 30px; border-radius: 10px; }
        .logo { display: block; width: 150px; height: auto; margin-right: 20px; }
        .header-text { font-size: 28px; font-weight: bold; color: black; }

        /* Main content */
        .main-content { padding: 40px 30px; background-color: white; max-width: 600px; margin: 20px auto; border-radius: 8px; }
        .main-heading { font-size: 28px; font-weight: bold; color: #333333; margin-bottom: 20px; text-align: center; }
        .main-text { font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 15px; text-align: left; }

        /* Social icons */
        .social-icons { text-align: center; padding: 30px 0; max-width: 600px; margin: 0 auto; } /* removed gray bg */
        .social-icon-container { display: inline-block; width: 40px; height: 40px; border-radius: 50%; margin: 0 5px; background-color: black; }
        .social-icon-container img { width: 20px; height: 20px; display: block; margin: auto; margin-top: 10px; }

        /* Footer */
        .footer-bg { background-color: #2d2d2d; padding: 30px 20px 40px; border-radius: 8px; max-width: 600px; margin: auto; }
        .footer-text { color: #aaaaaa; font-size: 12px; line-height: 1.5; text-align: center; margin: 5px 0; }
        .footer-link { color: white; text-decoration: none; font-weight: bold; }
        .footer-link-separator { color: #888888; margin: 0 5px; }
    </style>
</head>
<body>
    <center>
        <!-- Header -->
        <div class="header-bg">
            <table class="header-container" cellpadding="0" cellspacing="0" border="0" style="margin:auto; background-color:#e5e5e5; border-radius:10px; padding:15px 30px;">
  <tr>
    <td valign="middle">
      <img src="https://ablevu-webapp.vercel.app/assets/images/logo.png" alt="Able Vu Logo" class="logo">
    </td>
    <td valign="middle" style="padding-left:20px; font-size:28px; font-weight:bold; color:black;">
      AbleVu
    </td>
  </tr>
</table>

        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="main-heading">${heading}</div>
                ${bodyHtml}
        </div>

        <!-- Social Icons -->
        <div class="social-icons">
            <a href="[FACEBOOK_LINK_URL]" target="_blank" class="social-icon-container">
                <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" alt="Facebook">
            </a>
            <a href="[TWITTER_LINK_URL]" target="_blank" class="social-icon-container">
                <img src="https://cdn-icons-png.flaticon.com/512/145/145812.png" alt="Twitter">
            </a>
            <a href="[INSTAGRAM_LINK_URL]" target="_blank" class="social-icon-container">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram">
            </a>
            <a href="[YOUTUBE_LINK_URL]" target="_blank" class="social-icon-container">
                <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube">
            </a>
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
                            <a href="https://ablevu-webapp.vercel.app" style="color:white; text-decoration:none; font-weight:bold;">AbleVu.com</a>
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
</html>
    `;
  }
  async createPullNotification(content: string, createdBy: string, meta?: string) {
    const notification = this.notificationRepo.create({
      content,
      feedbacktype: 'onsite',
      created_by: createdBy,
      modified_by: createdBy,
      meta,
    });

    return await this.notificationRepo.save(notification);
  }

  async createEmailNotification(
    recipients: string[],
    htmlContent: string,
    subject: string,
    createdBy: string,
  ) {

    await this.notificationRepo.save(
      this.notificationRepo.create({
        content: htmlContent,
        feedbacktype: 'email',
        created_by: createdBy,
        modified_by: createdBy,
      }),
    );

    for (const email of recipients) {
      await sendMail(email, subject, htmlContent);
    }
  }


  async notifyBusinessCreated(businessName: string, createdBy: string, businessId: string) {

    const shortMessage = `Business "${businessName}" has been created`;


    const admins = await this.userRepo.find({
      where: { user_role: 'Admin' },
      select: ['email'],
    });

    const adminEmails = admins
      .map(a => a.email)
      .filter((email): email is string => !!email);


    await this.createPullNotification(
      shortMessage,
      createdBy,
      JSON.stringify({ type: 'business-created', id: businessId })
    );


    if (adminEmails.length > 0) {
      const heading = `New Business Created`;
      const bodyHtml = `
    <div class="main-text">
      A new business <strong>${businessName}</strong> has been successfully created in the Able Vu system.
    </div>
    <div class="main-text">
      This business is now available for review and management within your admin dashboard.
      Please check its details and update any necessary information to ensure smooth operation.
    </div>
  `;

      const emailHTML = this.buildEmail(heading, bodyHtml);
      this.createEmailNotification(
        adminEmails,
        emailHTML,
        `New Business Created: ${businessName}`,
        createdBy,
      ).catch(err => console.error("Error sending emails:", err));
    }

    return { success: true };
  }

  async notifyBusinessStatusUpdated(payload: {
    businessId: string;
    businessName: string;
    triggeredBy: string;
    newStatus: string;
  }) {
    const { businessId, businessName, triggeredBy, newStatus } = payload;
    const actor = await this.userRepo.findOne({ where: { id: triggeredBy } });

    if (!actor) {
      throw new Error("User triggering the action not found");
    }
    if (actor.user_role === 'Business' && newStatus === 'pending approved') {
      const admins = await this.userRepo.find({
        where: { user_role: 'Admin' },
        select: ['email', 'id'],
      });

      const adminEmails = admins
        .map(a => a.email)
        .filter((email): email is string => !!email);

      for (const admin of admins) {
        await this.createPullNotification(
          `Business "${businessName}" is pending approval`,
          admin.id,
          JSON.stringify({
            type: 'business-status',
            status: newStatus,
            id: businessId,
          }),
        );
      }
      if (adminEmails.length > 0) {
        const heading = 'Business Pending Approval';
        const bodyHtml = `
        <div class="main-text">
          The business <strong>${businessName}</strong> has been submitted for approval.
        </div>
        <div class="main-text">
          Please review the business details and take the necessary action from the admin dashboard.
        </div>
      `;

        const emailHTML = this.buildEmail(heading, bodyHtml);

        await this.createEmailNotification(
          adminEmails,
          emailHTML,
          `Business Pending Approval: ${businessName}`,
          triggeredBy,
        );
      }
      return { success: true };
    }
    if (actor.user_role === 'Admin' && newStatus === 'approved') {

      const business = await this.businessRepo.findOne({
        where: { id: businessId },
        relations: ['owner'],
      });

      if (!business?.owner?.id) {
        return { success: false, message: 'Business owner not found' };
      }
      const businessOwnerId = business?.owner.id;

      await this.createPullNotification(
        `Your business "${businessName}" has been approved`,
        businessOwnerId,
        JSON.stringify({ type: 'business-status', status: newStatus, id: businessId }),
      );

      const businessOwner = await this.userRepo.findOne({
        where: { id: businessOwnerId },
        select: ['email'],
      });

      if (businessOwner?.email) {
        const heading = 'Business Approved';
        const bodyHtml = `
      <div class="main-text">
        Congratulations! Your business <strong>${businessName}</strong> has been approved.
      </div>
      <div class="main-text">
        Your business is now live and visible on the platform.
      </div>
    `;

        const emailHTML = this.buildEmail(heading, bodyHtml);
        await this.createEmailNotification(
          [businessOwner.email],
          emailHTML,
          `Business Approved: ${businessName}`,
          actor.id,
        );
      } 
      return { success: true };
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, createdBy: string) {  
    const heading = `Welcome to Able Vu, ${firstName}!`;
    const bodyHtml = `
  <div class="main-text">
    Hi <strong>${firstName}</strong>,
  </div>

  <div class="main-text">
    Welcome to <strong>AbleVu</strong>! We’re excited to have you on board.
  </div>

  <div class="main-text">
    AbleVu helps you explore businesses with accessibility in mind — from facilities and features to real user experiences.
    You can browse businesses, ask questions, leave reviews, and help others make informed decisions.
  </div>

  <div class="main-text">
    To get started, log in to your account and explore businesses around you.
  </div>

  <div class="main-text">
    If you have any questions or need help, our Help Center is always available.
  </div>

  <div class="main-text">
    We’re glad to have you with us!<br/>
    <strong>The AbleVu Team</strong>
  </div>
`;
    const emailHTML = this.buildEmail(heading, bodyHtml);
    await this.createEmailNotification(
      [email],
      emailHTML,
      'Welcome to Able Vu!',
      createdBy,
    );
    return { success: true };
  }

  async notifyquestionCreated(businessId: string, question: string, createdBy: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });
    if (!business?.owner?.id) {
      return { success: false, message: 'Business owner not found' };
    }
    const businessOwnerId = business?.owner.id;

    await this.createPullNotification(
      `New question for your business "${business.name}": "${question}"`,
      businessOwnerId,
      JSON.stringify({ type: 'new-question', id: businessId }),
    );
     const businessOwner = await this.userRepo.findOne({
        where: { id: businessOwnerId },
        select: ['email'],
      });
    if (businessOwner?.email) {
      const heading = 'New Question Received';
      const bodyHtml = `
      <div class="main-text">
        You have received a new question for your business <strong>${business.name}</strong>:
      </div>
      <div class="main-text">
        Please review and respond to the question.
      </div>
    `;
      const emailHTML = this.buildEmail(heading, bodyHtml);
      this.createEmailNotification(
        [businessOwner.email],
        emailHTML,
        `New Question for Your Business: ${business.name}`,
        createdBy,
      );
    }
    return { success: true };
  }

  async notifyquestionAnswered(businessId: string, answer: string, createdBy: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId },
    });
    if (!business) {
      return { success: false, message: 'Business not found' };
    }
    await this.createPullNotification(
      `Your question for business "${business.name}" has been answered: "${answer}"`,
      createdBy,
      JSON.stringify({ type: 'question-answered', id: businessId }),
    );
      const user = await this.userRepo.findOne({
        where: { id: createdBy },
        select: ['email'],
      });
    if (user?.email) {
      const heading = 'Your Question Has Been Answered';
      const bodyHtml = `
      <div class="main-text">
        Your question for the business <strong>${business.name}</strong> has been answered
      </div>
      <div class="main-text">
        Please check the answer provided in your dashboard.
      </div>
    `;
      const emailHTML = this.buildEmail(heading, bodyHtml);
       this.createEmailNotification(
        [user.email],
        emailHTML,
        `Your Question Answered for Business: ${business.name}`,
        createdBy,
      );
    }
    return { success: true };
  }

  async getNotifications(userId: string) {
        const notifications = await this.notificationRepo.find({
          where: {
            created_by: userId,
            read: false,
            feedbacktype: 'onsite'
          },
          order: { created_at: 'DESC' }
        });
        return notifications.map(n => ({
          id: n.id,
          content: n.content,
          meta: n.meta ? JSON.parse(n.meta) : null
        }));
      }

  async markAsRead(id: string) {
        return this.notificationRepo.update(id, { read: true });
      }

    }
