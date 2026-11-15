// Builds every SVG in ../assets from the sources in ./src.
// Run: node scripts/build-assets.mjs
// Each picture is made twice, for GitHub's light and dark themes.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => join(here, "src", f);
const out = (f) => join(here, "..", "assets", f);

const font = readFileSync(src("epilogue-latin.woff2")).toString("base64");
const FONT = `@font-face{font-family:E;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900}`;
const MONO = `ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace`;

// Portfolio palette (abdul_cv/css/style.css), with dark-theme partners.
const THEMES = {
  light: {
    bg: "#F2F2F0", ink: "#0F0E14", muted: "#55535C", card: "#0F0E14", cardInk: "#F2F2F0",
    comment: "#8A8794", tone: "#24232E", ok: "#46D38A",
    stack: {
      wp: { c: "#5B43F0", field: "#E6E1FF", tint: "#A99BFF" },
      sh: { c: "#0A7F99", field: "#D5EFF5", tint: "#5CC8E0" },
      lv: { c: "#D9472A", field: "#FFE2D6", tint: "#FF8A6E" },
      cu: { c: "#0F0E14", field: "#E9E5DA", tint: "#F2F2F0" },
    },
  },
  dark: {
    bg: "#0D1117", ink: "#F2F2F0", muted: "#A7A5AE", card: "#1A1922", cardInk: "#F2F2F0",
    comment: "#8A8794", tone: "#2B2A36", ok: "#46D38A",
    stack: {
      wp: { c: "#A99BFF", field: "#211B47", tint: "#A99BFF" },
      sh: { c: "#5CC8E0", field: "#0C2C35", tint: "#5CC8E0" },
      lv: { c: "#FF8A6E", field: "#3A1A12", tint: "#FF8A6E" },
      cu: { c: "#F2F2F0", field: "#22212A", tint: "#F2F2F0" },
    },
  },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (w, h, title, body, css) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${FONT}
text:not([font-family]){font-family:E,system-ui,sans-serif}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;

// Simple word wrap by character count (Epilogue averages ~0.5em per character).
function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max) { lines.push(line); line = word; }
    else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------------- hero: name + the code card that types real work ---------------- */

const SNIPPETS = [
  {
    key: "lv", stack: "Laravel", file: "routes/web.php",
    lines: [
      ["c", "// States Credentialing CRM"],
      ["", "Route::middleware(['auth', 'verified'])"],
      ["", "  ->group(function () {"],
      ["c", "    // NPI Registry lookup pre-fills forms"],
      ["", "    Route::get('npi/{npi}', NpiController::class)"],
      ["s", "      ->middleware('throttle:30,1');"],
      ["c", "    // Abby, the in-app AI assistant"],
      ["", "    Route::post('assistant/ask',"],
      ["s", "      [AssistantController::class, 'ask']);"],
      ["", "  });"],
    ],
  },
  {
    key: "sh", stack: "Shopify", file: "sections/main-product.liquid",
    lines: [
      ["", "{%- liquid"],
      ["c", "  # Merlin Catering, price on application"],
      ["s", "  assign poa = product.metafields.custom.poa"],
      ["", "-%}"],
      ["", "{%- if poa -%}"],
      ["s", "  {%- render 'enquire-button', product: product -%}"],
      ["", "{%- else -%}"],
      ["s", "  {{ product.price | money }}"],
      ["", "{%- endif -%}"],
    ],
  },
  {
    key: "wp", stack: "WordPress", file: "zee-security-sentinel.php",
    lines: [
      ["", "<?php"],
      ["c", "/**"],
      ["c", " * Plugin Name: Zee Security Sentinel"],
      ["c", " * Description: Firewall and login protection."],
      ["c", " */"],
      ["", "add_action('wp_login_failed', function ($user) {"],
      ["", "  $ip   = $_SERVER['REMOTE_ADDR'];"],
      ["s", "  $hits = (int) get_transient(\"zss_$ip\") + 1;"],
      ["s", "  set_transient(\"zss_$ip\", $hits, HOUR_IN_SECONDS);"],
      ["", "});"],
    ],
  },
];

