use tutorexchange;

# ------------------
# userExists(userID)
# Returns the number of users with a specified student number
# Since userID is unique, will return 1 if user exists or 0 otherwise
#
# Param:
# 	userID - user's student number (integer)
#
# Returns:
#	1 column ('userExists') 1 row table containing number of users with specified student number
DROP PROCEDURE IF EXISTS userExists;

DELIMITER $
CREATE PROCEDURE `userExists` (userID_ INT(8))
BEGIN
	SELECT COUNT(*) AS 'userExists'
	FROM user
	WHERE userID = userID_;
END $
DELIMITER ;


# ------------------
# createUser(userID, firstName, lastName, DOB, sex, phone, passwordHash, passwordSalt)
# Adds a new user to the database (new row in users)
# 
# Param:
# 	userID - student number (integer)
#	firstName (string)
#	lastName (string)
#   DOB - Date of birth (YYYY-MM-DD)
#	sex - 'M', 'F' or 'O' (char)
# 	phone - phone number (string)
# 	passwordHash - hash of password+salt
#	passwordSalt - salt added to password
#
# Throws:
#	Throws a mysql error if user already exists.  Does not replace user.
DROP PROCEDURE IF EXISTS createUser;

DELIMITER $
CREATE PROCEDURE `createUser` (userID_ INT(8), firstName_ VARCHAR(100), lastName_ VARCHAR(100), DOB_ DATE, sex_ CHAR(1), phone_ VARCHAR(20), passwordHash_ VARCHAR(255), passwordSalt_ VARCHAR(255))
BEGIN
	INSERT INTO user
	SET userID = userID_,
		firstName = firstName_,
		lastName = lastName_,
		DOB = DOB_,
		sex = sex_,
		phone = phone_,
		passwordHash = passwordHash_,
		passwordSalt = passwordSalt_;
END $
DELIMITER ;


# ---------
# getUser(userID)
# Returns user information for user with specified student number
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
#	12 Columns table: (userID, firstName, lastName, DOB, sex, phone, emailVerified, passwordHash, passwordSalt, verifyCode, resetPasswordHash, resetPasswordSalt)
#
# Note: Returned table should have one row if user exists and no rows if user doesn't exist
DROP PROCEDURE IF EXISTS getUser;

DELIMITER $
CREATE PROCEDURE `getUser` (userID_ INT(8))
BEGIN
	SELECT *
	FROM user
	WHERE userID = userID_;
END $
DELIMITER ;


# ---------
# isBanned(userID)
# 
# Param:
#	userID - user's student number
#
# Returns:
#	1 if user has been banned, 0 otherwise
DROP PROCEDURE IF EXISTS isBanned;

DELIMITER $
CREATE PROCEDURE `isBanned` (userID_ INT(8))
BEGIN
	SELECT COUNT(*) AS `isBanned`
	FROM bannedUser
	WHERE userID = userID_;
END $
DELIMITER ;


# ---------
# upgradeToTutor(userID)
# Upgrades an existing user to a tutor account
# Ignores request if user already is a tutor
#
# Param:
# 	userID - user's student number
#
# Throws:
# 	mysql error when user doesn't exist
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
#	userID - user's student number (integer)
#	unit - unit taught (string)
#
# Throws:
#	mysql error when user does not exist
# 	mysql error when unit does not exist
# 	mysql error when row is duplicated
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
#	userID - user's student number (integer)
#	language - language taught (string)
#
# Throws:
#	mysql error when user does not exist
# 	mysql error when language does not exist
# 	mysql error when row is duplicated
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
# getPasswordHashAndSalt(userID)
# returns the password hash and salt for a given user
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
#	A two column table (hash, salt) with one row if user exists, zero rows if user doesn't exist
DROP PROCEDURE IF EXISTS getPasswordHashAndSalt;

DELIMITER $
CREATE PROCEDURE `getPasswordHashAndSalt` (userID_ INT(8))
BEGIN
	SELECT passwordHash AS `hash`,
		   passwordSalt AS `salt`
	FROM user
	WHERE userID = userID_;
END $
DELIMITER ;
