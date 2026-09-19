// Supabase Edge Function: notify-reservation
// Wird per Database-Webhook bei jeder neuen Reservierung aufgerufen und
// schickt eine E-Mail an den Inhaber (über Resend).
//
// Benötigte Secrets (in Supabase -> Edge Functions -> notify-reservation -> Secrets):
//   RESEND_API_KEY   = dein Resend API-Key (re_...)
//   OWNER_EMAIL      = loegl@sbg.at   (Empfänger; muss die bei Resend bestätigte Adresse sein)

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const r = payload?.record ?? payload; // Webhook liefert { record: {...} }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") ?? "loegl@sbg.at";
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY fehlt" }), { status: 500 });
    }

    const created = r?.created_at
      ? new Date(r.created_at).toLocaleString("de-AT", { timeZone: "Europe/Vienna" })
      : new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" });

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#161513;">
        <h2 style="margin:0 0 12px;">Neue Click &amp; Collect Reservierung</h2>
        <p style="margin:0 0 16px;color:#555;">Eine neue Reservierung ist eingegangen:</p>
        <table style="border-collapse:collapse;font-size:15px;">
          <tr><td style="padding:5px 14px 5px 0;color:#888;">Artikel</td><td><strong>${r?.product_title ?? "—"}</strong></td></tr>
          <tr><td style="padding:5px 14px 5px 0;color:#888;">Kunde</td><td><strong>${r?.customer_name ?? "—"}</strong></td></tr>
          <tr><td style="padding:5px 14px 5px 0;color:#888;">Telefon</td><td>${r?.customer_phone ?? "—"}</td></tr>
          ${r?.customer_email ? `<tr><td style="padding:5px 14px 5px 0;color:#888;">E-Mail</td><td>${r.customer_email}</td></tr>` : ""}
          <tr><td style="padding:5px 14px 5px 0;color:#888;">Zeitpunkt</td><td>${created}</td></tr>
        </table>
        <p style="margin:22px 0 0;">
          <a href="https://fuerst-software.github.io/Loegl/admin/"
             style="background:#161513;color:#fff;padding:11px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
            Im Dashboard ansehen
          </a>
        </p>
      </div>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lögl Reservierungen <onboarding@resend.dev>",
        to: [OWNER_EMAIL],
        subject: `Neue Reservierung: ${r?.customer_name ?? "Kunde"} – ${r?.product_title ?? "Artikel"}`,
        html,
      }),
    });

    const text = await emailRes.text();
    return new Response(text, { status: emailRes.status, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
