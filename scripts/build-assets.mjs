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
    comment: "#8A8794",
    stack: {
      wp: { c: "#5B43F0", field: "#E6E1FF", tint: "#A99BFF" },
      sh: { c: "#0A7F99", field: "#D5EFF5", tint: "#5CC8E0" },
      lv: { c: "#D9472A", field: "#FFE2D6", tint: "#FF8A6E" },
      cu: { c: "#0F0E14", field: "#E9E5DA", tint: "#F2F2F0" },
    },
  },
  dark: {
    bg: "#0D1117", ink: "#F2F2F0", muted: "#A7A5AE", card: "#1A1922", cardInk: "#F2F2F0",
    comment: "#8A8794",
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

// Width and height of a WebP file, read from its header.
function webpSize(buf) {
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  const b = buf.readUInt32LE(21);
  return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
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

/* ---------------- work cards: the real site scrolls inside the frame ---------------- */

const WORK = [
  ["berlet", "berletplasticsurgery-tall.webp", "Berlet Plastic Surgery", "wp", "WordPress", "Plastic surgeon in New York and New Jersey"],
  ["eblink", "crm-eblink-dashboard.webp", "EBlink CRM", "lv", "Laravel", "Multi-tenant CRM for employee-benefits brokers"],
  ["vitalaxion", "vitalaxion-tall.webp", "VitalAxion", "wp", "WooCommerce", "Bilingual store for a Canadian device maker"],
  ["merlin", "merlin.webp", "Merlin Catering", "sh", "Shopify", "Price-on-application mode for a UK caterer"],
  ["state-billing", "statebillingservices-tall.webp", "State Billing Services", "wp", "WordPress", "Medical billing and credentialing, South Carolina"],
  ["salflows", "salflows-tall.webp", "Salflows", "lv", "Laravel", "Systems, commerce and growth for a London studio"],
];

function workCard(t, [id, file, name, key, stack, line], index) {
  const W = 640, IMG = 400, H = 560;
  const s = t.stack[key];
  const buf = readFileSync(src(file));
  const { w, h } = webpSize(buf);
  const ih = Math.round((h * W) / w); // image height when fitted to the card width
  const travel = Math.min(Math.max(0, ih - IMG), 1100);
  const data = `data:image/webp;base64,${buf.toString("base64")}`;
  let css = "";
  if (travel > 40) {
    const d = 22 + index * 1.7;
    css += `.scroll{animation:scroll ${d}s cubic-bezier(.45,0,.55,1) ${index * 0.9}s infinite}
@keyframes scroll{0%,12%{transform:translateY(0)}50%,62%{transform:translateY(-${travel}px)}100%{transform:translateY(0)}}`;
  } else {
    css += `.scroll{transform-origin:50% 0;animation:drift 18s ease-in-out infinite alternate}
@keyframes drift{from{transform:scale(1)}to{transform:scale(1.06)}}`;
  }
  let body = `<rect width="${W}" height="${H}" fill="${s.field}"/>`;
  body += `<clipPath id="f"><rect width="${W}" height="${IMG}"/></clipPath>`;
  body += `<g clip-path="url(#f)"><image class="scroll" href="${data}" xlink:href="${data}" width="${W}" height="${ih}" preserveAspectRatio="xMidYMin slice"/></g>`;
  body += `<rect y="${IMG}" width="${W}" height="8" fill="${s.c}"/>`;
  body += `<text x="32" y="${IMG + 64}" font-size="34" font-weight="900" letter-spacing="-1" fill="${t.ink}">${esc(name)}</text>`;
  body += `<text x="32" y="${IMG + 100}" font-size="19" fill="${t.ink}"><tspan font-weight="700" fill="${s.c}">${esc(stack)}</tspan>  ${esc(line)}</text>`;
  body += `<text x="32" y="${IMG + 136}" font-size="17" font-weight="700" fill="${t.ink}">See it live  →</text>`;
  return svg(W, H, `${name}, ${stack}: ${line}`, body, css);
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
  WORK.forEach((w, i) => writeFileSync(out(`work-${w[0]}-${mode}.svg`), workCard(t, w, i)));
  BUTTONS.forEach(([id, label, w]) => writeFileSync(out(`btn-${id}-${mode}.svg`), button(t, label, w)));
}
console.log("assets written");
