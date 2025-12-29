
import { AppSettings } from "../types";

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export const simulateEmailDelivery = async (
  payload: EmailPayload,
  settings: AppSettings,
  onProgress: (status: string) => void
): Promise<boolean> => {
  onProgress("Initiating server-side mailing request...");
  
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        config: {
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpEncryption: settings.smtpEncryption,
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass,
          senderName: settings.senderName || settings.companyName,
          senderEmail: settings.senderEmail || settings.companyEmail
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Mailing failed.");
    }

    onProgress("Success! Message delivered.");
    return true;
  } catch (error: any) {
    onProgress(`Error: ${error.message}`);
    throw error;
  }
};
