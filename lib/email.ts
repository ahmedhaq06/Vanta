import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_ADDRESS = process.env.RESEND_FROM; // e.g. "Your Name <noreply@yourdomain.com>" (must be a verified domain)

export interface EmailData {
  to: string;
  name: string;
  subject: string;
  html: string;
}

export async function sendBatchEmails(emails: EmailData[]): Promise<any> {
  const from = FROM_ADDRESS || 'Vanta <onboarding@resend.dev>';
  console.log(`📧 Sending batch emails count=${emails.length} from="${from}"`);
  if (!FROM_ADDRESS) {
    console.warn('⚠ RESEND_FROM is not set. Using onboarding@resend.dev (test-only). You can only send to your own email until a domain is verified and RESEND_FROM is configured.');
  }
  emails.forEach((e, i) => {
    console.log(`📧 Email ${i+1}: to=${e.to} subject="${e.subject}" htmlLength=${e.html.length}`);
  });
  try {
    const batchData = emails.map(email => ({
      from,
      to: [email.to],
      subject: email.subject,
      html: email.html
    }));
    console.log('📧 Calling Resend batch.send API...');
    const result = await resend.batch.send(batchData);
    console.log('✅ Resend batch response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending batch emails:', error);
    if (error && typeof error === 'object') {
      try {
        console.error('❌ Resend error details:', JSON.stringify(error, null, 2));
      } catch {}
    }
    throw error;
  }
}

export async function sendSingleEmail(email: EmailData): Promise<any> {
  const from = FROM_ADDRESS || 'Vanta <onboarding@resend.dev>';
  console.log(`📧 Sending single email to=${email.to} subject="${email.subject}" from="${from}"`);
  if (!FROM_ADDRESS) {
    console.warn('⚠ RESEND_FROM is not set. Using onboarding@resend.dev (test-only). You can only send to your own email until a domain is verified and RESEND_FROM is configured.');
  }
  try {
    const result = await resend.emails.send({
      from,
      to: [email.to],
      subject: email.subject,
      html: email.html
    });
    console.log('✅ Resend single email response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error && typeof error === 'object') {
      try {
        console.error('❌ Resend error details:', JSON.stringify(error, null, 2));
      } catch {}
    }
    throw error;
  }
}
