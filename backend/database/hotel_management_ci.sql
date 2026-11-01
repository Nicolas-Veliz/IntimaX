CREATE DATABASE  IF NOT EXISTS `hotel_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `hotel_management`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hotel_management
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` enum('login','logout') DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `session_duration` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`timestamp`),
  CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `amenities`
--

DROP TABLE IF EXISTS `amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `min_stock_alert` int DEFAULT '5',
  `category` enum('bebidas','desayuno','drugstore','comidas','postres','bebidas_con_alcohol') DEFAULT 'comidas',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_metrics`
--

DROP TABLE IF EXISTS `daily_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `total_shifts` int DEFAULT '0',
  `total_income` decimal(10,2) DEFAULT '0.00',
  `cash_income` decimal(10,2) DEFAULT '0.00',
  `card_income` decimal(10,2) DEFAULT '0.00',
  `transfer_income` decimal(10,2) DEFAULT '0.00',
  `average_duration_minutes` decimal(10,2) DEFAULT NULL,
  `peak_hour` int DEFAULT NULL,
  `room_rotation_rate` decimal(5,2) DEFAULT NULL,
  `no_shows` int DEFAULT '0',
  `extensions_total` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`),
  KEY `fk_daily_user` (`user_id`),
  KEY `fk_daily_room` (`room_id`),
  CONSTRAINT `fk_daily_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `fk_daily_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `daily_operations_report`
--

DROP TABLE IF EXISTS `daily_operations_report`;
/*!50001 DROP VIEW IF EXISTS `daily_operations_report`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `daily_operations_report` AS SELECT
 1 AS `fecha`,
 1 AS `habitaciones_usadas`,
 1 AS `total_turnos`,
 1 AS `duracion_promedio_min`,
 1 AS `ingreso_total`,
 1 AS `extensiones_realizadas`,
 1 AS `no_shows`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `hourly_stats`
--

DROP TABLE IF EXISTS `hourly_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hourly_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `hour` int NOT NULL,
  `shifts_count` int DEFAULT '0',
  `income` decimal(10,2) DEFAULT '0.00',
  `shift_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_date_hour` (`date`,`hour`),
  KEY `fk_hourly_shift` (`shift_id`),
  KEY `fk_hourly_room` (`room_id`),
  CONSTRAINT `fk_hourly_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `fk_hourly_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `room_amenities`
--

DROP TABLE IF EXISTS `room_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shift_id` int DEFAULT NULL,
  `amenity_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `consumed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shift_id` (`shift_id`),
  KEY `amenity_id` (`amenity_id`),
  CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`),
  CONSTRAINT `room_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) NOT NULL,
  `room_type` enum('especial','especial con hidro','premium') DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `price_per_extra_hour` decimal(10,2) DEFAULT NULL,
  `cleaning_time_minutes` int NOT NULL DEFAULT '10',
  `status` enum('available','occupied','cleaning','maintenance') DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `extended_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shift_extensions`
--

DROP TABLE IF EXISTS `shift_extensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shift_extensions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shift_id` int DEFAULT NULL,
  `extra_hours` int NOT NULL,
  `extra_price` decimal(10,2) DEFAULT NULL,
  `extended_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `extended_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shift_id` (`shift_id`),
  KEY `extended_by` (`extended_by`),
  CONSTRAINT `shift_extensions_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`),
  CONSTRAINT `shift_extensions_ibfk_2` FOREIGN KEY (`extended_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int DEFAULT NULL,
  `shift_code` varchar(20) DEFAULT NULL,
  `duration_hours` int NOT NULL,
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_time` datetime DEFAULT NULL,
  `actual_end_time` datetime DEFAULT NULL,
  `extended_count` int DEFAULT '0',
  `total_hours` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `payment_method` enum('cash','card','transfer','pending') DEFAULT 'pending',
  `status` enum('active','cleaning','completed','no_show','cancelled') DEFAULT 'active',
  `no_show_confirmed` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `cleaned_by` int DEFAULT NULL,
  `cleaning_start` datetime DEFAULT NULL,
  `cleaning_end` datetime DEFAULT NULL,
  `notes` text,
  `cleaned_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shift_code` (`shift_code`),
  KEY `room_id` (`room_id`),
  KEY `created_by` (`created_by`),
  KEY `cleaned_by` (`cleaned_by`),
  KEY `idx_status_room` (`status`,`room_id`),
  KEY `idx_date` (`start_time`),
  CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `shifts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `shifts_ibfk_3` FOREIGN KEY (`cleaned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock_history`
--

DROP TABLE IF EXISTS `stock_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amenity_id` int DEFAULT NULL,
  `previous_stock` int DEFAULT NULL,
  `new_stock` int DEFAULT NULL,
  `quantity_change` int DEFAULT NULL,
  `action` enum('add','remove','adjust') DEFAULT NULL,
  `performed_by` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `amenity_id` (`amenity_id`),
  KEY `performed_by` (`performed_by`),
  CONSTRAINT `stock_history_ibfk_1` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`),
  CONSTRAINT `stock_history_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('admin','supervisor','receptionist','cleaning') DEFAULT 'receptionist',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_name` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `shift` enum('maÃ±ana','tarde','noche') DEFAULT 'maÃ±ana',
  `avatar_color` varchar(7) DEFAULT '#e94560',
  `last_logout` datetime DEFAULT NULL,
  `session_duration` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `daily_operations_report`
--

/*!50001 DROP VIEW IF EXISTS `daily_operations_report`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY INVOKER */
/*!50001 VIEW `daily_operations_report` AS select cast(`shifts`.`start_time` as date) AS `fecha`,count(distinct `shifts`.`room_id`) AS `habitaciones_usadas`,count(0) AS `total_turnos`,coalesce(avg(timestampdiff(MINUTE,`shifts`.`start_time`,coalesce(`shifts`.`actual_end_time`,`shifts`.`end_time`))),0) AS `duracion_promedio_min`,coalesce(sum(`shifts`.`price`),0) AS `ingreso_total`,sum((case when (`shifts`.`extended_count` > 0) then 1 else 0 end)) AS `extensiones_realizadas`,sum((case when (`shifts`.`status` = 'no_show') then 1 else 0 end)) AS `no_shows` from `shifts` where (`shifts`.`status` in ('completed','cleaning','no_show')) group by cast(`shifts`.`start_time` as date) order by `fecha` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-01 19:02:22
