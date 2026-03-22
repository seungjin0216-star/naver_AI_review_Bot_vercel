export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const cookieHeader = req.headers.cookie || "";
  const getCookie = (name) => {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const nidAut = getCookie("nid_aut");
  const nidSes = getCookie("nid_ses");
  if (!nidAut || !nidSes) return res.status(401).json({ error: "로그인이 필요합니다" });

  const { reviewId, replyContent, businessId } = req.body;
  if (!reviewId || !replyContent) return res.status(400).json({ error: "reviewId, replyContent 필요" });

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
