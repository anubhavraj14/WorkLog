import pkg from "@next/env";
import https from "node:https";

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd(), true);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

function request(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(`${url}${path}`, { headers: { apikey: key, authorization: `Bearer ${key}`, ...headers } }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

console.log(`Supabase URL: ${url}`);

const tables = ["profiles", "projects", "work_entries", "evidence", "blockers", "meetings", "learning"];
let allOk = true;
for (const table of tables) {
  const { status, body } = await request(`/rest/v1/${table}?select=id&limit=1`);
  if (status >= 200 && status < 300) {
    console.log(`Table '${table}' exists (${status}).`);
  } else {
    allOk = false;
    console.warn(`Table '${table}' check failed (${status}): ${body.slice(0, 200)}`);
  }
}

const { status: bucketStatus, body: bucketBody } = await request("/storage/v1/bucket/evidence");
if (bucketStatus === 200) {
  console.log("Storage bucket 'evidence' exists.");
} else {
  console.warn(`Could not verify storage bucket 'evidence' via anon key (${bucketStatus}). Check Supabase Dashboard → Storage.`);
}

if (allOk) {
  console.log("Supabase setup looks complete.");
} else {
  console.log("Run supabase/schema.sql in the Supabase SQL Editor to create missing tables/buckets.");
  process.exit(1);
}
