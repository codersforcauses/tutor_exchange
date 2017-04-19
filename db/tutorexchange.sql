-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 19, 2017 at 05:08 AM
-- Server version: 5.5.54-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `tutorexchange`
--

-- --------------------------------------------------------

--
-- Table structure for table `bannedUser`
--

CREATE TABLE IF NOT EXISTS `bannedUser` (
  `userID` int(8) NOT NULL,
  `reason` longtext,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `guildUser`
--

CREATE TABLE IF NOT EXISTS `guildUser` (
  `guildID` int(11) NOT NULL AUTO_INCREMENT,
  `username` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  PRIMARY KEY (`guildID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `language`
--

CREATE TABLE IF NOT EXISTS `language` (
  `languageCode` varchar(45) NOT NULL,
  `languageName` varchar(45) NOT NULL,
  PRIMARY KEY (`languageCode`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `languageTutored`
--

CREATE TABLE IF NOT EXISTS `languageTutored` (
  `tutor` int(11) NOT NULL,
  `language` varchar(45) NOT NULL,
  PRIMARY KEY (`tutor`,`language`),
  KEY `fk_languageTutored_tutor_tutorID_idx` (`tutor`),
  KEY `fk_languageTutored_language_languageCode_idx` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE IF NOT EXISTS `session` (
  `sessionID` int(11) NOT NULL AUTO_INCREMENT,
  `tutor` int(8) NOT NULL,
  `tutee` int(8) NOT NULL,
  `unit` char(8) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comments` longtext,
  `sessionStatus` tinyint(1) NOT NULL,
  `confirmationStatus` tinyint(1) NOT NULL,
  `hoursAwarded` tinyint(1) NOT NULL,
  PRIMARY KEY (`sessionID`),
  KEY `fk_session_tutor_tutorID_idx` (`tutor`),
  KEY `fk_session_student_studentID_idx` (`tutee`),
  KEY `fk_session_units_unitsID_idx` (`unit`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=31 ;

-- --------------------------------------------------------

--
-- Table structure for table `sessionComplaint`
--

CREATE TABLE IF NOT EXISTS `sessionComplaint` (
  `sessionID` int(11) NOT NULL,
  `userID` int(8) NOT NULL,
  `reason` longtext NOT NULL,
  `resolved` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`sessionID`,`userID`),
  KEY `fk_sessionComplaint_tutor_userID_idx` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tutor`
--

CREATE TABLE IF NOT EXISTS `tutor` (
  `userID` int(8) NOT NULL,
  `bio` tinytext,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`userID`),
  KEY `userID_idx` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Stand-in structure for view `Tutoring Hours Guild Volunteering Report`
--
CREATE TABLE IF NOT EXISTS `Tutoring Hours Guild Volunteering Report` (
`StudentID` int(8)
,`First Name` varchar(100)
,`Surname` varchar(100)
,`Calendar Year` int(4)
,`Start Date` varchar(10)
,`End Date` varchar(10)
,`Hours` decimal(23,0)
);
-- --------------------------------------------------------

--
-- Table structure for table `unit`
--

CREATE TABLE IF NOT EXISTS `unit` (
  `unitID` char(8) NOT NULL,
  `unitName` varchar(100) NOT NULL,
  PRIMARY KEY (`unitID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `unitTutored`
--

CREATE TABLE IF NOT EXISTS `unitTutored` (
  `tutor` int(11) NOT NULL,
  `unit` char(8) NOT NULL,
  PRIMARY KEY (`tutor`,`unit`),
  KEY `fk_idx` (`tutor`),
  KEY `fk_unitsTutored_units_unitID_idx` (`unit`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `userID` int(8) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `DOB` date NOT NULL,
  `sex` char(1) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `passwordHash` varchar(255) NOT NULL,
  `passwordSalt` varchar(255) NOT NULL,
  `verifyCode` varchar(255) DEFAULT NULL,
  `resetPasswordHash` varchar(255) DEFAULT NULL,
  `resetPasswordSalt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure for view `Tutoring Hours Guild Volunteering Report`
--
DROP TABLE IF EXISTS `Tutoring Hours Guild Volunteering Report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`devTeam`@`localhost` SQL SECURITY DEFINER VIEW `Tutoring Hours Guild Volunteering Report` AS select `session`.`tutor` AS `StudentID`,`user`.`firstName` AS `First Name`,`user`.`lastName` AS `Surname`,year(curdate()) AS `Calendar Year`,date_format(min(`session`.`time`),'%d/%m/%Y') AS `Start Date`,date_format(max(`session`.`time`),'%d/%m/%Y') AS `End Date`,sum((`session`.`hoursAwarded` = '1')) AS `Hours` from (`session` join `user` on((`session`.`tutor` = `user`.`userID`))) group by `session`.`tutor`;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bannedUser`
--
ALTER TABLE `bannedUser`
  ADD CONSTRAINT `fk_bannedUser_user_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `languageTutored`
--
ALTER TABLE `languageTutored`
  ADD CONSTRAINT `fk_languageTutored_language_languageCode` FOREIGN KEY (`language`) REFERENCES `language` (`languageCode`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_languageTutored_tutor_userID` FOREIGN KEY (`tutor`) REFERENCES `tutor` (`userID`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `fk_session_tutor_tutorID` FOREIGN KEY (`tutor`) REFERENCES `tutor` (`userID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_session_unit_unitID` FOREIGN KEY (`unit`) REFERENCES `unit` (`unitID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_session_user_userID` FOREIGN KEY (`tutee`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `sessionComplaint`
--
ALTER TABLE `sessionComplaint`
  ADD CONSTRAINT `fk_sessionComplaint_session_sessionID` FOREIGN KEY (`sessionID`) REFERENCES `session` (`sessionID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sessionComplaint_user_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `tutor`
--
ALTER TABLE `tutor`
  ADD CONSTRAINT `fk_tutor_user_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `unitTutored`
--
ALTER TABLE `unitTutored`
  ADD CONSTRAINT `fk_unitsTutored_tutor_userID` FOREIGN KEY (`tutor`) REFERENCES `tutor` (`userID`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_unitsTutored_unit_unitID` FOREIGN KEY (`unit`) REFERENCES `unit` (`unitID`) ON DELETE NO ACTION ON UPDATE CASCADE;

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`devTeam`@`localhost` EVENT `Database Update` ON SCHEDULE EVERY 1 DAY STARTS '2017-03-05 08:00:00' ON COMPLETION PRESERVE ENABLE DO BEGIN
UPDATE session SET sessionStatus = 2 WHERE sessionStatus = 1 AND (NOW() > DATE_ADD(time, INTERVAL 1 HOUR));
UPDATE session SET hoursAwarded = 1 WHERE sessionStatus = 2 AND confirmationStatus = 3 AND hoursAwarded = 0 AND (NOW() > DATE_ADD(time, INTERVAL 1 HOUR));
UPDATE session SET sessionStatus = 4 WHERE sessionStatus = 3 AND (NOW() > DATE_ADD(time, INTERVAL 1 HOUR));
UPDATE user SET resetPasswordHash = NULL, resetPasswordSalt = NULL;
END$$

DELIMITER ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
