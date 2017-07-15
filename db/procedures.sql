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


# ---------
# getAccountStatus(userID)
# returns info used to work out the user's account type
# 	isEmailVerified: whether user has responded to the account creation email
#	isBanned: whether the user has been banned or not
# 	isTutor: whether the user is a tutor or not
# 	isVetted: whether the tutor has been vetted by VTE or is still pending
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
#	A 4 column table (isEmailVerified, isBanned, isTutor, isVetted) in one row if user exists, zero rows if user doesn't exist
DROP PROCEDURE IF EXISTS getAccountStatus;

DELIMITER $
CREATE PROCEDURE `getAccountStatus` (userID_ INT(8))
BEGIN
	SELECT isEmailVerified, isBanned, isTutor, isVetted
	FROM (
		(SELECT userID, emailVerified AS isEmailVerified FROM user WHERE userID = userID_) AS x
		JOIN
		(SELECT userID_ AS userID, COUNT(*) AS isBanned FROM bannedUser WHERE userID = userID_) AS y
		ON x.userID = y.userID
		JOIN
		(SELECT userID_ AS userID, COUNT(*) AS isTutor, IFNULL(verified, 0) AS isVetted FROM tutor WHERE userID = userID_) AS z
		ON x.userID = z.userID
	);
END $
DELIMITER ;


# ---------
# getProfile(userID)
# returns user profile for a specified user
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
#	An 8 column table (userID, firstName, lastName, DOB, sex, phone, bio, visible)
#		one row if user exists, zero rows if user doesn't exist
#		bio and visible are null if user is not a tutor
DROP PROCEDURE IF EXISTS getProfile;

DELIMITER $
CREATE PROCEDURE `getProfile` (userID_ INT(8))
BEGIN
	SELECT u.userID,
		u.firstName,
		u.lastName,
		u.DOB,
		u.sex,
		u.phone,
		t.bio,
		t.visible
	FROM user AS u
	LEFT JOIN tutor AS t
	ON u.userID = t.userID
	WHERE u.userID = userID_;
END $
DELIMITER ;


# ---------
# getTutoredUnits(userID)
# gets a list of units tutored by a user
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
#	An 2 column table (unitID, unitName)
#		each row containing a unique unit tutored
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
#	userID - user's student number (integer)
#
# Returns:
#	An 2 column table (languageCode, languageName)
#		each row containing a unique language tutored
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
# updateUser(userID, firstName, lastName, DOB, sex, phone)
# Updates an existing user in the database (all fields)
# 
# Param:
# 	userID - student number (integer)
#	firstName (string)
#	lastName (string)
#   DOB - Date of birth (YYYY-MM-DD)
#	sex - 'M', 'F' or 'O' (char)
# 	phone - phone number (string)
#
# Note: No effect when user doesn't exist
DROP PROCEDURE IF EXISTS updateUser;

DELIMITER $
CREATE PROCEDURE `updateUser` (userID_ INT(8), firstName_ VARCHAR(100), lastName_ VARCHAR(100), DOB_ DATE, sex_ CHAR(1), phone_ VARCHAR(20))
BEGIN
	UPDATE user
	SET firstName = firstName_,
		lastName = lastName_,
		DOB = DOB_,
		sex = sex_,
		phone = phone_
	WHERE userID = userID_;
END $
DELIMITER ;


# ------------------
# updateTutorProfile(userID, bio, visible)
# Updates an existing tutor's bio and visibility
# 
# Param:
# 	userID - student number (integer)
#	bio - tutor's short biography (string)
#	visible - tutor's visibility on tutor lists (1 - true, 0 - false)
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
#	userID - user's student number (integer)
#	unit - unit to be dropped (string)
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
#	userID - user's student number (integer)
#	language - language taught (string)
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
#	unitID - unit tutors teach (string)
#	languageCode - language tutors teach in (string)
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


# ---------
# getRequests(userID)
# Gets list of session requests for a given user (as student or tutor)
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
# 	An 8 column table (sessionID, role, unit, time, comment, firstName, lastName, phone)
#		one row per session.
#		- role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
#		- firstName, lastName and phone belong to the other student.
DROP PROCEDURE IF EXISTS getRequests;

DELIMITER $
CREATE PROCEDURE `getRequests` (userID_ INT(8))
BEGIN
	(SELECT session.sessionID,
		'STUDENT' AS role,
		session.unit,
		session.time,
		session.comments,
		user.firstName,
		user.lastName,
		user.phone
	FROM session
	JOIN user
		ON session.tutor = user.userID
	WHERE sessionStatus = 0
		AND tutee = userID_)

	UNION

	(SELECT session.sessionID,
		'TUTOR' AS role,
		session.unit,
		session.time,
		session.comments,
		user.firstName,
		user.lastName,
		user.phone
	FROM session
	JOIN user
		ON session.tutee = user.userID
	WHERE sessionStatus = 0
		AND tutor = userID_);
END $
DELIMITER ;