function hero(t) {
  const W = 1280, H = 580;
  const LOOP = 30, SLOT = 10; // seconds: each snippet owns 10s of a 30s loop
  const pct = (s) => ((s / LOOP) * 100).toFixed(3) + "%";
  const card = { x: 668, y: 48, w: 564, h: 484 };
  const CH = 9.6, LH = 31, FS = 16; // monospace advance, line height, size
  const codeX = card.x + 32, codeY = card.y + 112;
  let css = "", body = "";

  // name and statement
  body += `<rect width="${W}" height="${H}" fill="${t.bg}"/>`;
  body += `<g class="rise" style="animation-delay:.05s"><text x="48" y="164" font-size="146" font-weight="900" letter-spacing="-6" fill="${t.ink}">Abdul</text></g>`;
  body += `<g class="rise" style="animation-delay:.15s"><text x="48" y="300" font-size="146" font-weight="900" letter-spacing="-6" fill="${t.ink}">Muqeet</text></g>`;
  body += `<g class="rise" style="animation-delay:.3s"><text x="52" y="354" font-size="25" font-weight="700" fill="${t.ink}">WordPress, Shopify and Laravel developer.</text>`;
  body += `<text x="52" y="388" font-size="21" fill="${t.ink}">Themes, stores and web apps for clients in the</text>`;
  body += `<text x="52" y="416" font-size="21" fill="${t.ink}">UK, the US and beyond, from Gujranwala, Pakistan.</text></g>`;
  const stats = [["6+", "years building"], ["300+", "Shopify stores"], ["44", "client builds"], ["5.0", "Fiverr rating"]];
  stats.forEach(([n, l], i) => {
    const x = 52 + i * 150;
    body += `<g class="rise" style="animation-delay:${0.45 + i * 0.08}s"><text x="${x}" y="490" font-size="44" font-weight="900" letter-spacing="-1.5" fill="${t.ink}">${n}</text>`;
    body += `<text x="${x + 2}" y="518" font-size="16" fill="${t.muted}">${l}</text></g>`;
  });

  // code card
  body += `<rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" fill="${t.card}"/>`;
  body += `<clipPath id="cc"><rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}"/></clipPath><g clip-path="url(#cc)">`;

  SNIPPETS.forEach((sn, k) => {
    const s = t.stack[sn.key];
    const t0 = k * SLOT, tEnd = t0 + SLOT - 0.4;
    // visibility of the whole snippet
    css += `@keyframes v${k}{0%{opacity:${k === 0 ? 1 : 0}}${k ? `${pct(t0 - 0.01)}{opacity:0}${pct(t0)}{opacity:1}` : ""}${pct(tEnd)}{opacity:1}${pct(tEnd + 0.4)}{opacity:0}100%{opacity:0}}`;
    css += `.v${k}{animation:v${k} ${LOOP}s linear infinite both}`;
    body += `<g class="v${k}"${k ? ' opacity="0"' : ""}>`;
    body += `<rect x="${card.x}" y="${card.y}" width="${card.w}" height="10" fill="${s.tint}"/>`;
    body += `<text x="${card.x + 32}" y="${card.y + 58}" font-size="18" font-weight="700" fill="${s.tint}">${sn.stack}</text>`;
    body += `<text x="${card.x + 32 + sn.stack.length * 11 + 14}" y="${card.y + 58}" font-size="16" font-family="${MONO}" fill="${t.comment}">${esc(sn.file)}</text>`;

    let clock = t0 + 0.5;
    sn.lines.forEach(([kind, code], i) => {
      const y = codeY + i * LH;
      const fill = kind === "c" ? t.comment : kind === "s" ? s.tint : t.cardInk;
      body += `<text x="${codeX}" y="${y}" font-size="${FS}" font-family="${MONO}" xml:space="preserve" fill="${fill}">${esc(code)}</text>`;
      const n = Math.max(code.length, 1);
      const dist = Math.ceil(n * CH) + 6;
      const dur = 0.12 + n * 0.012;
      const a = clock, b = clock + dur;
      clock = b + 0.08;
      const id = `t${k}_${i}`;
      // a cover in the card's colour slides right in character steps, with the caret riding its edge
      css += `@keyframes ${id}{0%{transform:translateX(0)}${pct(a)}{transform:translateX(0);animation-timing-function:steps(${n})}${pct(b)}{transform:translateX(${dist}px)}100%{transform:translateX(${dist}px)}}`;
      const last = i === sn.lines.length - 1;
      css += `@keyframes c${id}{0%,${pct(a - 0.01)}{opacity:0}${pct(a)}{opacity:1}${pct(last ? tEnd : b + 0.05)}{opacity:1}${pct(last ? tEnd + 0.01 : b + 0.06)},100%{opacity:0}}`;
      css += `.${id}{animation:${id} ${LOOP}s linear infinite both}.c${id}{animation:c${id} ${LOOP}s linear infinite both}`;
      body += `<g class="${id}" style="transform:translateX(${dist}px)"><rect x="${codeX - 2}" y="${y - 22}" width="${card.w}" height="${LH}" fill="${t.card}"/>`;
      body += `<rect class="c${id}" opacity="0" x="${codeX - 2}" y="${y - 18}" width="9" height="22" fill="${s.tint}"/></g>`;
    });
    body += `</g>`;
  });
  body += `</g>`;

  css += `.rise{opacity:0;animation:rise .9s cubic-bezier(.16,1,.3,1) forwards}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.rise{opacity:1}.v1,.v2{opacity:0}}`;
  return svg(W, H, "Abdul Muqeet, WordPress, Shopify and Laravel developer", body, css);
}

