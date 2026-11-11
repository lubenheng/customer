// =================================================================================================================
// 样片申请接口（Cloudflare Pages Functions）
// 地址：POST /api/sample，请求体为 JSON
// 收到申请后通过 Resend 邮件服务发送到绑定邮箱。
//
// 需要在 Cloudflare 控制台 → Workers & Pages → 本项目 → Settings → Variables and Secrets 中设置：
//   RESEND_API_KEY     Resend 的 API Key（类型选 Secret）
//   SAMPLE_TO_EMAIL    收件邮箱（未绑定自有域名时，必须是注册 Resend 的邮箱）
//   SAMPLE_FROM_EMAIL  可选，发件地址；不填时使用 Resend 测试发件地址 onboarding@resend.dev
// =================================================================================================================

// 各字段最大长度，防止超长提交
const LIMITS = { series: 100, company: 100, contact: 50, phone: 30, email: 100, note: 2000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_FROM = '样片申请 <onboarding@resend.dev>'

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  返回 JSON 响应
// 参数说明  status HTTP 状态码；body 响应对象
// 返回参数  Response
// 使用示例  json(400, { ok: false, error: '缺少字段' })
// 备注信息  无
//-------------------------------------------------------------------------------------------------------------------
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  HTML 转义，用于拼接邮件正文
// 参数说明  s 原始文字
// 返回参数  转义后的文字
// 使用示例  esc('<b>') // '&lt;b&gt;'
// 备注信息  无
//-------------------------------------------------------------------------------------------------------------------
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  校验并整理提交的数据
// 参数说明  body 请求体对象
// 返回参数  { data } 校验通过；{ error } 校验失败的原因
// 使用示例  const { data, error } = validate(await request.json())
// 备注信息  公司名称、联系人、联系电话、联系邮箱必填；申请产品、申请说明选填；
//           website 为隐藏的防机器人字段，正常用户不会填写
//-------------------------------------------------------------------------------------------------------------------
export function validate(body) {
  if (!body || typeof body !== 'object') return { error: '请求格式错误' }
  if (body.website) return { error: 'spam' }
  const data = {}
  for (const [k, max] of Object.entries(LIMITS)) {
    const v = typeof body[k] === 'string' ? body[k].trim() : ''
    if (v.length > max) return { error: `字段 ${k} 过长` }
    data[k] = v
  }
  for (const k of ['company', 'contact', 'phone', 'email']) {
    if (!data[k]) return { error: `缺少必填字段 ${k}` }
  }
  if (!EMAIL_RE.test(data.email)) return { error: '邮箱格式不正确' }
  return { data }
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成邮件主题和正文
// 参数说明  d 校验后的数据
// 返回参数  { subject, html, text }
// 使用示例  const mail = buildMail(data)
// 备注信息  同时提供 HTML 与纯文本两种正文
//-------------------------------------------------------------------------------------------------------------------
export function buildMail(d) {
  const rows = [
    ['申请产品', d.series || '（未填写）'],
    ['公司名称', d.company],
    ['联系人', d.contact],
    ['联系电话', d.phone],
    ['联系邮箱', d.email],
    ['申请说明', d.note || '（未填写）']
  ]
  const subject = `【样片申请】${d.company} - ${d.contact}${d.series ? ` - ${d.series}` : ''}`
  const html =
    '<table cellpadding="8" style="border-collapse:collapse;font-size:14px">' +
    rows
      .map(([k, v]) =>
        `<tr><td style="border:1px solid #ddd;background:#f5f5f5;white-space:nowrap">${k}</td>` +
        `<td style="border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`)
      .join('') +
    '</table>'
  const text = rows.map(([k, v]) => `${k}：${v}`).join('\n')
  return { subject, html, text }
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  处理样片申请提交（POST /api/sample）
// 参数说明  context.request 请求；context.env 环境变量
// 返回参数  JSON：{ ok: true } 成功；{ ok: false, error } 失败
// 使用示例  前端 fetch('/api/sample', { method: 'POST', body: JSON.stringify(form) })
// 备注信息  邮件 reply_to 设为申请人邮箱，收件人在邮箱里直接点「回复」即可联系申请人
//-------------------------------------------------------------------------------------------------------------------
export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.SAMPLE_TO_EMAIL) {
    return json(500, { ok: false, error: '服务器未配置邮件参数' })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { ok: false, error: '请求格式错误' })
  }

  const { data, error } = validate(body)
  // 机器人提交：假装成功，不发邮件
  if (error === 'spam') return json(200, { ok: true })
  if (error) return json(400, { ok: false, error })

  const mail = buildMail(data)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.SAMPLE_FROM_EMAIL || DEFAULT_FROM,
      to: env.SAMPLE_TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean),
      reply_to: data.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text
    })
  })

  if (!res.ok) {
    // 详细原因写入 Cloudflare 日志，不返回给访客
    console.error('Resend 发送失败', res.status, await res.text())
    return json(502, { ok: false, error: '邮件发送失败' })
  }
  return json(200, { ok: true })
}
