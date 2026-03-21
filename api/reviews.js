export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // 쿠키에서 네이버 토큰 추출
  const cookieStr = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieStr.split("; ").filter(c => c.includes("=")).map(c => {
      const idx = c.indexOf("=");
      return [c.slice(0, idx), c.slice(idx + 1)];
    })
  );
  const token = cookies["naver_token"];
  if (!token) return res.status(401).json({ error: "로그인이 필요합니다" });

  const businessId = req.query.businessId || "8250200";
  const railwayUrl = process.env.RAILWAY_URL;
  const railwayToken = process.env.RAILWAY_AUTH_TOKEN;

  if (!railwayUrl) {
    return res.status(500).json({ error: "RAILWAY_URL 환경변수가 설정되지 않았습니다" });
  }

  try {
    const response = await fetch(`${railwayUrl}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": railwayToken,
      },
      body: JSON.stringify({ naverToken: token, businessId }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Railway 서버 오류" });
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
