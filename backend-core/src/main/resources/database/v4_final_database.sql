-- kilogram_db.users definition

CREATE TABLE `users` (
                         `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `display_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                         `bio` text COLLATE utf8mb4_unicode_ci,
                         `dob` date NOT NULL,
                         `num_of_followers` int DEFAULT '0',
                         `num_of_following` int DEFAULT '0',
                         `is_active` tinyint(1) DEFAULT '1',
                         `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         `avatar_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `username` (`username`),
                         KEY `idx_follower_count` (`num_of_followers`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.conversations definition

CREATE TABLE `conversations` (
                                 `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `user1_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `user2_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `last_message` text COLLATE utf8mb4_unicode_ci,
                                 `last_message_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (`id`),
                                 UNIQUE KEY `unique_conversation` (`user1_id`,`user2_id`),
                                 KEY `user2_id` (`user2_id`),
                                 CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                 CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.follows definition

CREATE TABLE `follows` (
                           `follower_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                           `following_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                           `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           PRIMARY KEY (`follower_id`,`following_id`),
                           KEY `idx_following` (`following_id`),
                           CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                           CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.messages definition

CREATE TABLE `messages` (
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `conversation_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                            `sender_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                            `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
                            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (`id`),
                            KEY `sender_id` (`sender_id`),
                            KEY `idx_conversation_messages` (`conversation_id`,`created_at` DESC),
                            CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
                            CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.posts definition

CREATE TABLE `posts` (
                         `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `content` text COLLATE utf8mb4_unicode_ci,
                         `like_count` int DEFAULT '0',
                         `comment_count` int DEFAULT '0',
                         `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         KEY `idx_post_user_created` (`user_id`,`created_at` DESC),
                         CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.user_interactions definition

CREATE TABLE `user_interactions` (
                                     `id` bigint NOT NULL AUTO_INCREMENT,
                                     `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `interaction_type` enum('LIKE','UNLIKE','COMMENT','DELETE_COMMENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     PRIMARY KEY (`id`),
                                     KEY `post_id` (`post_id`),
                                     KEY `idx_created_at` (`created_at`),
                                     KEY `idx_user_interaction` (`user_id`,`interaction_type`),
                                     CONSTRAINT `user_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                     CONSTRAINT `user_interactions_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=508 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.comments definition

CREATE TABLE `comments` (
                            `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                            `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                            `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                            `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
                            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            PRIMARY KEY (`id`),
                            KEY `user_id` (`user_id`),
                            KEY `idx_post_created` (`post_id`,`created_at`),
                            CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
                            CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.likes definition

CREATE TABLE `likes` (
                         `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (`post_id`,`user_id`),
                         KEY `idx_user_likes` (`user_id`),
                         CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
                         CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.notifications definition

CREATE TABLE `notifications` (
                                 `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `recipient_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `actor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `type` enum('NEW_POST','LIKE','COMMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `post_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                                 `is_read` tinyint(1) NOT NULL DEFAULT '0',
                                 `created_at` datetime(6) NOT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `fk_notif_actor` (`actor_id`),
                                 KEY `fk_notif_post` (`post_id`),
                                 KEY `idx_notif_recipient_created` (`recipient_id`,`created_at` DESC),
                                 KEY `idx_notif_recipient_unread` (`recipient_id`,`is_read`),
                                 CONSTRAINT `fk_notif_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                 CONSTRAINT `fk_notif_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
                                 CONSTRAINT `fk_notif_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- kilogram_db.post_images definition

CREATE TABLE `post_images` (
                               `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               `post_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                               `display_order` int NOT NULL,
                               `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               `public_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                               PRIMARY KEY (`id`),
                               KEY `post_id` (`post_id`),
                               CONSTRAINT `post_images_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;