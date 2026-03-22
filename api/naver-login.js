export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { cookieStr } = req.body;
  if (!cookieStr) return res.status(400).json({ error: "cookieStr이 필요합니다" });

  // 쿠키 문자열에서 NID_AUT, NID_SES 추출
  const parseCookie = (str, name) => {
    const match = str.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
  };

  const nidAut = parseCookie(cookieStr, "NID_AUT");
  const nidSes = parseCookie(cookieStr, "NID_SES");

  if (!nidAut || !nidSes) {
    return res.status(400).json({ error: "NID_AUT 또는 NID_SES를 찾을 수 없습니다" });
  }

  // 전체 쿠키 문자열과 NID 쿠키를 저장 (24시간)
  res.setHeader("Set-Cookie", [
    `nid_aut=${nidAut}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
    `nid_ses=${nidSes}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
    `sp_cookie=${encodeURIComponent(cookieStr)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
  ]);
  res.json({ success: true });
}
