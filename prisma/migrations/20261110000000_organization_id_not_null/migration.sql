-- organization_id wajib di semua tabel bertenant.
--
-- Untuk instalasi baru (database kosong) dan database yang semua barisnya sudah
-- punya organization_id, migrasi ini aman dijalankan langsung.
--
-- Untuk database yang masih berisi baris dengan organization_id NULL, migrasi
-- BERHENTI dengan pesan jelas SEBELUM mengubah skema, agar tidak ada tabel yang
-- termigrasi setengah jalan. Backfill dulu organization_id ke organisasi yang
-- tepat, lalu jalankan ulang migrasi ini.

DO $$
DECLARE
  tbl text;
  orphans bigint;
BEGIN
  FOR tbl IN
    SELECT c.table_name::text
      FROM information_schema.columns c
      JOIN information_schema.tables t USING (table_schema, table_name)
     WHERE c.table_schema = 'public'
       AND t.table_type = 'BASE TABLE'
       AND c.column_name = 'organization_id'
       AND c.is_nullable = 'YES'
  LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE organization_id IS NULL', tbl) INTO orphans;
    IF orphans > 0 THEN
      RAISE EXCEPTION
        'Table %.organization_id has % row(s) with NULL. Backfill before running this migration.',
        tbl, orphans;
    END IF;
  END LOOP;
END $$;

ALTER TABLE "app_settings"              ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "audit_logs"                ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "certificates"              ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "cms_posts"                 ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "committee_applications"    ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "committee_divisions"       ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "committee_meetings"        ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "divisions"                 ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "event_registrations"       ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "events"                    ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "feedbacks"                 ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "financial_transactions"    ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "letter_counters"           ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "member_dues"               ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "members"                   ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "notification_consents"     ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "notification_preferences"  ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "notifications"             ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "official_letters"          ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "org_officers"              ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "password_reset_tokens"     ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "resources"                 ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "users"                     ALTER COLUMN "organization_id" SET NOT NULL;
