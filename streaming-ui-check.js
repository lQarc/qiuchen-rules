/**
 * 流媒体检测 · QiuChenNetProxy 原生版 v1.0.0
 * 功能参考 KOP-XIAO/QuantumultX Scripts/streaming-ui-check.js
 * https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js
 * 原作致谢 Hyseen / AtlantisGawrGura / CoiaPrant / Netflixxp。
 *
 * 导入脚本管理器后启用定时钩子 onSchedule，周期建议 3600 秒。
 * 无需开启 MITM，也不要绑定请求/响应钩子或全域 hosts。
 * 结果在脚本日志查看，并存入 streaming-check:last-result。
 * 使用当前分流规则出站；各服务可能走不同节点，不能指定单个节点。
 * 本机 SDK 没有 Quantumult X 的节点交互弹窗/指定 policy 接口。
 * 本脚本检查网页、地区信号；“可访问”不保证付费内容可播放。
 * 验证码、限流、旧接口失效均保留为“无法判定”，不判成未解锁。
 */
import { fetch } from 'netproxy:http';
import { utf8Decode } from 'netproxy:encoding';
import { set } from 'netproxy:store';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
let running = false;
async function request(url, options = {}) {
  const r = await fetch(url, {
    ...options, timeout: 10000,
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', ...(options.headers || {}) }
  });
  return { status: r.status, headers: r.headers, text: utf8Decode(r.body) };
}
function verdict(status, detail, region = '') { return { status, detail, region }; }
function unknown(r) {
  return verdict('无法判定', `HTTP ${r.status}；接口变更、登录、限流或反爬均可能影响结果`);
}
function blocked(r) {
  return /cf-chl-|Just a moment|captcha|verify you are human|challenge-platform/i.test(r.text);
}
async function netflix() {
  const r = await request('https://www.netflix.com/title/81280792');
  if (blocked(r)) return unknown(r);
  if (r.status === 404) return verdict('无法判定', '测试片目不存在或当前地区不可用；不能据此断定仅自制剧');
  if (/proxy or unblocker|you seem to be using an unblocker|not available in your (country|region)/i.test(r.text))
    return verdict('受限制', '页面明确返回代理或地区限制');
  if (r.status !== 200) return unknown(r);
  let origin = '';
  for (const key of Object.keys(r.headers)) if (key.toLowerCase() === 'x-originating-url') origin = r.headers[key];
  const m = origin.match(/netflix\.com\/([a-z]{2})(?:-|\/)/i);
  if (!/netflix/i.test(r.text)) return unknown(r);
  return verdict('网页可访问', '测试片目页可访问；未验证登录及播放权限', m ? m[1].toUpperCase() : '');
}
async function youtube() {
  const r = await request('https://www.youtube.com/premium');
  if (blocked(r) || r.status !== 200) return unknown(r);
  if (/Premium is not available in your country/i.test(r.text)) return verdict('受限制', 'Premium 返回地区不可用');
  const m = r.text.match(/"(?:GL|countryCode)"\s*:\s*"([A-Z]{2})"/);
  if (!/YouTube Premium|YouTubePremium/i.test(r.text)) return unknown(r);
  return verdict('网页可访问', 'Premium 页面可访问；订阅及播放权限需实测', m ? m[1] : '');
}
async function dazn() {
  const r = await request('https://startup.core.indazn.com/misl/v5/Startup', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ LandingPageKey: 'generic', Platform: 'web', PlatformAttributes: {}, Manufacturer: '', PromoCode: '', Version: '2' })
  });
  if (r.status !== 200 || blocked(r)) return unknown(r);
  const m = r.text.match(/"GeolocatedCountry"\s*:\s*"([A-Za-z]{2})"/);
  return m ? verdict('地区已识别', '地区信号不等于已取得播放权限', m[1].toUpperCase()) : unknown(r);
}
async function page(url, brand) {
  const r = await request(url);
  if (blocked(r)) return unknown(r);
  if (/not available in your (country|region|location)|unavailable in your (country|region)|not available in this region/i.test(r.text))
    return verdict('受限制', '页面明确返回地区限制');
  if (r.status === 200 && brand.test(r.text)) return verdict('网页可访问', '主页可访问；无法凭主页确定内容解锁');
  return unknown(r);
}
async function discovery() {
  const r = await request('https://us1-prod-direct.discoveryplus.com/token?deviceId=d1a4a5d25212400d1e6985984604d740&realm=go&shortlived=true');
  if (r.status !== 200) return unknown(r);
  const data = JSON.parse(r.text);
  const token = data && data.data && data.data.attributes && data.data.attributes.token;
  if (typeof token !== 'string' || !token || /[\r\n;]/.test(token)) return unknown(r);
  const user = await request('https://us1-prod-direct.discoveryplus.com/users/me', { headers: { Cookie: `st=${token}` } });
  if (user.status !== 200) return unknown(user);
  const info = JSON.parse(user.text);
  const region = info && info.data && info.data.attributes && info.data.attributes.currentLocationTerritory;
  return typeof region === 'string' && /^[a-z]{2}$/i.test(region)
    ? verdict('地区已识别', 'Discovery+ 返回地区；未验证播放', region.toUpperCase()) : unknown(user);
}
async function chatgpt() {
  const r = await request('https://chatgpt.com/');
  if (/unsupported_country|country.*not supported|not available in your country/i.test(r.text)) return verdict('受限制', '返回地区不支持');
  if (blocked(r) || r.status !== 200) return unknown(r);
  if (!/ChatGPT/i.test(r.text)) return unknown(r);
  return verdict('网页可访问', '未验证登录和对话；地区白名单不能证明账号可用');
}
export async function onSchedule() {
  if (running) { console.log('[流媒体检测] 上次检测尚未结束'); return; }
  running = true;
  try {
    const checks = [
      ['YouTube Premium', youtube], ['Netflix', netflix],
      ['Disney+', () => page('https://www.disneyplus.com/', /Disney/i)],
      ['DAZN', dazn], ['Paramount+', () => page('https://www.paramountplus.com/', /Paramount/i)],
      ['Discovery+', discovery], ['ChatGPT', chatgpt]
    ];
    console.log('[流媒体检测] 开始，使用当前分流规则；不同服务可能走不同节点');
    // 每批两个，降低引擎和服务的并发压力。每次网络请求均有 10 秒超时。
    const results = [];
    for (let i = 0; i < checks.length; i += 2) {
      const batch = await Promise.all(checks.slice(i, i + 2).map(async ([service, check]) => {
        try { return { service, ...await check() }; }
        catch (e) { return { service, ...verdict('检测失败', /timeout|timed out/i.test(String(e)) ? '请求超时' : '网络错误或接口响应无法解析') }; }
      }));
      for (const item of batch) {
        results.push(item);
        console.log(`${item.service}: ${item.status}${item.region ? ' [' + item.region + ']' : ''} · ${item.detail}`);
      }
    }
    set('streaming-check:last-result', JSON.stringify({ version: 1, checkedAt: new Date().toISOString(), routing: 'current-rules', results }));
    console.log('[流媒体检测] 完成；结果已保存至 streaming-check:last-result');
  } finally { running = false; }
}
