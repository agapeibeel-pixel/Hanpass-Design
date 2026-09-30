CREATE TABLE IF NOT EXISTS projects (
  owner TEXT NOT NULL,
  id TEXT NOT NULL,
  document TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner, id)
);
CREATE INDEX IF NOT EXISTS projects_owner_updated ON projects(owner, updated_at DESC);
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS assets_owner ON assets(owner);