/* ---------------- what I build: one band per stack ---------------- */

const STACKS = [
  ["wp", "WordPress", "Custom themes and plugins, WooCommerce, Elementor, ACF and Gutenberg, built so a client can run the site without me.", "Built: Berlet Plastic Surgery, Zee Medical Billing, State Billing Services, VitalAxion."],
  ["sh", "Shopify", "Online Store 2.0 themes in Liquid, sections a merchant can edit, metafields, Shopify APIs and app integrations.", "300+ stores worked on, including EA-LIFE and Merlin Catering."],
  ["lv", "Laravel", "SaaS platforms, multi-tenant CRMs, client portals and REST APIs in Laravel and MySQL, with Inertia and React.", "Built: EBlink CRM, States Credentialing CRM, BenefitDesk CRM."],
  ["cu", "Custom", "Chrome extensions, Electron apps, AI agents and automation, API and webhook integrations, hacked-site recovery.", "Built: eBay Product Hunter Pro, FlipBridge, Alpha Merge Downloader."],
];

function stacks(t) {
  const W = 1280, BAND = 168, GAP = 12, H = STACKS.length * (BAND + GAP) - GAP;
  let body = "", css = "";
  STACKS.forEach(([key, name, what, built], i) => {
    const s = t.stack[key];
    const y = i * (BAND + GAP);
    body += `<g class="band" style="animation-delay:${0.1 + i * 0.09}s">`;
    body += `<rect y="${y}" width="${W}" height="${BAND}" fill="${s.field}"/>`;
    body += `<text x="40" y="${y + 104}" font-size="64" font-weight="900" letter-spacing="-2.5" fill="${s.c}">${name}</text>`;
    const lines = wrap(what, 64);
    lines.forEach((l, j) => {
      body += `<text x="470" y="${y + 52 + j * 30}" font-size="21" fill="${t.ink}">${esc(l)}</text>`;
    });
    body += `<text x="470" y="${y + 60 + lines.length * 30}" font-size="18" font-weight="700" fill="${t.ink}">${esc(built)}</text>`;
    body += `</g>`;
  });
  css += `.band{opacity:0;animation:slidein .9s cubic-bezier(.16,1,.3,1) forwards}
@keyframes slidein{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.band{opacity:1}}`;
  return svg(W, H, "What I build: WordPress, Shopify, Laravel and custom software", body, css);
}

/* ---------------- infographics: developer and security panels ---------------- */

const PROMPT = "abdul@gujranwala:~$";
const tint = (t, key) => (key === "ok" ? t.ok : t.stack[key].tint);
const POP = `@keyframes show{to{opacity:1}}
.blink{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{fill-opacity:0}}
@media (prefers-reduced-motion:reduce){.show{opacity:1!important}}`;

// Dark panel with a shell prompt and a blinking caret, shared by the infographics.
// The caret is a character in the same text run, so it follows the command whatever monospace font the viewer has.
function panel(t, W, H, command) {
  return `<rect width="${W}" height="${H}" fill="${t.card}"/>` +
    `<text x="40" y="58" font-size="17" font-family="${MONO}" xml:space="preserve" fill="${t.comment}">${PROMPT} <tspan fill="${t.cardInk}">${esc(command)}</tspan> <tspan class="blink" fill="${t.ok}">█</tspan></text>`;
}
const show = (delay) => `class="show" opacity="0" style="animation:show .3s ease-out ${delay.toFixed(2)}s forwards"`;

