ALTER TYPE "public"."subscription_status" ADD VALUE 'refunded';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "refund_amount" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "refund_reason" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "refund_count" integer DEFAULT 0;