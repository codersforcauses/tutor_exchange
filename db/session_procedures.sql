use tutorexchange;

# ---------
# getRequests(userID)
# Gets list of session requests for a given user (as student or tutor)
#
# Param:
#   userID - user's student number (integer)
#
# Returns:
#   An 8 column table (sessionID, role, unit, time, comment, firstName, lastName, phone)
#       one row per session.
#       - role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
#       - firstName, lastName and phone belong to the other student.
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
#   userID - user's student number (integer)
#
# Returns:
#   A 9 column table (sessionID, role, unit, time, comment, firstName, lastName, phone, isCancelled)
#       one row per session.
#       - role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
#       - firstName, lastName and phone belong to the other student.
#       - isCancelled is 1 if appointment has been cancelled and 0 otherwise.
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
#   userID - user's student number (integer)
#
# Returns:
#   An 8 column table (sessionID, role, unit, time, comment, firstName, lastName, phone)
#       one row per session.
#       - role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
#       - firstName, lastName and phone belong to the other student.
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
#   studentID - student's student number (integer)
#   tutorID - tutor's student number (integer)
#
# Returns:
#   An 3 column table (userID, role, time), one row per session.
#       - userID is either studentID or tutorID
#       - role is either 'STUDENT' or 'TUTOR', depending on user's role in that session.
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
#   studentID - student's student number (integer)
#   tutorID - tutor's student number (integer)
#   unitID - unit that will be tutored (string)
#   time - session start time (string, 'YYYY-MM-DD hh:mm:ss')
#   comments - additional information (string)
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
#   sessionID - a session id (integer)
#
# Returns:
#   A 7 column table (tutor, student, unit, time, comments, sessionStatus, confirmationStatus),
#       one row since session ids are unique
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
#   sessionID - a session id (integer)
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
#   sessionID - a session id (integer)
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
#   sessionID - a session id (integer)
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
#   sessionID - a session id (integer)
#   userID - student number of user closing off on the session (integer) 
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
#   sessionID - a session id (integer)
#   userID - student number of user making the appeal (integer)
#   reason - reason for making the appeal (string)
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
