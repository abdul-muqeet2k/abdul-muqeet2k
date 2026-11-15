// Fetches public GitHub activity into scripts/stats.json for the stats card.
// Needs GITHUB_TOKEN (the Action provides one; locally: GITHUB_TOKEN=$(gh auth token)).
// Run: node scripts/fetch-stats.mjs

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LOGIN = "abdul-muqeet2k";
const query = `query($login:String!){user(login:$login){
  followers{totalCount}
  repositories(ownerAffiliations:OWNER,privacy:PUBLIC,isFork:false,first:100){totalCount nodes{stargazerCount}}
  contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}
}}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
});
const { data, errors } = await res.json();
if (errors || !data) throw new Error(JSON.stringify(errors ?? res.status));

const u = data.user;
const cal = u.contributionsCollection.contributionCalendar;
const days = cal.weeks.flatMap((w) => w.contributionDays);

// Current streak counts back from today, or from yesterday if today has nothing yet.
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) current++;
  else if (i === days.length - 1) continue;
  else break;
}
let longest = 0, run = 0;
for (const d of days) {
  run = d.contributionCount > 0 ? run + 1 : 0;
  longest = Math.max(longest, run);
}

const stats = {
  updated: days[days.length - 1].date,
  contributions: cal.totalContributions,
  currentStreak: current,
  longestStreak: longest,
  repos: u.repositories.totalCount,
  stars: u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0),
  followers: u.followers.totalCount,
  weeks: cal.weeks.map((w) => w.contributionDays.reduce((s, d) => s + d.contributionCount, 0)),
};
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "stats.json"), JSON.stringify(stats, null, 2) + "\n");
console.log(stats.updated, stats.contributions, "contributions");
