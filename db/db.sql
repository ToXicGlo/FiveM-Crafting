CREATE TABLE IF NOT EXISTS `tx_crafting` (
  `identifier` int(111) DEFAULT NULL,
  `xp` varchar(255) DEFAULT NULL,
  UNIQUE KEY `unique_identifier` (`identifier`),
  KEY `identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