const SKILLS = [
  ["WordPress", 9, "Expert", "wp", "themes · plugins · WooCommerce · Elementor · ACF"],
  ["Shopify", 7, "Advanced", "sh", "Liquid · Online Store 2.0 · metafields · APIs"],
  ["Laravel", 7, "Advanced", "lv", "CRMs · multi-tenant SaaS · Inertia + React · REST"],
  ["Frontend", 9, "Expert", "wp", "HTML · CSS · JavaScript · Tailwind · GSAP"],
  ["Speed", 9, "Expert", "ok", "Core Web Vitals · LiteSpeed · WP Rocket · Cloudflare"],
  ["Security and upkeep", 9, "Expert", "ok", "hardening · malware cleanup · backups · migrations"],
  ["Technical SEO", 7, "Advanced", "sh", "schema · sitemaps · Rank Math · Search Console"],
  ["AI and automation", 7, "Advanced", "lv", "Claude · MCP servers · OpenAI · AI agents"],
];

function skills(t) {
  const W = 1280, ROW = 96, H = 120 + 4 * ROW + 8;
  let body = panel(t, W, H, "skills --depth");
  SKILLS.forEach(([name, level, word, key, tools], i) => {
    const x0 = i < 4 ? 40 : 680, y = 120 + (i % 4) * ROW, c = tint(t, key);
    body += `<text x="${x0}" y="${y + 22}" font-size="22" font-weight="700" fill="${t.cardInk}">${esc(name)}</text>`;
    body += `<text x="${x0 + 560}" y="${y + 22}" text-anchor="end" font-size="15" font-family="${MONO}" fill="${c}">${word}</text>`;
    for (let b = 0; b < 10; b++) {
      const x = x0 + b * 56;
      body += `<rect x="${x}" y="${y + 36}" width="51" height="14" fill="${t.tone}"/>`;
      if (b < level) body += `<rect ${show(0.3 + i * 0.12 + b * 0.05)} x="${x}" y="${y + 36}" width="51" height="14" fill="${c}"/>`;
    }
    body += `<text x="${x0}" y="${y + 76}" font-size="14" font-family="${MONO}" fill="${t.comment}">${esc(tools)}</text>`;
  });
  return svg(W, H, "Skill depth: WordPress, frontend, speed, security and upkeep at expert level; Shopify, Laravel, technical SEO and AI automation at advanced level", body, POP);
}

const NODES = [
  ["Visitor", ["browser or bot", "HTTPS only"]],
  ["Cloudflare", ["WAF and CDN", "SSL + HSTS", "bot fight mode"]],
  ["Firewall", ["Security Sentinel", "login rate limits", "IP blocklist"]],
  ["App", ["WordPress, Laravel", "nonces and roles", "sanitised input"]],
  ["Backups", ["daily, offsite", "tested restores"]],
];
const LOG = [
  ["12:04:31", "ALLOW", "GET ", "/collections/fridges", "", "200  48 ms"],
  ["12:04:32", "BLOCK", "POST", "/wp-login.php", "203.0.113.24", "brute force, 5 tries in 1 h"],
  ["12:04:33", "ALLOW", "GET ", "/api/npi/1234567890", "", "200  61 ms"],
  ["12:04:35", "BLOCK", "GET ", "/.env", "198.51.100.7", "sensitive file probe"],
];

