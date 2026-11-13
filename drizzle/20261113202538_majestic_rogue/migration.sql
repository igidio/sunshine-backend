CREATE TABLE `appointment` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`customer_id` int NOT NULL,
	`treatment_id` int NOT NULL,
	`date` date NOT NULL,
	`time_start` time NOT NULL,
	`time_end` time NOT NULL,
	`notes` text,
	`disabled_at` datetime,
	`created_at` datetime DEFAULT (now()),
	`updated_at` datetime DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(60) NOT NULL,
	`description` varchar(255) NOT NULL,
	`created_at` datetime DEFAULT (now()),
	`updated_at` datetime DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `name_unique` UNIQUE INDEX(`name`)
);
--> statement-breakpoint
CREATE TABLE `confirmation` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`token` varchar(200) NOT NULL,
	`type` enum('recovery','verification','add_admin') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`has_used` boolean NOT NULL DEFAULT false,
	`is_valid` boolean NOT NULL DEFAULT true,
	`invalidated_by` int,
	`expiration_days` int NOT NULL DEFAULT 1,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`profile_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`disabled_at` timestamp,
	`deleted_at` timestamp,
	`phone_number` varchar(20)
);
--> statement-breakpoint
CREATE TABLE `movement` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`supplier_id` int,
	`stock_id` int NOT NULL,
	`movement_type` enum('purchase','expired','damaged','lost','adjustment','internal_use') NOT NULL DEFAULT 'purchase',
	`quantity` int NOT NULL DEFAULT 0,
	`notes` text,
	`created_at` datetime DEFAULT (now()),
	`updated_at` datetime DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`user_id` int NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`deleted_at` timestamp,
	`readed_at` timestamp,
	`goto_url` text,
	`type` enum('info','warning','error','success') NOT NULL DEFAULT 'info'
);
--> statement-breakpoint
CREATE TABLE `product_image` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`product_id` int NOT NULL,
	`image_url` varchar(2000) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`category_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(1024) NOT NULL,
	`price` real(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`disabled_at` timestamp
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`birth_date` date NOT NULL,
	`address` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sale_appointment_detail` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`sale_id` int NOT NULL,
	`appointment_id` int NOT NULL,
	`price` real(10,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sale_product_detail` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`sale_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` real(10,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sale` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`customer_id` int NOT NULL,
	`total` real(10,2) NOT NULL,
	`payment_method` enum('cash','card','transfer') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`bill` varchar(255)
);
--> statement-breakpoint
CREATE TABLE `stock` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`product_id` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`created_at` datetime DEFAULT (now()),
	`updated_at` datetime DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime
);
--> statement-breakpoint
CREATE TABLE `supplier` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`image_url` varchar(2000),
	`email` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`created_at` datetime DEFAULT (now()),
	`updated_at` datetime DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`disabled_at` datetime,
	`deleted_at` datetime
);
--> statement-breakpoint
CREATE TABLE `treatment` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`description` varchar(2000) NOT NULL,
	`price` real(10,2) NOT NULL,
	`duration_minutes` int NOT NULL,
	`disabled_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`username` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`phone_number` varchar(20),
	`created_at` timestamp DEFAULT (now()),
	`user_role` enum('superuser','admin','employer','customer') NOT NULL DEFAULT 'employer',
	`profile_id` int NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`disabled_at` timestamp,
	`permissions` text NOT NULL DEFAULT (''),
	`chat_access` varchar(255),
	`telegram_id` varchar(255),
	CONSTRAINT `username_unique` UNIQUE INDEX(`username`),
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`),
	CONSTRAINT `telegram_id_unique` UNIQUE INDEX(`telegram_id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`product_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`added_at` timestamp DEFAULT (now()),
	CONSTRAINT `unique_customer_product` UNIQUE INDEX(`customer_id`,`product_id`)
);
--> statement-breakpoint
ALTER TABLE `appointment` ADD CONSTRAINT `appointment_customer_id_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`);--> statement-breakpoint
ALTER TABLE `appointment` ADD CONSTRAINT `appointment_treatment_id_treatment_id_fkey` FOREIGN KEY (`treatment_id`) REFERENCES `treatment`(`id`);--> statement-breakpoint
ALTER TABLE `confirmation` ADD CONSTRAINT `confirmation_invalidated_by_user_id_fkey` FOREIGN KEY (`invalidated_by`) REFERENCES `user`(`id`);--> statement-breakpoint
ALTER TABLE `customer` ADD CONSTRAINT `customer_profile_id_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`);--> statement-breakpoint
ALTER TABLE `movement` ADD CONSTRAINT `movement_supplier_id_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`);--> statement-breakpoint
ALTER TABLE `movement` ADD CONSTRAINT `movement_stock_id_stock_id_fkey` FOREIGN KEY (`stock_id`) REFERENCES `stock`(`id`);--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`);--> statement-breakpoint
ALTER TABLE `product_image` ADD CONSTRAINT `product_image_product_id_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`);--> statement-breakpoint
ALTER TABLE `product` ADD CONSTRAINT `product_category_id_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`);--> statement-breakpoint
ALTER TABLE `sale_appointment_detail` ADD CONSTRAINT `sale_appointment_detail_sale_id_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sale`(`id`);--> statement-breakpoint
ALTER TABLE `sale_appointment_detail` ADD CONSTRAINT `sale_appointment_detail_appointment_id_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointment`(`id`);--> statement-breakpoint
ALTER TABLE `sale_product_detail` ADD CONSTRAINT `sale_product_detail_sale_id_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sale`(`id`);--> statement-breakpoint
ALTER TABLE `sale_product_detail` ADD CONSTRAINT `sale_product_detail_product_id_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`);--> statement-breakpoint
ALTER TABLE `sale` ADD CONSTRAINT `sale_customer_id_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`);--> statement-breakpoint
ALTER TABLE `stock` ADD CONSTRAINT `stock_product_id_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`);--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_profile_id_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`);--> statement-breakpoint
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_product_id_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`);--> statement-breakpoint
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_customer_id_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`);