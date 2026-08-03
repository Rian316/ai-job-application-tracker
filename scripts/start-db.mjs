import EmbeddedPostgres from "embedded-postgres";
import { config } from "dotenv";

config();

const databaseDir = process.env.DB_DATA_DIR ?? "./.postgres-data";
const port = Number(process.env.DB_PORT ?? 5432);
const user = process.env.DB_USER ?? "postgres";
const password = process.env.DB_PASSWORD ?? "postgres";
const database = process.env.DB_NAME ?? "jobtracker";
const persistent = process.env.DB_PERSISTENT !== "false";

const pg = new EmbeddedPostgres({
  databaseDir,
  port,
  user,
  password,
  persistent,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: (msg) => console.log(`[pg] ${msg}`),
  onError: (msg) => console.error(`[pg] ${msg}`),
});

try {
  await pg.initialise();
} catch (err) {
  console.log("Cluster already initialised, skipping initdb.");
}

await pg.start();
console.log(`PostgreSQL started on port ${port}`);

try {
  await pg.createDatabase(database);
  console.log(`Database "${database}" ready.`);
} catch (err) {
  console.log(`Database "${database}" already exists.`);
}

const keepAlive = setInterval(() => {}, 1 << 30);

const shutdown = async () => {
  console.log("Stopping PostgreSQL...");
  clearInterval(keepAlive);
  await pg.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
