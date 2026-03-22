export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username and password required" });

  const railwayUrl = process.env.RAILWAY_URL;
  const railwayToken = process.env.RAILWAY_AUTH_TOKEN;

  try {
    const response = await fetch(`${railwayUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": railwayToken },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error });

    // 세션 쿠키 저장
    res.setHeader("Set-Cookie", [
      `nid_aut=${data.nidAut}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      `nid_ses=${data.nidSes}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
    ]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
