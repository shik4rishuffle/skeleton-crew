import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_block_ctas_style" AS ENUM('ghost', 'primary');
  CREATE TYPE "public"."enum_pages_blocks_hero_block_style" AS ENUM('full', 'short');
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "pages_blocks_hero_block_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"style" "enum_pages_blocks_hero_block_ctas_style" DEFAULT 'ghost'
  );
  
  CREATE TABLE "pages_blocks_hero_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"subheadline" varchar,
  	"style" "enum_pages_blocks_hero_block_style" DEFAULT 'short',
  	"toggle_button_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_cards_block_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_service_cards_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_portfolio_teaser_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_heading" varchar NOT NULL,
  	"max_items" numeric DEFAULT 3,
  	"link_text" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_portfolio_grid_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_heading" varchar,
  	"show_all" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_section_block_tiers_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pricing_section_block_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tier_name" varchar NOT NULL,
  	"audience" varchar NOT NULL,
  	"price" varchar NOT NULL,
  	"is_featured" boolean DEFAULT false,
  	"cta_text" varchar DEFAULT 'Get started',
  	"cta_url" varchar DEFAULT '/contact/'
  );
  
  CREATE TABLE "pages_blocks_pricing_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_heading" varchar NOT NULL,
  	"intro_text" varchar,
  	"link_text" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_strip_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"button_text" varchar NOT NULL,
  	"button_url" varchar DEFAULT '/contact/' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"contact_email" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "portfolio_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_name" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"screenshot_id" integer,
  	"live_url" varchar,
  	"brand_colour" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"pages_id" integer,
  	"portfolio_entries_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_nav_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_tagline" varchar,
  	"copyright_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_hero_block_ctas" ADD CONSTRAINT "pages_blocks_hero_block_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_block" ADD CONSTRAINT "pages_blocks_hero_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_cards_block_cards" ADD CONSTRAINT "pages_blocks_service_cards_block_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_cards_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_cards_block" ADD CONSTRAINT "pages_blocks_service_cards_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolio_teaser_block" ADD CONSTRAINT "pages_blocks_portfolio_teaser_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolio_grid_block" ADD CONSTRAINT "pages_blocks_portfolio_grid_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_section_block_tiers_features" ADD CONSTRAINT "pages_blocks_pricing_section_block_tiers_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_section_block_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_section_block_tiers" ADD CONSTRAINT "pages_blocks_pricing_section_block_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_section_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_section_block" ADD CONSTRAINT "pages_blocks_pricing_section_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_strip_block" ADD CONSTRAINT "pages_blocks_cta_strip_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_section_block" ADD CONSTRAINT "pages_blocks_contact_section_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_entries" ADD CONSTRAINT "portfolio_entries_screenshot_id_media_id_fk" FOREIGN KEY ("screenshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_portfolio_entries_fk" FOREIGN KEY ("portfolio_entries_id") REFERENCES "public"."portfolio_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_nav_links" ADD CONSTRAINT "site_settings_nav_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "pages_blocks_hero_block_ctas_order_idx" ON "pages_blocks_hero_block_ctas" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_block_ctas_parent_id_idx" ON "pages_blocks_hero_block_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_block_order_idx" ON "pages_blocks_hero_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_block_parent_id_idx" ON "pages_blocks_hero_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_block_path_idx" ON "pages_blocks_hero_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_service_cards_block_cards_order_idx" ON "pages_blocks_service_cards_block_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_cards_block_cards_parent_id_idx" ON "pages_blocks_service_cards_block_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_cards_block_order_idx" ON "pages_blocks_service_cards_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_cards_block_parent_id_idx" ON "pages_blocks_service_cards_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_cards_block_path_idx" ON "pages_blocks_service_cards_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_portfolio_teaser_block_order_idx" ON "pages_blocks_portfolio_teaser_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_portfolio_teaser_block_parent_id_idx" ON "pages_blocks_portfolio_teaser_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portfolio_teaser_block_path_idx" ON "pages_blocks_portfolio_teaser_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_portfolio_grid_block_order_idx" ON "pages_blocks_portfolio_grid_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_portfolio_grid_block_parent_id_idx" ON "pages_blocks_portfolio_grid_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portfolio_grid_block_path_idx" ON "pages_blocks_portfolio_grid_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_section_block_tiers_features_order_idx" ON "pages_blocks_pricing_section_block_tiers_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_section_block_tiers_features_parent_id_idx" ON "pages_blocks_pricing_section_block_tiers_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_section_block_tiers_order_idx" ON "pages_blocks_pricing_section_block_tiers" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_section_block_tiers_parent_id_idx" ON "pages_blocks_pricing_section_block_tiers" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_section_block_order_idx" ON "pages_blocks_pricing_section_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_section_block_parent_id_idx" ON "pages_blocks_pricing_section_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_section_block_path_idx" ON "pages_blocks_pricing_section_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_strip_block_order_idx" ON "pages_blocks_cta_strip_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_strip_block_parent_id_idx" ON "pages_blocks_cta_strip_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_strip_block_path_idx" ON "pages_blocks_cta_strip_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_section_block_order_idx" ON "pages_blocks_contact_section_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_section_block_parent_id_idx" ON "pages_blocks_contact_section_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_section_block_path_idx" ON "pages_blocks_contact_section_block" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "portfolio_entries_screenshot_idx" ON "portfolio_entries" USING btree ("screenshot_id");
  CREATE INDEX "portfolio_entries_updated_at_idx" ON "portfolio_entries" USING btree ("updated_at");
  CREATE INDEX "portfolio_entries_created_at_idx" ON "portfolio_entries" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_portfolio_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("portfolio_entries_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_nav_links_order_idx" ON "site_settings_nav_links" USING btree ("_order");
  CREATE INDEX "site_settings_nav_links_parent_id_idx" ON "site_settings_nav_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_hero_block_ctas" CASCADE;
  DROP TABLE "pages_blocks_hero_block" CASCADE;
  DROP TABLE "pages_blocks_service_cards_block_cards" CASCADE;
  DROP TABLE "pages_blocks_service_cards_block" CASCADE;
  DROP TABLE "pages_blocks_portfolio_teaser_block" CASCADE;
  DROP TABLE "pages_blocks_portfolio_grid_block" CASCADE;
  DROP TABLE "pages_blocks_pricing_section_block_tiers_features" CASCADE;
  DROP TABLE "pages_blocks_pricing_section_block_tiers" CASCADE;
  DROP TABLE "pages_blocks_pricing_section_block" CASCADE;
  DROP TABLE "pages_blocks_cta_strip_block" CASCADE;
  DROP TABLE "pages_blocks_contact_section_block" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "portfolio_entries" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_nav_links" CASCADE;
  DROP TABLE "site_settings_footer_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_hero_block_ctas_style";
  DROP TYPE "public"."enum_pages_blocks_hero_block_style";`)
}
