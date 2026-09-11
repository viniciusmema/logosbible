CREATE TABLE `reader_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`preferred_name` text DEFAULT '' NOT NULL,
	`avatar_data` text,
	`default_mode` text DEFAULT 'daily' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
