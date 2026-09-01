import nodemailer from "nodemailer";
import { getRequiredProductionEnv } from "@/lib/env";

interface EmailOrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{
    name: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export async function sendOrderConfirmationEmail(details: EmailOrderDetails) {
  try {
    // Transporter configuration (uses Ethereal/SMTP fallback in test mode)
    const smtpHost = getRequiredProductionEnv("SMTP_HOST") || "smtp.ethereal.email";
    const smtpUser = getRequiredProductionEnv("SMTP_USER") || "test_user";
    const smtpPass = getRequiredProductionEnv("SMTP_PASS") || "test_pass";
    const emailFrom = getRequiredProductionEnv("EMAIL_FROM") || '"ELANTRAA Concierge" <elantraa.01@gmail.com>';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const itemsHtml = details.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
          <strong style="font-family: Georgia, serif; color: #171717;">${item.name}</strong><br/>
          <span style="font-size: 11px; color: #777777;">Size: ${item.size || "M"} | Color: ${item.color || "Default"} | Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 600; color: #171717;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>ELANTRAA Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e5e5;">
            
            <!-- Brand Header -->
            <div style="background-color: #171717; color: #D4AF37; text-align: center; padding: 30px 20px; border-bottom: 2px solid #C9A648;">
              <h1 style="font-family: Georgia, serif; letter-spacing: 4px; margin: 0; font-size: 26px; text-transform: uppercase;">ELANTRAA</h1>
              <span style="font-size: 9px; letter-spacing: 3px; uppercase; color: #C9A648;">HAUTE COUTURE PRIVÉ</span>
            </div>

            <!-- Email Body -->
            <div style="padding: 30px 25px;">
              <span style="font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #C9A648; text-transform: uppercase;">CONFIRMATION RECEIPT</span>
              <h2 style="font-family: Georgia, serif; color: #171717; margin-top: 5px; font-size: 22px;">Thank You For Your Order, ${details.customerName}</h2>
              <p style="font-size: 13px; color: #555555; line-height: 1.6;">
                We have successfully received your haute couture order. Our master artisans are preparing your bespoke garments for express delivery.
              </p>

              <!-- Order Summary Box -->
              <div style="background-color: #FAF8F5; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #dddddd; pb: 10px; margin-bottom: 10px;">
                  <div>
                    <span style="font-size: 10px; color: #888888; text-transform: uppercase;">Order Number:</span><br/>
                    <strong style="font-family: Georgia, serif; font-size: 16px; color: #171717;">${details.orderId}</strong>
                  </div>
                  <div>
                    <span style="font-size: 10px; color: #888888; text-transform: uppercase;">Payment Status:</span><br/>
                    <strong style="font-size: 12px; color: #10B981;">${details.paymentMethod === "COD" ? "PENDING (COD)" : "PAID (RAZORPAY)"}</strong>
                  </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="text-transform: uppercase; font-size: 10px; color: #888888; text-align: left;">
                      <th style="padding-bottom: 8px;">Item Description</th>
                      <th style="padding-bottom: 8px; text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="margin-top: 15px; pt: 10px; border-top: 2px solid #171717; text-align: right;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #666666;">Grand Total:</span>
                  <span style="font-family: Georgia, serif; font-size: 20px; font-weight: bold; color: #C9A648; margin-left: 10px;">
                    ₹${details.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <!-- Shipping Address Box -->
              <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 15px; font-size: 12px; color: #555555;">
                <strong style="text-transform: uppercase; color: #171717; font-size: 11px; display: block; margin-bottom: 5px;">Delivery Address</strong>
                ${details.shippingAddress.line1}<br/>
                ${details.shippingAddress.line2 ? details.shippingAddress.line2 + "<br/>" : ""}
                ${details.shippingAddress.city}, ${details.shippingAddress.state} - ${details.shippingAddress.pincode}<br/>
                ${details.shippingAddress.country}
              </div>
            </div>

            <!-- Email Footer -->
            <div style="background-color: #FAF8F5; text-align: center; padding: 20px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #888888;">
              <p style="margin: 0 0 5px 0;">Need assistance with your couture order?</p>
              <p style="margin: 0; font-weight: bold; color: #C9A648;">elantraa.01@gmail.com | +91 9015342951</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: emailFrom,
      to: details.customerEmail,
      subject: `Order Confirmation: ${details.orderId} | ELANTRAA Haute Couture`,
      html: emailHtml,
    });

    console.log("Order confirmation email dispatched:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn("Order confirmation email notification warning:", error);
    return { success: false, error };
  }
}
