CREATE DATABASE IF NOT EXISTS `GDPR` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `GDPR`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `users` (`id`, `username`, `password`) VALUES (1, 'admin', 'admin');

ALTER TABLE users
ADD COLUMN description VARCHAR(255);

UPDATE users SET password = SHA2('admin', 256) WHERE id = 1;

CREATE TABLE logging (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO logging (message) VALUES ('Successful login');

ALTER TABLE users
ADD COLUMN last_password_change DATETIME DEFAULT NULL;
