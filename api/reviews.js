export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const cookieStr = req.headers.cookie || "";
  const parseCookie = (str, name) => {
    const match = str.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const spCookie = parseCookie(cookieStr, "sp_cookie");
  const nidAut = parseCookie(cookieStr, "nid_aut");
  const nidSes = parseCookie(cookieStr, "nid_ses");

  if (!nidAut || !nidSes) return res.status(401).json({ error: "로그인이 필요합니다" });

  const businessId = req.query.businessId || "8250200";
  const railwayUrl = process.env.RAILWAY_URL;
  const railwayToken = process.env.RAILWAY_AUTH_TOKEN;

  try {
    const response = await fetch(`${railwayUrl}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": railwayToken },
      body: JSON.stringify({
        cookieStr: spCookie || `NID_AUT=${nidAut}; NID_SES=${nidSes}`,
        businessId,
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
