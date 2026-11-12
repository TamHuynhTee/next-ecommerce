import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1792404803766 implements MigrationInterface {
  name = 'InitSchema1792404803766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "wishlists" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "product_variant_id" uuid NOT NULL, CONSTRAINT "pk_wishlists_product_variant_id_user_id" PRIMARY KEY ("user_id", "product_variant_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."categories_status_enum" AS ENUM('active', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slug" character varying(150) NOT NULL, "description" text, "status" "public"."categories_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "pk_categories_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_uq_category_slug_constraint" ON "categories"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_categories" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "slug" character varying(220) NOT NULL, "description" text, "parent_id" uuid NOT NULL, CONSTRAINT "pk_sub_categories_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_uq_sub_category_slug_constraint" ON "sub_categories"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('draft', 'active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slug" character varying(150) NOT NULL, "description" text, "status" "public"."products_status_enum" NOT NULL DEFAULT 'draft', "thumbnail_url" character varying(500), "category_id" uuid NOT NULL, CONSTRAINT "pk_products_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_uq_product_slug_constraint" ON "products"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying(100) NOT NULL, "name" character varying(150), "color" character varying(50), "size" character varying(50), "unit_price" bigint NOT NULL, "original_price" bigint, "currency" character(3) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "image_url" character varying(500), "attributes" jsonb NOT NULL DEFAULT '{}', "is_active" boolean NOT NULL DEFAULT true, "product_id" uuid NOT NULL, CONSTRAINT "chk_product_variant_original_price_constraint" CHECK ("original_price" >= 0), CONSTRAINT "chk_product_variant_unit_price_constraint" CHECK ("unit_price" >= 0), CONSTRAINT "chk_product_variant_stock_constraint" CHECK ("stock" >= 0), CONSTRAINT "pk_product_variants_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_uq_product_variant_sku_constraint" ON "product_variants"  ("sku") `,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "product_variant_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "chk_valid_cart_item_quantity_constraint" CHECK ("quantity" > 0), CONSTRAINT "pk_cart_items_product_variant_id_user_id" PRIMARY KEY ("user_id", "product_variant_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_variant_id" uuid, "product_name" character varying NOT NULL, "product_slug" character varying NOT NULL, "product_sku" character varying NOT NULL, "product_unit_price" bigint NOT NULL, "product_original_price" bigint, "currency" character(3) NOT NULL, "quantity" integer NOT NULL, "line_total" bigint NOT NULL, CONSTRAINT "uq_order_id_product_variant_id_constraint" UNIQUE ("order_id", "product_variant_id"), CONSTRAINT "chk_valid_order_item_line_total_constraint" CHECK ("line_total" = "product_unit_price" * "quantity"), CONSTRAINT "chk_valid_order_item_product_unit_price_constraint" CHECK ("product_unit_price" >= 0), CONSTRAINT "chk_valid_order_item_quantity_constraint" CHECK ("quantity" > 0), CONSTRAINT "pk_order_items_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "total_amount" bigint NOT NULL DEFAULT '0', "currency" character(3) NOT NULL, "provider" character varying(100) NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "REL_b2f7b823a21562eeca20e72b00" UNIQUE ("order_id"), CONSTRAINT "chk_valid_payment_total_amount_constraint" CHECK ("total_amount" >= 0), CONSTRAINT "pk_payments_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_details_status_enum" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_details" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "status" "public"."order_details_status_enum" NOT NULL DEFAULT 'pending', "total_amount" bigint NOT NULL DEFAULT '0', "currency" character(3) NOT NULL, "customer_first_name" character varying(100) NOT NULL, "customer_last_name" character varying(100) NOT NULL, "customer_phone_number" character varying(12) NOT NULL, "customer_email" character varying(100) NOT NULL, "customer_address_line_1" character varying(500) NOT NULL, "customer_address_line_2" character varying(500), "customer_country" character varying(2) NOT NULL, "customer_city" character varying(100) NOT NULL, "customer_postal_code" character varying(20) NOT NULL, CONSTRAINT "chk_valid_order_detail_total_amount_constraint" CHECK ("total_amount" >= 0), CONSTRAINT "pk_order_details_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying(100) NOT NULL, "address_line_1" character varying(500) NOT NULL, "address_line_2" character varying(500), "country" character varying(2) NOT NULL, "city" character varying(100) NOT NULL, "postal_code" character varying(20) NOT NULL, "phone_number" character varying(12) NOT NULL, CONSTRAINT "pk_addresses_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "avatar" character varying(500), "first_name" character varying(100), "last_name" character varying(100), "username" character varying(24) NOT NULL, "email" character varying(100) NOT NULL, "hashed_password" character varying(100) NOT NULL, "date_of_birth" date, CONSTRAINT "uq_email_constraint" UNIQUE ("email"), CONSTRAINT "u_username_constraint" UNIQUE ("username"), CONSTRAINT "pk_users_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "fk_wishlists_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "fk_wishlists_product_variant_id" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" ADD CONSTRAINT "fk_sub_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "fk_products_category_id" FOREIGN KEY ("category_id") REFERENCES "sub_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "fk_product_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "fk_cart_items_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "fk_cart_items_product_variant_id" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "order_details"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "fk_order_items_product_variant_id" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_order_id" FOREIGN KEY ("order_id") REFERENCES "order_details"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD CONSTRAINT "fk_order_details_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "fk_addresses_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "fk_addresses_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP CONSTRAINT "fk_order_details_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "fk_payments_order_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "fk_order_items_product_variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "fk_order_items_order_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "fk_cart_items_product_variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "fk_cart_items_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "fk_product_variants_product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "fk_products_category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" DROP CONSTRAINT "fk_sub_categories_parent_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "fk_wishlists_product_variant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "fk_wishlists_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TABLE "order_details"`);
    await queryRunner.query(`DROP TYPE "public"."order_details_status_enum"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_uq_product_variant_sku_constraint"`,
    );
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_uq_product_slug_constraint"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_uq_sub_category_slug_constraint"`,
    );
    await queryRunner.query(`DROP TABLE "sub_categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_uq_category_slug_constraint"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TYPE "public"."categories_status_enum"`);
    await queryRunner.query(`DROP TABLE "wishlists"`);
  }
}