# ---------
# getAppointments(userID)
# Gets list of session appointments for a given user (as student or tutor)
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
# 	A 9 column table (sessionID, role, unit, time, comment, firstName, lastName, phone, isCancelled)
#		one row per session.
#		- role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
#		- firstName, lastName and phone belong to the other student.
#		- isCancelled is 1 if appointment has been cancelled and 0 otherwise.
DROP PROCEDURE IF EXISTS getAppointments;

DELIMITER $
CREATE PROCEDURE `getAppointments` (userID_ INT(8))
BEGIN
	(SELECT session.sessionID,
		'STUDENT' AS role,
		session.unit,
		session.time,
		session.comments,
		user.firstName,
		user.lastName,
		user.phone,
		IF(sessionStatus = 3, 1, 0) AS isCancelled
	FROM session
	JOIN user
		ON session.tutor = user.userID
	WHERE (sessionStatus = 1 OR sessionStatus = 3)
		AND tutee = userID_)

	UNION

	(SELECT session.sessionID,
		'TUTOR' AS role,
		session.unit,
		session.time,
		session.comments,
		user.firstName,
		user.lastName,
		user.phone,
		IF(sessionStatus = 3, 1, 0) AS isCancelled
	FROM session
	JOIN user
		ON session.tutee = user.userID
	WHERE (sessionStatus = 1 OR sessionStatus = 3)
		AND tutor = userID_);
END $
DELIMITER ;


# ---------
# getOpenSessions(userID)
# Gets list of session that have occurred but have not been signed off for a given user (as student or tutor)
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
# 	An 8 column table (sessionID, role, unit, time, comment, firstName, lastName, phone)
#		one row per session.
#		- role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
#		- firstName, lastName and phone belong to the other student.
DROP PROCEDURE IF EXISTS getOpenSessions;

DELIMITER $
CREATE PROCEDURE `getOpenSessions` (userID_ INT(8))
BEGIN
	(SELECT session.sessionID,
		'STUDENT' AS role,
		session.unit,
		session.time,
		session.comments,
		user.firstName,
		user.lastName,
		user.phone,
		IF(sessionStatus = 3, 1, 0) AS isCancelled
	FROM session
	JOIN user
		ON session.tutor = user.userID
	WHERE sessionStatus = 2
		AND (confirmationStatus = 0 OR confirmationStatus = 1)
		AND tutee = userID_)

	UNION

	(SELECT session.sessionID,
		'TUTOR' AS role,
		session.unit,
		session.time,
		session.comments,
		user.firstName,
		user.lastName,
		user.phone,
		IF(sessionStatus = 3, 1, 0) AS isCancelled
	FROM session
	JOIN user
		ON session.tutee = user.userID
	WHERE sessionStatus = 2
		AND (confirmationStatus = 0 OR confirmationStatus = 2)
		AND tutor = userID_);
END $
DELIMITER ;


# ---------
# getSessionTimes(studentID, tutorID)
# Gets list of upcoming session times for both student and tutor
# Used to check for timetable clashes
#
# Param:
#	studentID - student's student number (integer)
#	tutorID - tutor's student number (integer)
#
# Returns:
# 	An 3 column table (userID, role, time), one row per session.
#		- userID is either studentID or tutorID
#		- role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
DROP PROCEDURE IF EXISTS getSessionTimes;

DELIMITER $
CREATE PROCEDURE `getSessionTimes` (studentID_ INT(8), tutorID_ INT(8))
BEGIN
	SELECT studentID_ AS userID,
		'STUDENT' AS role,
		session.time
	FROM session
	WHERE(tutor = studentID_ OR tutee = studentID_) AND sessionStatus = 1

	UNION

	SELECT tutorID_ as userID,
		'tutor' AS role,
		session.time
	FROM session
	WHERE (tutor = tutorID_ OR tutee = tutorID_) AND sessionStatus = 1;
END $
DELIMITER ;


# ---------
# createRequest(studentID, tutorID, unitID, time, comments)
# Creates a session request
#
# Param:
#	studentID - student's student number (integer)
#	tutorID - tutor's student number (integer)
#	unitID - unit that will be tutored (string)
#	time - session start time (string, 'YYYY-MM-DD hh:mm:ss')
#	comments - additional information (string)
DROP PROCEDURE IF EXISTS createRequest;

DELIMITER $
CREATE PROCEDURE `createRequest` (studentID_ INT(8), tutorID_ INT(8), unitID_ CHAR(8), time_ TIMESTAMP, comments_ TEXT)
BEGIN
	INSERT INTO session
	SET tutee = studentID_,
		tutor = tutorID_,
		unit = unitID_,
		time = time_,
		comments = comments_,
		sessionStatus = 0,
		confirmationStatus = 0,
		hoursAwarded = 0;
END $
DELIMITER ;


# ---------
# getSession(sessionID)
# Returns session (request, appointment or openSession) details of session with the specified sessionID
#
# Param:
#	sessionID - a session id (integer)
#
# Returns:
#	A 7 column table (tutor, student, unit, time, comments, sessionStatus, confirmationStatus),
#		one row since session ids are unique
DROP PROCEDURE IF EXISTS getSession;

