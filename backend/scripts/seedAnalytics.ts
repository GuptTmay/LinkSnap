import { prisma } from "../src/lib/prisma";

const LINK_ID = "f2c99af1-8303-4856-9e99-830c62f87763";

const devices = ["mobile", "desktop", "tablet", null];

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
  null,
];

const operatingSystems = [
  "Android",
  "Windows",
  "Linux",
  "macOS",
  "iOS",
  null,
];

const referrers = [
  "Google",
  "Instagram",
  "Facebook",
  "Twitter",
  null,
];

const browsers = [
  "Chrome",
  "Firefox",
  "Safari",
  "Edge",
  null,
];

const userAgents = [
  "Mozilla/5.0 Chrome",
  "Mozilla/5.0 Firefox",
  "Mozilla/5.0 Safari",
  "Mozilla/5.0 Edge",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomIp() {
  return `49.${Math.floor(Math.random() * 256)}.${Math.floor(
    Math.random() * 256
  )}.${Math.floor(Math.random() * 256)}`;
}

function randomDate() {
  const now = new Date();

  // Random date within the last 30 days
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);

  const date = new Date(now);

  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);

  return date;
}

async function main() {
  // Create 200 test clicks
  const clicks = Array.from({ length: 200 }, () => ({
    linkId: LINK_ID,

    ipAddress: randomIp(),

    userAgent: randomItem(userAgents),

    referrer: randomItem(referrers),

    os: randomItem(operatingSystems),

    country: randomItem(countries),

    device: randomItem(devices),

    browser: randomItem(browsers),

    createdAt: randomDate(),
  }));

  await prisma.linkClick.createMany({
    data: clicks,
  });

  console.log(`Created ${clicks.length} LinkClick records.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed analytics:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });