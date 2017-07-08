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
CREATE PROCEDURE `userExists` (ID INT(8))
BEGIN
	SELECT COUNT(*) AS 'userExists'
	FROM user
	WHERE userID = ID;
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
CREATE PROCEDURE `getUser` (ID INT(8))
BEGIN
	SELECT *
	FROM user
	WHERE userID = ID;
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
CREATE PROCEDURE `isBanned` (ID INT(8))
BEGIN
	SELECT COUNT(*) AS `isBanned`
	FROM bannedUser
	WHERE userID = ID;
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
