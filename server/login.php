<?php
 
  if($_SERVER["REQUEST_METHOD"] == "POST") {		
	$username = "sql6148835";
	$password = "AF11rNK2Jc";
	$hostname = "sql6.freesqldatabase.com"; //will be IP name for website

	$dbhandle = mysql_connect($hostname, $username, $password) or die("Could not connect to database");

	$selected = mysql_select_db("sql6148835", $dbhandle);

	$myusername = $_POST['user'];
	$mypassword = $_POST['pass'];

	$myusername = stripslashes($myusername);
	$mypassword = stripslashes($mypassword);

	$query = "SELECT * FROM tutee WHERE StudentID='$myusername' and Password='$mypassword'";
	$result = mysql_query($query);
	$count = mysql_num_rows($result);

	mysql_close(); //closes connection to db

	if($count==1) {
		$seconds = 0;
		setcookie(loggedin, date("F jS - g:i a"), $seconds);
		header("location:login_success.php"); //loads success page
	}else {
		header("location:login.php");
	}
}
?>


<html lang="en">
<head>
  <title>Login</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/style.css">
  <script src="js/jquery-3.1.1.min.js"></script>
  <script src="js/bootstrap.min.js"></script>

</head>
<body>

<?php include_once "navbar.php";?>

<div class="container">
<div class="row">

<div class="col-sm-4">
  <div id="login-form">
    <div>
    <br> 
  </div>

  <h1>Login</h1>
  
  <form action="login.php" method="POST">
    <div class="form-group">
      <label for="text">Student Number:</label>
      <input type="text" class="form-control" name="user" required>
    </div>
    <div class="form-group">
      <label for="pwd">Password:</label>
      <input type="password" class="form-control" name="pass" required>
    </div>
    <div class="checkbox">
      <label><input type="checkbox"> Remember me</label>
    </div>
    <button type="submit" class="btn btn-default">Submit</button>
  </form>

</div>
</div>
</div>
</div>
</div>

<?php include_once "footer.php";?>


</body>
</html>