DELIMITER $
CREATE PROCEDURE `getSession` (sessionID_ INT(11))
BEGIN
	SELECT tutor,
		tutee AS student,
		unit,
		time,
		comments,
		sessionStatus,
		confirmationStatus
	FROM session
	WHERE sessionID = sessionID_;
END $
DELIMITER ;


# ---------
# acceptRequest(sessionID)
# Accepts a session request.  Changes request to appointment
#
# Param:
#	sessionID - a session id (integer)
DROP PROCEDURE IF EXISTS acceptRequest;

DELIMITER $
CREATE PROCEDURE `acceptRequest` (sessionID_ INT(11))
BEGIN
	UPDATE session
	SET sessionStatus = 1
	WHERE sessionID = sessionID_
		AND sessionStatus = 0;
END $
DELIMITER ;


# ---------
# rejectRequest(sessionID)
# Rejects a session request.
#
# Param:
#	sessionID - a session id (integer)
DROP PROCEDURE IF EXISTS rejectRequest;

DELIMITER $
CREATE PROCEDURE `rejectRequest` (sessionID_ INT(11))
BEGIN
	DELETE FROM session
	WHERE sessionID = sessionID_
		AND sessionStatus = 0;
END $
DELIMITER ;


# ---------
# cancelAppointment(sessionID)
# Cancels a session appointment.
#
# Param:
#	sessionID - a session id (integer)
DROP PROCEDURE IF EXISTS cancelAppointment;

DELIMITER $
CREATE PROCEDURE `cancelAppointment` (sessionID_ INT(11))
BEGIN
	UPDATE session
	SET sessionStatus = 3
	WHERE sessionID = sessionID_
		AND sessionStatus = 1;
END $
DELIMITER ;


# ---------
# closeSession(sessionID, userID)
# Closes off an open session by the supplied user.
#
# Param:
#	sessionID - a session id (integer)
#	userID - student number of user closing off on the session (integer) 
DROP PROCEDURE IF EXISTS closeSession;

DELIMITER $
CREATE PROCEDURE `closeSession` (sessionID_ INT(11), userID_ INT(8))
BEGIN

	DECLARE sessionStatus_ INT(1);
	DECLARE confirmationStatus_ INT(1);
	DECLARE tutor_ INT(8);
	DECLARE tutee_ INT(8);

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
	END;

	START TRANSACTION;

		SELECT sessionStatus, confirmationStatus, tutor, tutee
		INTO sessionStatus_, confirmationStatus_, tutor_, tutee_
		FROM session
		WHERE sessionID = sessionID_;

		IF tutee_ = userID_ AND (confirmationStatus_ = 0 OR confirmationStatus_ = 1) AND sessionStatus_ = 2
		THEN
			SET confirmationStatus_ = confirmationStatus_ + 2;
		END IF;

		IF tutor_ = userID_ AND (confirmationStatus_ = 0 OR confirmationStatus_ = 2) AND sessionStatus_ = 2
		THEN
			SET confirmationStatus_ = confirmationStatus_ + 1;
		END IF;

		UPDATE session
		SET confirmationStatus = confirmationStatus_
		WHERE sessionID = sessionID_;

	COMMIT;
END $
DELIMITER ;


# ---------
# appealSession(sessionID, userID, reason)
# Closes an open session by creating an appeal.
#
# Param:
#	sessionID - a session id (integer)
#	userID - student number of user making the appeal (integer)
#	reason - reason for making the appeal (string)
DROP PROCEDURE IF EXISTS appealSession;

DELIMITER $
CREATE PROCEDURE `appealSession` (sessionID_ INT(11), userID_ INT(8), reason_ TEXT)
BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
	END;

	START TRANSACTION;

		CALL closeSession(sessionID_, userID_);

		UPDATE session
		SET hoursAwarded = 0
		WHERE sessionID = sessionID_;

		INSERT INTO sessionComplaint
		SET sessionID = sessionID_,
			userID = userID_,
			reason = reason_;

	COMMIT;
END $
DELIMITER ;


# ---------
# confirmEmailVerified(userID)
# Updates database to show user has responded to authentication email.
#
# Param:
#	userID - user's student number (integer)
DROP PROCEDURE IF EXISTS confirmEmailVerified;

DELIMITER $
CREATE PROCEDURE `confirmEmailVerified` (userID_ INT(8))
BEGIN
	UPDATE user
	SET emailVerified = 1
	WHERE userID = userID_;
END $
DELIMITER ;


# ---------
# getResetPasswordHashAndSalt(userID)
# returns the reset password hash and salt for a given user
#
# Param:
#	userID - user's student number (integer)
#
# Returns:
#	A two column table (resetHash, resetSalt) with one row if user exists, zero rows if user doesn't exist
DROP PROCEDURE IF EXISTS getResetPasswordHashAndSalt;

DELIMITER $
CREATE PROCEDURE `getResetPasswordHashAndSalt` (userID_ INT(8))
BEGIN
	SELECT resetPasswordHash AS `resetHash`,
		   resetPasswordSalt AS `resetSalt`
	FROM user
	WHERE userID = userID_;
END $
DELIMITER ;
