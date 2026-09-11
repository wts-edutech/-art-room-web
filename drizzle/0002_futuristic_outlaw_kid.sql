ALTER TABLE `awards` ADD `date` text;--> statement-breakpoint
ALTER TABLE `awards` ADD `award_level` text;--> statement-breakpoint
ALTER TABLE `awards` ADD `competition_level` text;--> statement-breakpoint
ALTER TABLE `awards` ADD `organization` text;--> statement-breakpoint
ALTER TABLE `awards` ADD `is_highlight` integer DEFAULT false;