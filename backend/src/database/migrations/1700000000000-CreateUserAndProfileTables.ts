import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndProfileTables1700000000000 implements MigrationInterface {
  name = 'CreateUserAndProfileTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums if not exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin', 'manager');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'pending');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."activity_logs_activitytype_enum" AS ENUM('LOGIN', 'PROFILE_UPDATE', 'AVATAR_UPLOAD', 'TRANSACTION', 'EXPORT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Create Users Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(150) NOT NULL,
        "name" character varying(100) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      );
    `);

    // 3. Create Profiles Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "title" character varying(100),
        "bio" text,
        "phoneNumber" character varying(20),
        "avatarUrl" character varying(255),
        "department" character varying(100),
        "location" character varying(100),
        "socialLinks" jsonb DEFAULT '{}',
        "preferences" jsonb DEFAULT '{"theme": "light", "emailNotifications": true}',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "REL_profiles_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_profiles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    // 4. Create Activity Logs Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "activityType" "public"."activity_logs_activitytype_enum" NOT NULL DEFAULT 'LOGIN',
        "description" character varying(255) NOT NULL,
        "metadata" jsonb,
        "value" numeric(10,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activity_logs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    // 5. Create Indexes for High Performance & Zero-Downtime Migration
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_profiles_userId" ON "profiles" ("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activity_logs_userId" ON "activity_logs" ("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activity_logs_activityType" ON "activity_logs" ("activityType");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activity_logs_createdAt" ON "activity_logs" ("createdAt" DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_logs_createdAt";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_logs_activityType";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_logs_userId";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_profiles_userId";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profiles";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."activity_logs_activitytype_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum";`);
  }
}
