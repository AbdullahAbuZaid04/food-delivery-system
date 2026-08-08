-- Enforce exactly one default address per user at the database level.
-- A partial unique index: only rows with isDefault = true are indexed, so
-- PostgreSQL itself rejects any second default for the same user (mirrors the
-- ensureSingleDefault() logic in auth.repository.js as a hard guarantee).

CREATE UNIQUE INDEX "Address_one_default_per_user"
  ON "Address" ("userId")
  WHERE "isDefault" = true;
