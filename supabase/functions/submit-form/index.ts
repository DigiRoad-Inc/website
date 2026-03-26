import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ── CORS ──────────────────────────────────────────────────────────────────
   Restrict to your production domain once deployed.
   e.g. "https://digiroad.com"
──────────────────────────────────────────────────────────────────────────── */
const ALLOWED_ORIGIN = "*";

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/* ── Main handler ────────────────────────────────────────────────────────── */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { type, ...data } = body;

  // Map form type → table name
  const tableMap: Record<string, string> = {
    pricing: "pricing_requests",
    contact: "contact_submissions",
    demo:    "demo_requests",
  };

  const table = tableMap[type as string];
  if (!table) {
    return json({ error: "Unknown form type" }, 400);
  }

  // Create Supabase client using server-side secrets (never exposed to browser)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error: dbError } = await supabase.from(table).insert(data);
  if (dbError) {
    console.error("DB error:", dbError);
    return json({ error: "Failed to save submission" }, 500);
  }

  /* ── Resend email notification ────────────────────────────────────────── */
  const resendKey   = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL");

  if (resendKey && notifyEmail) {
    const senderEmail = (data.email ?? data.work_email ?? "unknown") as string;
    const senderName  = (data.full_name ?? "Someone") as string;

    const labelMap: Record<string, string> = {
      pricing: "Pricing Request",
      contact: "Contact Form",
      demo:    "Demo Request",
    };

    const rows = Object.entries(data)
      .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#064e3b;white-space:nowrap">${k.replace(/_/g," ")}</td><td style="padding:6px 12px;color:#334155">${Array.isArray(v) ? v.join(", ") : v ?? "—"}</td></tr>`)
      .join("");

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DigiRoad <no-reply@digiroad.co>",
        to: [notifyEmail],
        subject: `New ${labelMap[type as string] ?? type} from ${senderName} (${senderEmail})`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f5f6f5;padding:32px 24px">
            <div style="background:#064e3b;border-radius:12px 12px 0 0;padding:24px 28px">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em">DigiRoad</span>
              <span style="color:rgba(255,255,255,0.5);font-size:13px;margin-left:12px">${labelMap[type as string] ?? type}</span>
            </div>
            <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:28px">
              <p style="margin:0 0 20px;font-size:14px;color:#475569">A new submission was received on <strong>${new Date().toUTCString()}</strong></p>
              <table style="width:100%;border-collapse:collapse;font-size:13.5px">
                <tbody>${rows}</tbody>
              </table>
            </div>
            <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:20px">DigiRoad · Automated notification</p>
          </div>`,
      }),
    });
    if (!resendRes.ok) {
      const resendErr = await resendRes.text();
      console.error("Resend error:", resendRes.status, resendErr);
    }
  }
  /* ───────────────────────────────────────────────────────────────────── */

  return json({ success: true });
});
