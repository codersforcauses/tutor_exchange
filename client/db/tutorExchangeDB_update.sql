-- phpMyAdmin SQL Dump
-- version 4.4.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Feb 10, 2017 at 05:09 AM
-- Server version: 5.5.42
-- PHP Version: 5.6.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tutorExchangeDB`
--

-- --------------------------------------------------------

--
-- Table structure for table `bannedUser`
--

CREATE TABLE `bannedUser` (
  `userID` int(8) NOT NULL,
  `reason` longtext
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `guildUser`
--

CREATE TABLE `guildUser` (
  `guildID` int(11) NOT NULL,
  `username` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `language`
--

CREATE TABLE `language` (
  `languageCode` varchar(5) NOT NULL,
  `languageName` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `languageTutored`
--

CREATE TABLE `languageTutored` (
  `tutor` int(11) NOT NULL,
  `language` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `sessionID` int(11) NOT NULL,
  `tutor` int(8) NOT NULL,
  `tutee` int(8) NOT NULL,
  `unit` char(8) NOT NULL,
  `time` datetime NOT NULL,
  `statusCode` int(1) NOT NULL,
  `comments` longtext
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `sessionComplaint`
--

CREATE TABLE `sessionComplaint` (
  `sessionID` int(11) NOT NULL,
  `userID` int(8) NOT NULL,
  `reason` longtext NOT NULL,
  `resolvedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tutor`
--

CREATE TABLE `tutor` (
  `userID` int(8) NOT NULL,
  `postcode` int(4) DEFAULT NULL,
  `bio` longtext,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `multipleLanguages` tinyint(1) NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `unit`
--

CREATE TABLE `unit` (
  `unitID` char(8) NOT NULL,
  `unitName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `unitTutored`
--

CREATE TABLE `unitTutored` (
  `tutor` int(11) NOT NULL,
  `unit` char(8) NOT NULL,
  `numberOfSessions` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `userID` int(8) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `DOB` date NOT NULL,
  `sex` char(1) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `accountType` int(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userID`, `email`, `name`, `DOB`, `sex`, `phone`, `password`, `passwordHash`, `accountType`) VALUES
(21707545, NULL, 'Liam Peeters', '2000-01-01', 'F', NULL, 'please', 'hash', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bannedUser`
--
ALTER TABLE `bannedUser`
  ADD PRIMARY KEY (`userID`);

--
-- Indexes for table `guildUser`
--
ALTER TABLE `guildUser`
  ADD PRIMARY KEY (`guildID`);

--
-- Indexes for table `language`
--
ALTER TABLE `language`
  ADD PRIMARY KEY (`languageCode`);

--
-- Indexes for table `languageTutored`
--
ALTER TABLE `languageTutored`
  ADD PRIMARY KEY (`tutor`,`language`),
  ADD KEY `fk_languageTutored_tutor_tutorID_idx` (`tutor`),
  ADD KEY `fk_languageTutored_language_languageCode_idx` (`language`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`sessionID`),
  ADD KEY `fk_session_tutor_tutorID_idx` (`tutor`),
  ADD KEY `fk_session_student_studentID_idx` (`tutee`),
  ADD KEY `fk_session_units_unitsID_idx` (`unit`);

--
-- Indexes for table `sessionComplaint`
--
ALTER TABLE `sessionComplaint`
  ADD PRIMARY KEY (`sessionID`,`userID`),
  ADD KEY `fk_sessionComplaint_tutor_userID_idx` (`userID`),
  ADD KEY `fk_sessionComplaint_guildUser_guildID_idx` (`resolvedBy`);

--
-- Indexes for table `tutor`
--
ALTER TABLE `tutor`
  ADD PRIMARY KEY (`userID`),
  ADD KEY `userID_idx` (`userID`);

--
-- Indexes for table `unit`
--
ALTER TABLE `unit`
  ADD PRIMARY KEY (`unitID`);

--
-- Indexes for table `unitTutored`
--
ALTER TABLE `unitTutored`
  ADD PRIMARY KEY (`tutor`,`unit`),
  ADD KEY `fk_idx` (`tutor`),
  ADD KEY `fk_unitsTutored_units_unitID_idx` (`unit`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`userID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `guildUser`
--
ALTER TABLE `guildUser`
  MODIFY `guildID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `session`
--
ALTER TABLE `session`
  MODIFY `sessionID` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `bannedUser`
--
ALTER TABLE `bannedUser`
  ADD CONSTRAINT `fk_bannedUser_user_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `languageTutored`
--
ALTER TABLE `languageTutored`
  ADD CONSTRAINT `fk_languageTutored_tutor_userID` FOREIGN KEY (`tutor`) REFERENCES `tutor` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_languageTutored_language_languageCode` FOREIGN KEY (`language`) REFERENCES `language` (`languageCode`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `fk_session_tutor_tutorID` FOREIGN KEY (`tutor`) REFERENCES `tutor` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_session_user_userID` FOREIGN KEY (`tutee`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_session_unit_unitID` FOREIGN KEY (`unit`) REFERENCES `unit` (`unitID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `sessionComplaint`
--
ALTER TABLE `sessionComplaint`
  ADD CONSTRAINT `fk_sessionComplaint_user_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_sessionComplaint_guildUser_guildID` FOREIGN KEY (`resolvedBy`) REFERENCES `guildUser` (`guildID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_sessionComplaint_session_sessionID` FOREIGN KEY (`sessionID`) REFERENCES `session` (`sessionID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `tutor`
--
ALTER TABLE `tutor`
  ADD CONSTRAINT `fk_tutor_user_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `unitTutored`
--
ALTER TABLE `unitTutored`
  ADD CONSTRAINT `fk_unitsTutored_tutor_userID` FOREIGN KEY (`tutor`) REFERENCES `tutor` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_unitsTutored_unit_unitID` FOREIGN KEY (`unit`) REFERENCES `unit` (`unitID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
