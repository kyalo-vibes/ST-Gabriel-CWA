-- AlterTable: add passwordHash to Member, backfilling existing rows with a bcrypt hash of the default password "CWA2026"
ALTER TABLE "Member" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '$2b$10$wlMPN5J1VFj9CiC0OlOOKeo9eLj/fSfOHCnKAvtVTm10LZphMZm5u';
ALTER TABLE "Member" ALTER COLUMN "passwordHash" DROP DEFAULT;
