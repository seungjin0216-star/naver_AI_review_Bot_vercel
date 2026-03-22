export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { nidAut, nidSes } = req.body;
  if (!nidAut || !nidSes) return res.status(400).json({ error: "NID_AUT와 NID_SES가 필요합니다" });

  // 쿠키로 저장 (24시간)
  res.setHeader("Set-Cookie", [
    `nid_aut=${nidAut}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
    `nid_ses=${nidSes}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
  ]);
  res.json({ success: true });
}
