export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cookieStr = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieStr.split("; ").filter(c => c.includes("=")).map(c => {
      const idx = c.indexOf("=");
      return [c.slice(0, idx), c.slice(idx + 1)];
    })
  );
  const nidAut = cookies["nid_aut"];
  const nidSes = cookies["nid_ses"];
  if (!nidAut || !nidSes) return res.status(401).json({ error: "로그인이 필요합니다" });

  const { reviewId, replyContent, businessId } = req.body;
  if (!reviewId || !replyContent) return res.status(400).json({ error: "reviewId와 replyContent가 필요합니다" });

  const railwayUrl = process.env.RAILWAY_URL;
  const railwayToken = process.env.RAILWAY_AUTH_TOKEN;

  try {
    const response = await fetch(`${railwayUrl}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": railwayToken },
      body: JSON.stringify({ nidAut, nidSes, businessId: businessId || "8250200", reviewId, replyContent }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