function security(t) {
  const W = 1280, H = 540, LANE = 312, BAD = t.stack.lv.tint;
  let body = panel(t, W, H, "trace --request https://client-site.com");
  const cx = (i) => 140 + i * 250;
  body += `<rect x="140" y="${LANE - 2}" width="1000" height="4" fill="${t.tone}"/>`;
  NODES.forEach(([title, lines], i) => {
    const x = cx(i) - 100;
    body += `<rect x="${x}" y="110" width="200" height="164" fill="${t.tone}"/>`;
    body += `<rect x="${x}" y="110" width="200" height="6" fill="${i ? t.ok : t.comment}"/>`;
    body += `<text x="${x + 20}" y="156" font-size="21" font-weight="700" fill="${t.cardInk}">${title}</text>`;
    lines.forEach((l, j) => (body += `<text x="${x + 20}" y="${190 + j * 24}" font-size="14" font-family="${MONO}" fill="${t.comment}">${esc(l)}</text>`));
    body += `<rect x="${cx(i) - 2}" y="274" width="4" height="${LANE - 274}" fill="${t.tone}"/>`;
  });
  // good requests travel the whole lane; the attack stops at the firewall
  [0, 2, 4].forEach((d) => (body += `<rect class="pkt" style="animation-delay:${d}s" x="133" y="${LANE - 7}" width="14" height="14" fill="${t.ok}"/>`));
  body += `<rect class="atk" x="133" y="${LANE - 7}" width="14" height="14" fill="${BAD}"/>`;
  body += `<text class="hit" x="${cx(2) + 14}" y="${LANE - 14}" font-size="14" font-weight="700" font-family="${MONO}" fill="${BAD}">403 blocked</text>`;
  LOG.forEach(([time, verdict, method, path, ip, note], i) => {
    const y = 384 + i * 36;
    const c = verdict === "BLOCK" ? BAD : t.ok;
    body += `<g ${show(0.4 + i * 0.35)}><text x="40" y="${y}" font-size="16" font-family="${MONO}" xml:space="preserve" fill="${t.comment}">${time}  <tspan fill="${c}" font-weight="700">${verdict}</tspan>  <tspan fill="${t.cardInk}">${method}  ${esc(path.padEnd(22))}</tspan>${ip.padEnd(14)}  ${esc(note)}</text></g>`;
  });
  const css = `${POP}
.pkt{opacity:0;animation:pkt 6s linear infinite}
@keyframes pkt{0%{opacity:0;transform:translateX(0)}5%{opacity:1}92%{opacity:1}100%{opacity:0;transform:translateX(1000px)}}
.atk{opacity:0;animation:atk 6s linear 1s infinite}
@keyframes atk{0%{opacity:1;transform:translateX(0)}40%{opacity:1;transform:translateX(${cx(2) - 140 - 16}px)}44%{opacity:0}48%{opacity:1}52%{opacity:0;transform:translateX(${cx(2) - 140 - 16}px)}100%{opacity:0;transform:translateX(${cx(2) - 140 - 16}px)}}
.hit{opacity:0;animation:hit 6s linear 1s infinite}
@keyframes hit{0%,39%{opacity:0}40%,75%{opacity:1}80%,100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.pkt,.atk{opacity:0}.hit{opacity:1}}`;
  return svg(W, H, "Website security: requests pass Cloudflare WAF, a login-rate-limiting firewall and a hardened WordPress or Laravel app with offsite backups; attacks such as brute-force logins are blocked", body, css);
}

const CHECKS = [
  "SSL certificate and HSTS",
  "Security headers (CSP, X-Frame-Options)",
  "Admin login rate limits and 2FA",
  "Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1",
  "Schema, sitemap.xml and robots.txt",
  "Daily offsite backups, restore tested",
  "Uptime monitoring and error logging",
];

function checklist(t) {
  const W = 1280, H = 500;
  let body = panel(t, W, H, "launch-check --before-handover");
  CHECKS.forEach((label, i) => {
    const y = 122 + i * 40;
    // leader dots sit in a fixed column, so they never depend on how wide the label renders
    body += `<g ${show(0.4 + i * 0.3)}><text x="40" y="${y}" font-size="17" font-family="${MONO}" xml:space="preserve" fill="${t.ok}">[ ok ]  <tspan fill="${t.cardInk}">${esc(label)}</tspan></text>`;
    body += `<text x="720" y="${y}" font-size="17" font-family="${MONO}" fill="${t.comment}" fill-opacity=".45">${".".repeat(46)}</text>`;
    body += `<text x="1240" y="${y}" text-anchor="end" font-size="17" font-family="${MONO}" fill="${t.ok}">pass</text></g>`;
  });
  body += `<g ${show(0.6 + CHECKS.length * 0.3)}><text x="40" y="452" font-size="54" font-weight="900" letter-spacing="-2" fill="${t.ok}">Ready to ship.</text></g>`;
  return svg(W, H, "Launch checklist before every handover: SSL and HSTS, security headers, login rate limits and 2FA, Core Web Vitals, schema and sitemap, offsite backups, uptime monitoring", body, POP);
}

const CAREER = [
  ["2017", "Aptech", "Web development training", "cu"],
  ["2018", "Softarena Solution", ".NET Framework MVC", "cu"],
  ["2019", "Freelance, Fiverr", "Python, Django, PHP", "sh"],
  ["2021", "National IT Solution", "WordPress developer", "wp"],
  ["2022", "Zi Softech", "Web developer, team lead", "wp"],
  ["2024", "Zee IT Service", "WordPress developer", "wp"],
  ["2025", "EcomFlows Limited", "Senior WordPress, Shopify", "sh"],
  ["Now", "ThemeHive", "Shopify and Laravel", "lv"],
];
// uneven spacing leaves room for the long labels near the right edge
const CAREER_X = [80, 230, 390, 550, 710, 850, 1030, 1200];

