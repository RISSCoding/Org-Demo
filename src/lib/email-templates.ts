import { BRAND } from "@/lib/brand";

export type NotificationEmailInput = {
  recipientName: string;
  title: string;
  body?: string;
  link?: string;
  appUrl: string;
};

/**
 * Template email notifikasi. HTML inline-CSS, kompatibel dengan Gmail/Outlook.
 * Bukan React Email — supaya tidak ada dependensi tambahan dan build lebih ringan.
 */
export function renderNotificationEmail(input: NotificationEmailInput): { html: string; text: string; subject: string } {
  const { recipientName, title, body, link, appUrl } = input;

  const actionUrl = link ? `${appUrl}${link}` : appUrl;
  const safeBody = body ? escapeHtml(body) : "";
  const safeTitle = escapeHtml(title);
  const safeName = escapeHtml(recipientName);

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:0;">
          <div style="background:#0a0a0a;padding:20px 28px;">
            <span style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#ffa500;color:#0a0a0a;font-weight:800;font-size:15px;line-height:36px;text-align:center;vertical-align:middle;">${BRAND.logoInitials}</span>
            <span style="color:#ffffff;font-weight:700;font-size:16px;margin-left:12px;vertical-align:middle;">${BRAND.short}</span>
          </div>
        </td></tr>
        <tr><td style="padding:32px 28px 8px;">
          <p style="margin:0 0 8px;font-size:14px;color:#666666;">Halo ${safeName},</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0a0a0a;">${safeTitle}</h1>
          ${safeBody ? `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#333333;">${safeBody.replace(/\n/g, "<br>")}</p>` : ""}
        </td></tr>
        <tr><td style="padding:0 28px 32px;">
          <a href="${actionUrl}" style="display:inline-block;background:#ffa500;color:#0a0a0a;font-weight:600;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:6px;">Buka di aplikasi</a>
        </td></tr>
        <tr><td style="padding:20px 28px;background:#fafafa;border-top:1px solid #eeeeee;">
          <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;">
            Email ini dikirim otomatis oleh ${BRAND.short}. Kalau tidak mau menerima email seperti ini,
            buka <a href="${appUrl}/dashboard/settings/notifications" style="color:#666666;text-decoration:underline;">Pengaturan Notifikasi</a> dan cabut persetujuan email.
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#999999;">${BRAND.fullName}</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${recipientName},

${title}
${body ? `\n${body}\n` : ""}
Buka di aplikasi: ${actionUrl}

---
Kalau tidak mau terima email seperti ini, buka:
${appUrl}/dashboard/settings/notifications`;

  return { html, text, subject: title };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type PasswordResetEmailInput = {
  recipientName: string;
  resetUrl: string;
  expiresMinutes: number;
  appUrl: string;
};

export function renderPasswordResetEmail(input: PasswordResetEmailInput): {
  html: string;
  text: string;
  subject: string;
} {
  const { recipientName, resetUrl, expiresMinutes, appUrl } = input;
  const safeName = escapeHtml(recipientName);
  const subject = "Reset password akun " + BRAND.short;

  const html = `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#0a0a0a;padding:20px 28px;">
          <span style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#ffa500;color:#0a0a0a;font-weight:800;font-size:15px;line-height:36px;text-align:center;vertical-align:middle;">${BRAND.logoInitials}</span>
          <span style="color:#ffffff;font-weight:700;font-size:16px;margin-left:12px;vertical-align:middle;">${BRAND.short}</span>
        </td></tr>
        <tr><td style="padding:32px 28px 8px;">
          <p style="margin:0 0 8px;font-size:14px;color:#666666;">Halo ${safeName},</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0a0a0a;">Reset password</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#333333;">
            Kami menerima permintaan reset password untuk akunmu. Klik tombol di bawah untuk membuat password baru.
            Tautan ini berlaku <strong>${expiresMinutes} menit</strong> dan hanya bisa dipakai sekali.
          </p>
        </td></tr>
        <tr><td style="padding:0 28px 24px;">
          <a href="${resetUrl}" style="display:inline-block;background:#ffa500;color:#0a0a0a;font-weight:600;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:6px;">Buat password baru</a>
        </td></tr>
        <tr><td style="padding:0 28px 32px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">
            Kalau tombol tidak bekerja, salin tautan ini ke browser:<br>
            <a href="${resetUrl}" style="color:#9a5a00;word-break:break-all;">${resetUrl}</a>
          </p>
        </td></tr>
        <tr><td style="padding:20px 28px;background:#fafafa;border-top:1px solid #eeeeee;">
          <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;">
            Kalau kamu tidak meminta reset password, abaikan email ini. Password tidak akan berubah tanpa kamu mengklik tautan di atas.
            Untuk keamanan, pertimbangkan ganti password secara berkala dari <a href="${appUrl}/dashboard/profile" style="color:#666666;text-decoration:underline;">halaman Profil</a>.
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#999999;">${BRAND.fullName}</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${recipientName},

Kami menerima permintaan reset password untuk akunmu.
Buka tautan berikut untuk membuat password baru (berlaku ${expiresMinutes} menit):

${resetUrl}

Kalau kamu tidak meminta reset password, abaikan email ini. Password tidak akan berubah tanpa kamu mengklik tautan di atas.

---
${BRAND.fullName}`;

  return { html, text, subject };
}
