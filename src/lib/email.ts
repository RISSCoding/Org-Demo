import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY tidak diset di .env");
  client = new Resend(key);
  return client;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "Notifikasi ORG <halo@farisfebrian.my.id>";
  const replyTo = process.env.EMAIL_REPLY_TO ?? "halo@farisfebrian.my.id";
  const resend = getClient();

  const { error } = await resend.emails.send({
    from,
    to: input.to,
    replyTo,
    subject: input.subject,
    html: input.html,
    text: input.text,
    headers: {
      // Beri tahu Gmail bahwa ini email transaksional, bukan bulk marketing.
      "X-Entity-Ref-ID": crypto.randomUUID(),
      "List-Unsubscribe": `<mailto:unsubscribe@farisfebrian.my.id?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) {
    throw new Error(`Resend: ${error.message}`);
  }
}
