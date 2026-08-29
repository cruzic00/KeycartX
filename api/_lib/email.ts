// api/_lib/email.ts
// Transactional email via Brevo's HTTP API.
//
// Supabase only sends auth emails (confirm signup, reset password) and its
// built-in SMTP is rate-limited for testing, so order mail has to be sent
// from here. Brevo rather than Resend because Resend needs a verified domain
// to mail anyone but yourself, and this store has no domain yet - Brevo can
// send from a single verified address instead.
//
// EMAIL_FROM is the sending address only. It is never rendered anywhere on
// the site, so it does not have to be an address the store publishes.
//
// Nothing here ever throws at the caller. An order must still be placed if
// the mail provider is down or unconfigured; a missing receipt is an
// annoyance, a failed checkout is lost money.
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export type Mail = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
};

export function emailConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn("[email] BREVO_API_KEY/EMAIL_FROM not set - skipping:", mail.subject);
    return false;
  }
  if (!mail.to) {
    console.warn("[email] no recipient - skipping:", mail.subject);
    return false;
  }

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: from, name: process.env.EMAIL_FROM_NAME || "KeyCartX" },
        to: [{ email: mail.to, ...(mail.toName ? { name: mail.toName } : {}) }],
        subject: mail.subject,
        htmlContent: mail.html,
      }),
    });

    if (!res.ok) {
      console.error("[email] brevo rejected:", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

// ---------------------------------------------------------------- templates

const BRAND = "#111827";
const SITE = process.env.PUBLIC_SITE_URL || "https://keycartx-eta.vercel.app";

export const rupees = (paisa: number) => `₹${Math.round((paisa ?? 0) / 100)}`;

function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Inline styles and a table layout: email clients strip <style> blocks and
// have no flexbox worth relying on.
function shell(heading: string, body: string, cta?: { label: string; href: string }) {
  return `<div style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="padding:20px 28px;background:${BRAND}">
      <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.02em">KeyCart<span style="color:#9ca3af">X</span></span>
    </div>
    <div style="padding:28px">
      <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND}">${esc(heading)}</h1>
      ${body}
      ${
        cta
          ? `<p style="margin:28px 0 0"><a href="${esc(cta.href)}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:700;font-size:14px">${esc(cta.label)}</a></p>`
          : ""
      }
    </div>
    <div style="padding:18px 28px;background:#f9fafb;color:#6b7280;font-size:12px">
      Questions? Just reply to this email.<br />
      <a href="${SITE}" style="color:#6b7280">keycartx-eta.vercel.app</a>
    </div>
  </div>
</div>`;
}

function itemRows(items: any[]) {
  return (items ?? [])
    .map(
      (i) => `<tr>
      <td style="padding:8px 0;color:${BRAND};font-size:14px">${esc(i.name ?? i.title ?? "Item")}${
        i.size ? ` <span style="color:#6b7280">(${esc(i.size)})</span>` : ""
      } <span style="color:#6b7280">&times; ${Number(i.qty ?? i.quantity ?? 1)}</span></td>
      <td style="padding:8px 0;text-align:right;color:${BRAND};font-size:14px;white-space:nowrap">${rupees(
        (i.price ?? 0) * Number(i.qty ?? i.quantity ?? 1)
      )}</td>
    </tr>`
    )
    .join("");
}

export function orderPlacedEmail(order: { id: string; items: any[]; total: number; shipping?: any }) {
  const addr = order.shipping ?? {};
  const address = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(", ");

  const body = `
    <p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.6">
      Thanks for your order. We&rsquo;ve received it and will let you know as soon as it ships.
      You&rsquo;ll pay <strong>${rupees(order.total)}</strong> in cash when it arrives.
    </p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb">
      ${itemRows(order.items)}
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid #e5e7eb;font-weight:700;color:${BRAND}">Total</td>
        <td style="padding:12px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:700;color:${BRAND}">${rupees(order.total)}</td>
      </tr>
    </table>
    ${
      address
        ? `<p style="margin:20px 0 0;color:#6b7280;font-size:13px"><strong style="color:${BRAND}">Delivering to</strong><br />${esc(address)}</p>`
        : ""
    }
    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">Order #${esc(String(order.id).slice(0, 8))}</p>`;

  return {
    subject: `Order confirmed - ${rupees(order.total)}`,
    html: shell("Your order is confirmed", body, { label: "View your orders", href: `${SITE}/orders` }),
  };
}

const STATUS_COPY: Record<string, { subject: string; heading: string; line: string }> = {
  paid: {
    subject: "Payment received",
    heading: "Payment received",
    line: "We&rsquo;ve received your payment and are getting your order ready.",
  },
  shipped: {
    subject: "Your order has shipped",
    heading: "Your order is on the way",
    line: "Your order has left our hands and is with the courier.",
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "Delivered",
    line: "Your order has been delivered. We hope you like it - a review would help other shoppers.",
  },
  cancelled: {
    subject: "Your order was cancelled",
    heading: "Order cancelled",
    line: "This order has been cancelled. If you paid for it, the refund is on its way. If this wasn&rsquo;t you, reply to this email.",
  },
};

export function orderStatusEmail(order: { id: string; total: number; shipping?: any }, status: string) {
  const copy = STATUS_COPY[status];
  if (!copy) return null; // e.g. back to "pending" - not worth an email

  const tracking = order.shipping?.tracking;
  const body = `
    <p style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.6">${copy.line}</p>
    ${
      tracking
        ? `<p style="margin:0 0 16px;color:#4b5563;font-size:14px"><strong style="color:${BRAND}">Tracking:</strong> ${esc(tracking)}</p>`
        : ""
    }
    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">Order #${esc(String(order.id).slice(0, 8))} &middot; ${rupees(order.total)}</p>`;

  return {
    subject: `${copy.subject} - order #${String(order.id).slice(0, 8)}`,
    html: shell(copy.heading, body, { label: "View your orders", href: `${SITE}/orders` }),
  };
}

export function abandonedCartEmail(items: any[]) {
  const total = (items ?? []).reduce(
    (sum, i) => sum + (i.price ?? 0) * Number(i.qty ?? i.quantity ?? 1),
    0
  );
  const body = `
    <p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.6">
      You left these in your cart. They&rsquo;re still there - stock lasts as long as it lasts.
    </p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb">
      ${itemRows(items)}
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid #e5e7eb;font-weight:700;color:${BRAND}">Total</td>
        <td style="padding:12px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:700;color:${BRAND}">${rupees(total)}</td>
      </tr>
    </table>`;

  return {
    subject: "You left something in your cart",
    html: shell("Still interested?", body, { label: "Finish your order", href: `${SITE}/cart` }),
  };
}
