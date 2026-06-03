import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = 'WeddingLK <invitations@weddinglk.com>'
const SUPPORT_ADDRESS = 'WeddingLK <hello@weddinglk.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weddinglk.com'

function weddingEmailWrapper(content: string, accentColor = '#8B1A4A'): string {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f9f5f0;font-family:Georgia,serif;">
    <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:${accentColor};padding:32px;text-align:center;">
        <span style="color:#fff;font-size:24px;letter-spacing:4px;font-weight:300;">💍 WeddingLK</span>
      </div>
      <div style="padding:40px 32px;">${content}</div>
      <div style="background:#f9f5f0;padding:20px 32px;text-align:center;color:#aaa;font-size:12px;">
        <p style="margin:0;">WeddingLK · Sri Lanka's #1 Digital Wedding Invitation Platform</p>
        <p style="margin:8px 0 0;"><a href="${APP_URL}" style="color:${accentColor};text-decoration:none;">weddinglk.com</a></p>
      </div>
    </div>
  </body>
  </html>`
}

export async function sendRSVPConfirmationToGuest(
  guestEmail: string,
  coupleName: string,
  attending: boolean,
  invitationSlug: string,
): Promise<void> {
  const invUrl = `${APP_URL}/inv/${invitationSlug}`
  const content = `
    <h1 style="margin:0 0 8px;font-size:28px;color:#3d1a24;text-align:center;">${coupleName}</h1>
    <p style="text-align:center;color:#8a6070;font-size:16px;margin-bottom:32px;">Wedding Invitation</p>
    <p style="color:#5a3040;font-size:16px;line-height:1.7;text-align:center;">
      ${attending
        ? `Thank you! Your attendance has been confirmed. We can't wait to celebrate with you! 🎊`
        : `We're sorry you can't make it. Thank you for letting us know.`
      }
    </p>
    <div style="text-align:center;margin-top:36px;">
      <a href="${invUrl}" style="display:inline-block;background:#8B1A4A;color:#fff;padding:14px 32px;text-decoration:none;border-radius:2px;font-size:15px;letter-spacing:1px;">
        View Invitation
      </a>
    </div>`

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: guestEmail,
    subject: `Your RSVP for ${coupleName}'s Wedding ✉️`,
    html: weddingEmailWrapper(content),
  })
}

export async function sendCoupleWelcome(
  coupleEmail: string,
  name1: string,
  name2: string,
  slug: string,
): Promise<void> {
  const dashboardUrl = `${APP_URL}/dashboard`
  const invUrl = `${APP_URL}/inv/${slug}`
  const content = `
    <h1 style="margin:0 0 8px;font-size:28px;color:#3d1a24;text-align:center;">Congratulations! 🥂</h1>
    <p style="text-align:center;color:#8a6070;font-size:16px;margin-bottom:24px;">${name1} & ${name2}</p>
    <p style="color:#5a3040;font-size:16px;line-height:1.7;">
      Your 3D wedding invitation is ready to share with your guests.<br>
      Head to your dashboard to copy your unique invitation link and start receiving RSVPs!
    </p>
    <div style="background:#fdf6f0;border-radius:4px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;font-size:13px;color:#8a6070;">Your invitation link:</p>
      <a href="${invUrl}" style="color:#8B1A4A;font-size:14px;word-break:break-all;">${invUrl}</a>
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#8B1A4A;color:#fff;padding:14px 32px;text-decoration:none;border-radius:2px;font-size:15px;letter-spacing:1px;">
        Go to Dashboard →
      </a>
    </div>`

  await resend.emails.send({
    from: SUPPORT_ADDRESS,
    to: coupleEmail,
    subject: `Your WeddingLK invitation is ready! 💍`,
    html: weddingEmailWrapper(content),
  })
}

export async function sendNewRSVPAlert(
  coupleEmail: string,
  coupleName: string,
  guestName: string,
  attending: boolean,
  totalRSVPs: number,
): Promise<void> {
  const dashboardUrl = `${APP_URL}/dashboard`
  const content = `
    <h2 style="margin:0 0 16px;color:#3d1a24;">New RSVP Received!</h2>
    <div style="background:#fdf6f0;border-left:4px solid #8B1A4A;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:18px;color:#3d1a24;font-weight:bold;">${guestName}</p>
      <p style="margin:0;font-size:16px;color:${attending ? '#2d7a50' : '#c0392b'};">
        ${attending ? '✓ Will attend' : '✗ Cannot attend'}
      </p>
    </div>
    <p style="color:#8a6070;">Total RSVPs so far: <strong>${totalRSVPs}</strong></p>
    <div style="text-align:center;margin-top:28px;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#8B1A4A;color:#fff;padding:14px 32px;text-decoration:none;border-radius:2px;font-size:15px;letter-spacing:1px;">
        View Dashboard →
      </a>
    </div>`

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: coupleEmail,
    subject: `${guestName} just RSVPd to your wedding!`,
    html: weddingEmailWrapper(content),
  })
}
