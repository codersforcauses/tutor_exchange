use tutorexchange;

# ---------
# upgradeToTutor(userID)
# Upgrades an existing user to a tutor account
# Ignores request if user already is a tutor
#
# Param:
#   userID - user's student number
#
# Throws:
#   mysql error when user doesn't exist
DROP PROCEDURE IF EXISTS upgradeToTutor;

DELIMITER $
CREATE PROCEDURE `upgradeToTutor` (userID_ INT(8))
BEGIN
    INSERT INTO tutor
    SET userID = userID_;
END $
DELIMITER ;


# ---------
# assignUnitTutored(userID, unit)
# Assigns a tutor to teach a unit
#
# Param:
#   userID - user's student number (integer)
#   unit - unit taught (string)
#
# Throws:
#   mysql error when user does not exist
#   mysql error when unit does not exist
#   mysql error when row is duplicated
DROP PROCEDURE IF EXISTS assignUnitTutored;

DELIMITER $
CREATE PROCEDURE `assignUnitTutored` (userID_ INT(8), unit_ CHAR(8))
BEGIN
    INSERT INTO unitTutored
    SET tutor = userID_,
        unit = unit_;
END $
DELIMITER ;


# ---------
# assignLanguageTutored(userID, language)
# Assigns a tutor to teach a language
#
# Param:
#   userID - user's student number (integer)
#   language - language taught (string)
#
# Throws:
#   mysql error when user does not exist
#   mysql error when language does not exist
#   mysql error when row is duplicated
DROP PROCEDURE IF EXISTS assignLanguageTutored;

DELIMITER $
CREATE PROCEDURE `assignLanguageTutored` (userID_ INT(8), language_ CHAR(2))
BEGIN
    INSERT INTO languageTutored
    SET tutor = userID_,
        language = language_;
END $
DELIMITER ;


# ---------
# getTutoredUnits(userID)
# gets a list of units tutored by a user
#
# Param:
#   userID - user's student number (integer)
#
# Returns:
#   An 2 column table (unitID, unitName)
#       each row containing a unique unit tutored
DROP PROCEDURE IF EXISTS getTutoredUnits;

DELIMITER $
CREATE PROCEDURE `getTutoredUnits` (userID_ INT(8))
BEGIN
    SELECT unitID, unitName
    FROM tutor
    JOIN unitTutored
    ON tutor.userID = unitTutored.tutor
    JOIN unit
    ON unitTutored.unit = unit.unitID
    WHERE tutor.userID = userID_;
END $
DELIMITER ;


# ---------
# getTutoredLanguages(userID)
# gets a list of languages tutored by a user
#
# Param:
#   userID - user's student number (integer)
#
# Returns:
#   An 2 column table (languageCode, languageName)
#       each row containing a unique language tutored
DROP PROCEDURE IF EXISTS getTutoredLanguages;

DELIMITER $
CREATE PROCEDURE `getTutoredLanguages` (userID_ INT(8))
BEGIN
    SELECT languageCode, languageName
    FROM tutor
    JOIN languageTutored
    ON tutor.userID = languageTutored.tutor
    JOIN language
    ON languageTutored.language = language.languageCode
    WHERE tutor.userID = userID_;
END $
DELIMITER ;


# ------------------
# updateTutorProfile(userID, bio, visible)
# Updates an existing tutor's bio and visibility
# 
# Param:
#   userID - student number (integer)
#   bio - tutor's short biography (string)
#   visible - tutor's visibility on tutor lists (1 - true, 0 - false)
DROP PROCEDURE IF EXISTS updateTutorProfile;

DELIMITER $
CREATE PROCEDURE `updateTutorProfile` (userID_ INT(8), bio_ TEXT, visible_ INT(1))
BEGIN
    UPDATE tutor
    SET bio = bio_,
        visible = visible_
    WHERE userID = userID_;
END $
DELIMITER ;


# ---------
# removeUnitTutored(userID, unit)
# Unassigns a tutor from teaching a unit
#
# Param:
#   userID - user's student number (integer)
#   unit - unit to be dropped (string)
DROP PROCEDURE IF EXISTS removeUnitTutored;

DELIMITER $
CREATE PROCEDURE `removeUnitTutored` (userID_ INT(8), unit_ CHAR(8))
BEGIN
    DELETE FROM unitTutored
    WHERE tutor = userID_
    AND unit = unit_;
END $
DELIMITER ;


# ---------
# removeLanguageTutored(userID, language)
# Unassigns a tutor to teach from teaching in a language
#
# Param:
#   userID - user's student number (integer)
#   language - language taught (string)
DROP PROCEDURE IF EXISTS removeLanguageTutored;

DELIMITER $
CREATE PROCEDURE `removeLanguageTutored` (userID_ INT(8), language_ CHAR(2))
BEGIN
    DELETE FROM languageTutored
    WHERE tutor = userID_
    AND language = language_;
END $
DELIMITER ;


# ---------
# searchTutors(unitID, languageCode)
# Get a list of tutors that teach a unit in a language
#
# Param:
#   unitID - unit tutors teach (string)
#   languageCode - language tutors teach in (string)
DROP PROCEDURE IF EXISTS searchTutors;

DELIMITER $
CREATE PROCEDURE `searchTutors` (unitID_ CHAR(8), languageName_ VARCHAR(20))
BEGIN
    SELECT GROUP_CONCAT(DISTINCT languageName) AS languageName,
        GROUP_CONCAT(DISTINCT unitID) AS unitID,
        tutor.userID,
        firstName,
        lastName,
        phone,
        bio,
        visible,
        emailVerified,
        verified,
        isBanned
    FROM tutor
    JOIN languageTutored
        ON tutor.userID = languageTutored.tutor
    JOIN language
        ON languageTutored.language = language.languageCode
    JOIN unitTutored
        ON unitTutored.tutor = tutor.userID
    JOIN unit
        ON unitTutored.unit = unit.unitID
    JOIN user
        ON user.userID = tutor.userID
    LEFT JOIN (SELECT userID, COUNT(*) AS isBanned FROM bannedUser GROUP BY userID) AS banned
        ON user.userID = banned.userID
    WHERE visible = 1
        AND emailVerified = 1
        AND verified = 1
        AND isBanned IS NULL
    GROUP BY tutor.userID
    HAVING unitID LIKE CONCAT('%', IFNULL(unitID_, ''), '%')
        AND languageName LIKE CONCAT('%', IFNULL(languageName_, ''), '%');
END $
DELIMITER ;


