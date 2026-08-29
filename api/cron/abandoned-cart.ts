// Abandoned-cart reminder. Triggered by the Vercel cron in vercel.json.
//
// Note on timing: the Hobby plan runs a cron once a day, so this is not "four
// hours after you walked away" - it is a daily sweep that picks up anything
// abandoned between MIN_AGE and MAX_AGE. MIN_AGE keeps it from mailing
// someone who is still shopping right now; MAX_AGE stops it dredging up a
// cart from last month. carts.reminder_sent_at is what guarantees one email
// per cart, which is the whole difference between a reminder and spam.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createAdminClient } from "../_lib/supabase-admin.js";
import { listUserEmails } from "../_lib/admin-data.js";
import { sendEmail, abandonedCartEmail } from "../_lib/email.js";

const MIN_AGE_HOURS = 4;
const MAX_AGE_DAYS = 7;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel sends the cron secret as a bearer token. Without this the endpoint
  // is a public "mail all my customers" button.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = Date.now();
  const notBefore = new Date(now - MAX_AGE_DAYS * 86400_000).toISOString();
  const notAfter = new Date(now - MIN_AGE_HOURS * 3600_000).toISOString();

  const admin = createAdminClient();
  const { data: carts, error } = await admin
    .from("carts")
    .select("user_id, items, updated_at")
    .is("reminder_sent_at", null)
    .gte("updated_at", notBefore)
    .lte("updated_at", notAfter);

  if (error) {
    console.error("[cron/abandoned-cart]", error.message);
    return res.status(500).json({ error: "Query failed" });
  }

  const candidates = (carts ?? []).filter((c) => Array.isArray(c.items) && c.items.length > 0);
  if (candidates.length === 0) {
    return res.status(200).json({ checked: 0, sent: 0 });
  }

  const emails = await listUserEmails();
  let sent = 0;

  for (const cart of candidates) {
    const to = emails.get(cart.user_id);
    if (!to) continue;

    const mail = abandonedCartEmail(cart.items);
    const ok = await sendEmail({ to, ...mail });
    if (!ok) continue;

    // Stamped only on success, so a provider outage means these carts are
    // picked up again tomorrow rather than silently skipped forever.
    await admin
      .from("carts")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("user_id", cart.user_id);
    sent++;
  }

  return res.status(200).json({ checked: candidates.length, sent });
}
