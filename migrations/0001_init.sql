-- mezo-gov D1 schema
-- Apply: wrangler d1 migrations apply mezo-gov-db --remote
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  wallet_address TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  passport_verified_at INTEGER,
  total_votes_cast INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS gauges (
  id TEXT PRIMARY KEY,
  on_chain_gauge_id INTEGER UNIQUE NOT NULL,
  recipient_wallet TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  category TEXT,
  team_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','retired')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_gauges_status ON gauges(status);

CREATE TABLE IF NOT EXISTS gauge_applications (
  id TEXT PRIMARY KEY,
  gauge_id TEXT,
  submitter_wallet TEXT NOT NULL,
  pitch TEXT NOT NULL,
  requested_amount_musd TEXT,
  milestones TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending',
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (gauge_id) REFERENCES gauges(id) ON DELETE CASCADE,
  FOREIGN KEY (submitter_wallet) REFERENCES profiles(wallet_address)
);

CREATE TABLE IF NOT EXISTS epochs (
  epoch_number INTEGER PRIMARY KEY,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  total_musd_pool TEXT,
  total_votes_cast TEXT,
  settled_at INTEGER,
  settle_tx_hash TEXT
);

CREATE TABLE IF NOT EXISTS epoch_results (
  id TEXT PRIMARY KEY,
  epoch_number INTEGER NOT NULL,
  gauge_id TEXT NOT NULL,
  votes_received TEXT,
  musd_distributed TEXT,
  UNIQUE(epoch_number, gauge_id),
  FOREIGN KEY (epoch_number) REFERENCES epochs(epoch_number) ON DELETE CASCADE,
  FOREIGN KEY (gauge_id) REFERENCES gauges(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  gauge_id TEXT NOT NULL,
  author_wallet TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (gauge_id) REFERENCES gauges(id) ON DELETE CASCADE,
  FOREIGN KEY (author_wallet) REFERENCES profiles(wallet_address)
);
CREATE INDEX IF NOT EXISTS idx_comments_gauge ON comments(gauge_id, created_at DESC);
