-- organization_id diberi default supaya Prisma Client tidak mewajibkan
-- setiap create menyertakannya di tipe. Extension getTenantPrisma selalu
-- menyuntikkan nilai yang benar; default hanya jaring pengaman. Selama
-- app.current_org belum pernah diset (sebelum PR RLS #4c), raw prisma.create
-- yang lupa organizationId akan gagal karena NOT NULL menolak NULL — galat
-- jelas, bukan data sampah.
--
-- PR RLS (#4c) akan mengisi app.current_org lewat set_config pada setiap
-- transaksi, sehingga default ini ikut berfungsi sebagai filter otomatis
-- di level database.

ALTER TABLE "app_settings"              ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "audit_logs"                ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "certificates"              ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "cms_posts"                 ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "committee_applications"    ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "committee_divisions"       ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "committee_meetings"        ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "divisions"                 ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "event_registrations"       ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "events"                    ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "feedbacks"                 ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "financial_transactions"    ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "letter_counters"           ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "member_dues"               ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "members"                   ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "notification_consents"     ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "notification_preferences"  ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "notifications"             ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "official_letters"          ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "org_officers"              ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "password_reset_tokens"     ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "resources"                 ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
ALTER TABLE "users"                     ALTER COLUMN "organization_id" SET DEFAULT current_setting('app.current_org', true);