function timeline(t) {
  const W = 1280, H = 360, LINE = 178;
  let body = `<rect width="${W}" height="${H}" fill="${t.bg}"/>`;
  body += `<rect class="draw" x="40" y="${LINE}" width="1200" height="6" fill="${t.ink}"/>`;
  CAREER.forEach(([year, org, role, key], i) => {
    const x = CAREER_X[i], up = i % 2 === 0, end = i === CAREER.length - 1;
    const ax = end ? x + 9 : x - 9, anchor = end ? ` text-anchor="end"` : "";
    const y = up ? 70 : 250, d = 0.5 + i * 0.14;
    body += `<rect ${show(d)} x="${x - 9}" y="${LINE - 6}" width="18" height="18" fill="${t.stack[key].c}"/>`;
    body += `<g ${show(d + 0.08)}><text x="${ax}" y="${y + 34}"${anchor} font-size="34" font-weight="900" letter-spacing="-1.2" fill="${t.ink}">${year}</text>`;
    body += `<text x="${ax}" y="${y + 62}"${anchor} font-size="17" font-weight="700" fill="${t.ink}">${esc(org)}</text>`;
    body += `<text x="${ax}" y="${y + 86}"${anchor} font-size="15" fill="${t.muted}">${esc(role)}</text></g>`;
  });
  const css = `${POP}
.draw{transform-box:fill-box;transform-origin:0 50%;animation:draw 1.2s cubic-bezier(.16,1,.3,1) forwards;transform:scaleX(0)}
@keyframes draw{to{transform:scaleX(1)}}
@media (prefers-reduced-motion:reduce){.draw{transform:none}}`;
  return svg(W, H, "Career timeline 2017 to now: Aptech, Softarena Solution, freelance on Fiverr, National IT Solution, Zi Softech team lead, Zee IT Service, EcomFlows Limited senior developer, ThemeHive Technologies", body, css);
}

/* ---------------- buttons and closing ---------------- */

function button(t, label, w) {
  const H = 60;
  const body = `<rect width="${w}" height="${H}" fill="${t.ink}"/><text x="${w / 2}" y="38" text-anchor="middle" font-size="20" font-weight="700" fill="${t.bg}">${esc(label)}</text>`;
  return svg(w, H, label, body, "");
}

function closing(t) {
  const W = 1280, H = 330;
  const s = t.stack.wp;
  let body = `<rect width="${W}" height="${H}" fill="${s.field}"/>`;
  body += `<text x="40" y="96" font-size="34" font-weight="900" letter-spacing="-1" fill="${t.ink}">Available now for remote work, senior roles and contracts.</text>`;
  body += `<text x="40" y="136" font-size="21" fill="${t.ink}">Write to muqeet.pugc@gmail.com with what you are building and when it needs to ship.</text>`;
  body += `<g class="big"><text x="30" y="300" font-size="176" font-weight="900" letter-spacing="-8" fill="${s.c}">Abdul Muqeet</text></g>`;
  const css = `.big{opacity:0;animation:up 1.1s cubic-bezier(.16,1,.3,1) .2s forwards}
@keyframes up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.big{opacity:1}}`;
  return svg(W, H, "Available now for remote work, senior roles and contracts. muqeet.pugc@gmail.com", body, css);
}

/* ---------------- write ---------------- */

const BUTTONS = [["portfolio", "See the portfolio", 236], ["email", "Email me", 160], ["fiverr", "Hire me on Fiverr", 236]];

for (const [mode, t] of Object.entries(THEMES)) {
  writeFileSync(out(`hero-${mode}.svg`), hero(t));
  writeFileSync(out(`stacks-${mode}.svg`), stacks(t));
  writeFileSync(out(`closing-${mode}.svg`), closing(t));
  for (const [name, fn] of Object.entries({ skills, security, checklist, timeline })) writeFileSync(out(`${name}-${mode}.svg`), fn(t));
  BUTTONS.forEach(([id, label, w]) => writeFileSync(out(`btn-${id}-${mode}.svg`), button(t, label, w)));
}
console.log("assets written");
