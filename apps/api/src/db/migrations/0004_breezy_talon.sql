CREATE TYPE "public"."billing_event_type" AS ENUM('subscription_created', 'subscription_updated', 'subscription_canceled', 'checkout_completed', 'refund_processed', 'subscription_revoked');--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"event_type" "billing_event_type" NOT NULL,
	"previous_plan" "subscription_plan",
	"new_plan" "subscription_plan",
	"previous_status" "subscription_status",
	"new_status" "subscription_status",
	"amount" integer,
	"reason" text,
	"polar_event_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;