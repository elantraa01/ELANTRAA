type SendWhatsAppOrderOptions = {
  phone: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  paymentMethod?: string;
  itemsCount?: number;
};

/**
 * Normalizes phone numbers to standard international format (E.164 without '+')
 * Default country code for 10-digit numbers is '91' (India)
 */
function formatPhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Sends automated WhatsApp order confirmation message using Meta WhatsApp Cloud API
 */
export async function sendWhatsAppOrderNotification({
  phone,
  customerName,
  orderId,
  totalAmount,
}: SendWhatsAppOrderOptions): Promise<boolean> {
  if (!phone) {
    console.warn("[WhatsApp] No phone number available, skipping WhatsApp notification.");
    return false;
  }

  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME || "order_confirmation";
  const languageCode = process.env.META_WHATSAPP_LANGUAGE_CODE || "en_US";

  const formattedPhone = formatPhoneNumber(phone);

  if (!phoneNumberId || !accessToken) {
    console.warn(
      `[WhatsApp Cloud API] Meta credentials missing in .env (META_WHATSAPP_PHONE_NUMBER_ID / META_WHATSAPP_ACCESS_TOKEN). Skipping automated message to ${formattedPhone}.`
    );
    return false;
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  const formattedTotal = `₹${Number(totalAmount).toLocaleString("en-IN")}`;
  const shortOrderId = orderId.substring(0, 10).toUpperCase();

  // Template message payload for Meta WhatsApp Cloud API
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: customerName || "Valued Customer" },
            { type: "text", text: shortOrderId },
            { type: "text", text: formattedTotal },
          ],
        },
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp Cloud API Error]:", data);
      return false;
    }

    console.log(
      `[WhatsApp Cloud API Success] Notification sent to +${formattedPhone} for Order #${shortOrderId}. WAMID:`,
      data.messages?.[0]?.id
    );
    return true;
  } catch (error) {
    console.error("[WhatsApp Cloud API Error] Exception thrown:", error);
    return false;
  }
}
