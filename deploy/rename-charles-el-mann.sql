-- Display-only rename: Charlie Meta → Charles El Mann Metta
UPDATE core."user"
SET "firstName" = 'Charles', "lastName" = 'El Mann Metta'
WHERE email = 'jony.ive@apple.dev'
  AND (
    "firstName" IS DISTINCT FROM 'Charles'
    OR "lastName" IS DISTINCT FROM 'El Mann Metta'
  );

DO $rename$
DECLARE
  workspace_schema text;
BEGIN
  FOR workspace_schema IN
    SELECT nspname FROM pg_namespace WHERE nspname LIKE 'workspace_%'
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I."workspaceMember"
         SET "nameFirstName" = %L, "nameLastName" = %L
         WHERE "userEmail" = %L
           AND (
             "nameFirstName" IS DISTINCT FROM %L
             OR "nameLastName" IS DISTINCT FROM %L
           )',
        workspace_schema,
        'Charles',
        'El Mann Metta',
        'jony.ive@apple.dev',
        'Charles',
        'El Mann Metta'
      );
    EXCEPTION
      WHEN undefined_table OR undefined_column THEN
        NULL;
    END;
  END LOOP;
END
$rename$;
