CREATE TABLE `studies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`book` text NOT NULL,
	`chapters` text NOT NULL,
	`title` text NOT NULL,
	`academic_json` text NOT NULL,
	`devotional_json` text,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_studies_user_created` ON `studies` (`user_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
