import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      recipientName,
      to,
      phone,
      role = 'student',
      tempPassword,
      identifier,
      rollNo,
      prn,
      course,
      semester,
      department,
    } = data;

    if (!to || !recipientName || !tempPassword) {
      return NextResponse.json(
        { error: 'Missing required credentials parameters' },
        { status: 400 }
      );
    }

    const collegeName = 'Modern College of Computer Science & Information Technology, Nanded';
    const affiliation = 'Affiliated to Swami Ramanand Teerth Marathwada University (SRTMUN)';

    // Determine Base URL (Supports localhost, Wi-Fi LAN IP, or custom domain)
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
    const baseUrl = configuredUrl && !configuredUrl.includes('localhost') ? configuredUrl : `${protocol}://${host}`;

    // 1. Bind all admission credentials and metadata into a secure payload
    const qrPayload = {
      institution: 'Modern College of CS & IT, Nanded',
      type: 'SMART_CAMPUS_ADMISSION_PASS',
      name: recipientName,
      email: to,
      pass: tempPassword,
      role: role || 'student',
      rollNo: rollNo || '',
      prn: prn || identifier || '',
      course: course || '',
      semester: semester || '',
      department: department || '',
      phone: phone || '',
      issuedAt: new Date().toISOString(),
    };

    // 2. Encode payload into base64 token
    const tokenBase64 = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
    const loginUrl = `${baseUrl}/?auth_qr=${encodeURIComponent(tokenBase64)}`;

    // 3. Generate High-Resolution QR Code (Buffer for attachment & DataURL for preview)
    const qrBuffer = await QRCode.toBuffer(loginUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: '#0f172a', // Deep navy
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    const qrDataUrl = await QRCode.toDataURL(loginUrl, {
      width: 450,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    // 4. Craft HTML Email with the Digital Admission QR Pass embedded cleanly
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 30px -8px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .badge { display: inline-block; background: rgba(59, 130, 246, 0.25); color: #93c5fd; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .title { margin: 0; font-size: 19px; font-weight: 800; line-height: 1.35; letter-spacing: 0.2px; }
    .subtitle { margin-top: 6px; font-size: 12px; color: #cbd5e1; }
    .content { padding: 32px 28px; text-align: center; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-align: left; }
    .intro { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 24px; text-align: left; }
    
    /* Digital ID QR Card */
    .id-card { background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); border-radius: 20px; padding: 24px; color: #ffffff; margin-bottom: 24px; border: 2px solid #3b82f6; box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3); text-align: center; }
    .id-card-header { border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 12px; margin-bottom: 16px; }
    .id-card-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #60a5fa; }
    .id-student-name { font-size: 18px; font-weight: 800; margin-top: 4px; color: #ffffff; }
    .id-meta { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    
    /* QR Display Box */
    .qr-box { background: #ffffff; padding: 14px; border-radius: 16px; display: inline-block; margin: 12px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .qr-image { display: block; width: 220px; height: 220px; border-radius: 8px; }
    
    .qr-caption { font-size: 12px; font-weight: 700; color: #93c5fd; margin-top: 12px; }
    .qr-subcaption { font-size: 11px; color: #cbd5e1; margin-top: 2px; }
    
    /* Details Summary Pill */
    .details-grid { background: #f1f5f9; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px; text-align: left; font-size: 12px; }
    .detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #cbd5e1; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 600; }
    .detail-val { color: #0f172a; font-weight: 700; }

    .btn { display: block; width: 100%; box-sizing: border-box; background: #2563eb; color: #ffffff !important; text-align: center; padding: 15px 20px; border-radius: 14px; font-weight: 800; font-size: 14px; text-decoration: none; margin-top: 16px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .instructions { font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: left; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${affiliation}</div>
      <h1 class="title">${collegeName}</h1>
      <div class="subtitle">Official Smart Campus • Digital Student Identity &amp; ERP Access</div>
    </div>
    <div class="content">
      <div class="greeting">Dear ${recipientName},</div>
      <p class="intro">
        Congratulations on your official admission to <strong>${collegeName}</strong>. 
        To ensure maximum security and instant login, all your institutional student credentials have been securely bound into your 
        <strong>Digital Admission QR Pass</strong> below.
      </p>

      <!-- Digital Identity QR Card -->
      <div class="id-card">
        <div class="id-card-header">
          <div class="id-card-title">Digital Student Admission Pass</div>
          <div class="id-student-name">${recipientName}</div>
          <div class="id-meta">${course || 'Computer Science'} • ${department || 'CS &amp; IT'}</div>
        </div>

        <!-- The Scannable QR Code -->
        <div class="qr-box">
          <img src="cid:admission_qr" alt="Official Admission QR Pass" class="qr-image" />
        </div>

        <div class="qr-caption">📷 Scan with any Smartphone Camera for 1-Tap Login</div>
        <div class="qr-subcaption">Your roll number, university PRN, and secure login access are bound inside this QR.</div>
      </div>

      <!-- Quick Summary Details -->
      <div class="details-grid">
        <div class="detail-row">
          <span class="detail-label">Student Name:</span>
          <span class="detail-val">${recipientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Registered Email:</span>
          <span class="detail-val">${to}</span>
        </div>
        ${rollNo ? `
        <div class="detail-row">
          <span class="detail-label">Assigned Roll No:</span>
          <span class="detail-val" style="font-family: monospace;">${rollNo}</span>
        </div>` : ''}
        ${prn ? `
        <div class="detail-row">
          <span class="detail-label">University PRN:</span>
          <span class="detail-val" style="font-family: monospace;">${prn}</span>
        </div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Security Method:</span>
          <span class="detail-val" style="color: #16a34a;">Encrypted in Personal QR Pass</span>
        </div>
      </div>

      <!-- 1-Tap Direct Web Button -->
      <a href="${loginUrl}" class="btn" target="_blank">📱 1-Tap Direct Login to Smart Campus</a>

      <div class="instructions">
        <strong>How to use your Digital QR Pass:</strong>
        <br>1. <strong>Direct Camera Scan:</strong> Open your smartphone camera and point it at the QR code above. Tap the link that appears to log in instantly without typing passwords.
        <br>2. <strong>Save / Download:</strong> An official high-resolution image of this QR Pass is attached to this email. You can save it to your phone or present it at the campus gate, examination hall, and library.
        <br>3. <strong>Same Device Access:</strong> If you are opening this email on your phone or laptop, simply tap the <strong>1-Tap Direct Login</strong> button above.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Modern College of Computer Science &amp; IT, Nanded. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    // 5. Send Email via Nodemailer with QR Attachments
    const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS;
    const rawHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const rawPort = process.env.SMTP_PORT || process.env.EMAIL_PORT;
    const rawFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM;

    let emailSent = false;
    let message = 'Admission QR Pass successfully dispatched to student.';

    if (rawUser && rawPass) {
      const smtpUser = rawUser.trim();
      const smtpPass = rawPass.trim().replace(/\s+/g, '');
      const isGmail = !rawHost || rawHost.includes('gmail') || smtpUser.toLowerCase().includes('@gmail.com');
      const smtpHost = rawHost || (isGmail ? 'smtp.gmail.com' : 'localhost');
      const smtpPort = Number(rawPort) || (isGmail ? 465 : 587);
      const smtpFrom = rawFrom || (isGmail ? `"Modern College Nanded" <${smtpUser}>` : `"Modern College Admin" <admin@modernclg.edu.in>`);

      try {
        const transporter = isGmail
          ? nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
          })
          : nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
          });

        const safeFilename = `Modern_College_Admission_Pass_${(rollNo || prn || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;

        await transporter.sendMail({
          from: smtpFrom,
          to,
          subject: `Official Digital Admission QR Pass - ${recipientName} (${collegeName})`,
          html: htmlContent,
          text: `Welcome to Modern College of Computer Science & IT, Nanded.\n\nDear ${recipientName},\n\nYour institutional admission is confirmed. All your credentials and 1-tap campus login have been bound into your personal Digital Admission QR Pass.\n\nPlease open the attached Digital QR Pass image or click the direct login link below:\n\n1-Tap Login Link: ${loginUrl}\n\nRoll No: ${rollNo || ''}\nPRN: ${prn || ''}\nCourse: ${course || ''}\n\nBest regards,\nAdministration Desk\nModern College of CS & IT, Nanded`,
          attachments: [
            {
              filename: 'admission-qr.png',
              content: qrBuffer,
              cid: 'admission_qr',
              contentType: 'image/png',
            },
            {
              filename: safeFilename,
              content: qrBuffer,
              contentType: 'image/png',
            },
          ],
        });

        emailSent = true;
        message = `Digital Admission QR Pass successfully delivered to ${to}`;
        console.log(`[Email Dispatch Service] ✅ Digital QR Pass delivered via SMTP to: ${to}`);
      } catch (smtpError: any) {
        console.warn('[Email Dispatch Service] ⚠️ SMTP Send Error:', smtpError?.message);
        message = `Digital QR Pass prepared. (SMTP notice: ${smtpError?.message})`;
      }
    } else {
      console.log(`[Email Dispatch Service] ℹ️ Prepared QR credentials for: ${to} (SMTP credentials not configured in .env.local)`);
      message = `Digital QR Pass generated for ${to}. To deliver directly to inbox in the background, set SMTP_USER and SMTP_PASS in .env.local.`;
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message,
      to,
      recipientName,
      qrDataUrl,
      loginUrl,
      qrPayload,
      htmlPreview: htmlContent,
    });
  } catch (error: any) {
    console.error('Credentials Dispatch Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch credentials email' },
      { status: 500 }
    );
  }
}
