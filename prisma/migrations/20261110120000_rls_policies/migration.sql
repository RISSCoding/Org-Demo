-- RLS policies untuk semua tabel bertenant (23 tabel).
--
-- Status setelah migrasi ini:
--   * ENABLE ROW LEVEL SECURITY: aktif di 23 tabel.
--   * CREATE POLICY tenant_isolation: aktif (permissive untuk operasi dengan
--     app.current_org yang cocok; deny untuk operasi lain, bila RLS ditegakkan).
--   * FORCE ROW LEVEL SECURITY: SENGAJA TIDAK diaktifkan.
--
-- Mengapa FORCE ditunda:
--   Tanpa FORCE, owner tabel (role yang dipakai Prisma saat connect: postgres)
--   melewati RLS. Artinya, RLS saat ini tidak menegakkan apa pun terhadap
--   aplikasi. Menyalakan FORCE sekarang akan membuat setiap query ke tabel
--   bertenant mengembalikan 0 baris, karena kode aplikasi belum konsisten
--   membungkus query dalam transaksi dengan set_config('app.current_org', ...).
--
--   Skenario lengkap untuk enforcement ada di docs/adr/0002-rls-rencana.md.
--   Ringkasnya: #4c-2 akan (a) membungkus setiap operasi getTenantPrisma dalam
--   $transaction + set_config, (b) memberi jalur khusus untuk 4 tabel yang
--   butuh akses lintas tenant (users, password_reset_tokens, certificates,
--   feedbacks), (c) membungkus batch ops cron, lalu (d) menyalakan FORCE.
--
-- Untuk sekarang: policy terpasang, relrowsecurity=true, siap untuk dipakai.

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'app_settings', 'audit_logs', 'certificates', 'cms_posts',
    'committee_applications', 'committee_divisions', 'committee_meetings',
    'divisions', 'event_registrations', 'events', 'feedbacks',
    'financial_transactions', 'letter_counters', 'member_dues', 'members',
    'notification_consents', 'notification_preferences', 'notifications',
    'official_letters', 'org_officers', 'password_reset_tokens', 'resources', 'users'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (organization_id = current_setting(''app.current_org'', true)) WITH CHECK (organization_id = current_setting(''app.current_org'', true))',
      tbl
    );
  END LOOP;
END $$;
