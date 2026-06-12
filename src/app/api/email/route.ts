import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!
const FROM_EMAIL = 'noreply@quranmentorglobal.com'

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  return res.ok
}

// ── Email Templates ────────────────────────────────────────

function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0D3D20,#1B5E37);padding:32px 40px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        Quran<span style="color:#D4AF50;">Mentor</span>Global
      </p>
      <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:2px;">
        Online Quran Academy
      </p>
    </div>

    <!-- Content -->
    <div style="padding:36px 40px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #F0EBE0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9CA3AF;">
        © 2025 QuranMentorGlobal · 
        <a href="${APP_URL}" style="color:#1B5E37;text-decoration:none;">Visit Platform</a>
      </p>
      <p style="margin:6px 0 0;font-size:11px;color:#C4B5A0;font-style:italic;">
        خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
      </p>
    </div>
  </div>
</body>
</html>`
}

function newApplicationEmail(teacherName: string, teacherEmail: string, specializations: string[]) {
  return emailWrapper(`
    <div style="display:inline-block;background:#FEF3C7;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:28px;margin-bottom:20px;">📋</div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0D3D20;">New Teacher Application</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;line-height:1.6;">
      A new teacher has submitted a verification application and is waiting for your review.
    </p>

    <div style="background:#F5F0E8;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:1px;">Application Details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6B6B6B;width:120px;">Teacher</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#1A1A1A;">${teacherName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6B6B6B;">Email</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#1A1A1A;">${teacherEmail}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6B6B6B;">Specializations</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#1A1A1A;">${specializations.join(', ') || 'Not specified'}</td>
        </tr>
      </table>
    </div>

href=\"${process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.quranmentorglobal.com'}/teachers/pending\"
style="display:block;background:linear-gradient(135deg,#1B5E37,#0D3D20);color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:14px;text-align:center;">
      Review Application in Admin Panel →
    </a>
  `)
}

function approvedEmail(teacherName: string) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#E8F5EE;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">✅</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0D3D20;text-align:center;">
      Congratulations, ${teacherName}!
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;line-height:1.6;text-align:center;">
      Your teacher profile has been <strong style="color:#1B5E37;">approved</strong>. 
      You are now verified and listed publicly on QuranMentorGlobal!
    </p>

    <div style="background:#E8F5EE;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1B5E37;">What you can do now:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#3D3D3D;line-height:2;">
        <li>Add your courses and set your curriculum</li>
        <li>Students can now find and book you</li>
        <li>Set your availability in your profile</li>
        <li>Share your profile link with your network</li>
      </ul>
    </div>

    <a href="${APP_URL}/platform/teacher/dashboard"
      style="display:block;background:linear-gradient(135deg,#1B5E37,#0D3D20);color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:14px;text-align:center;">
      Go to My Dashboard →
    </a>

    <p style="margin:20px 0 0;font-size:13px;color:#9CA3AF;text-align:center;font-style:italic;">
      JazakAllah Khair for joining our community of Quran teachers.
    </p>
  `)
}

function rejectedEmail(teacherName: string, reason: string) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#FEE2E2;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">📝</div>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0D3D20;text-align:center;">
      Application Update
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;line-height:1.6;text-align:center;">
      Dear ${teacherName}, your verification application needs some updates before we can approve it.
    </p>

    ${reason ? `
    <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#DC2626;">Feedback from our team:</p>
      <p style="margin:0;font-size:14px;color:#3D3D3D;line-height:1.6;">${reason}</p>
    </div>` : ''}

    <div style="background:#F5F0E8;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1A1A1A;">What to do next:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#3D3D3D;line-height:2;">
        <li>Review the feedback above carefully</li>
        <li>Update your profile and application</li>
        <li>Resubmit for review</li>
      </ul>
    </div>

    <a href="${APP_URL}/platform/teacher/verification"
      style="display:block;background:linear-gradient(135deg,#B8952A,#D4AF50);color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:14px;text-align:center;">
      Update My Application →
    </a>

    <p style="margin:20px 0 0;font-size:13px;color:#9CA3AF;text-align:center;">
      Don't worry — many teachers need a couple of tries. We look forward to having you on the platform!
    </p>
  `)
}

// ── API Handler ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, teacherName, teacherEmail, specializations, reason } = body

    let success = false

    if (type === 'new_application') {
      // Email to admin
      success = await sendEmail(
        ADMIN_EMAIL,
        `📋 New Teacher Application — ${teacherName}`,
        newApplicationEmail(teacherName, teacherEmail, specializations || [])
      )
    }

    else if (type === 'approved') {
      // Email to teacher
      success = await sendEmail(
        teacherEmail,
        '✅ Your QuranMentorGlobal Application is Approved!',
        approvedEmail(teacherName)
      )
    }

    else if (type === 'rejected') {
      // Email to teacher
      success = await sendEmail(
        teacherEmail,
        '📝 Update Required — QuranMentorGlobal Application',
        rejectedEmail(teacherName, reason || '')
      )
    }

    return NextResponse.json({ success })

  } catch (err) {
    console.error('Email API error:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
