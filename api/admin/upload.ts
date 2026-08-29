import type { VercelRequest, VercelResponse } from "@vercel/node";
import { IncomingForm, type File as FormidableFile } from "formidable";
import fs from "fs";
import { requireAdmin } from "../_lib/admin-utils";
import { createAdminClient } from "../_lib/supabase-admin";

// Vercel Node functions auto-parse JSON/urlencoded bodies; multipart uploads
// need the raw stream instead, so parsing is turned off here and handed to
// formidable (equivalent of the Next route's req.formData()).
export const config = {
  api: { bodyParser: false },
};

function parseForm(req: VercelRequest): Promise<{ file: FormidableFile | null }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 25 * 1024 * 1024 });
    form.parse(req as any, (err, _fields, files) => {
      if (err) return reject(err);
      const fileField = files.file;
      const file = Array.isArray(fileField) ? fileField[0] : fileField;
      resolve({ file: file ?? null });
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

  try {
    const { file } = await parseForm(req);
    if (!file) return res.status(400).json({ error: "No file" });

    const admin = createAdminClient();
    const originalName = file.originalFilename ?? "upload";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `home/${Date.now()}-${safeName}`;
    const contentType = file.mimetype ?? "application/octet-stream";
    const buffer = fs.readFileSync(file.filepath);

    const { error } = await admin.storage
      .from("media")
      .upload(path, buffer, { upsert: true, contentType });

    if (error) {
      return res.status(500).json({
        error: error.message + " (make sure the 'media' storage bucket exists)",
      });
    }

    const { data } = admin.storage.from("media").getPublicUrl(path);
    return res.status(200).json({
      url: data.publicUrl,
      type: contentType.startsWith("video") ? "video" : "image",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}
