<?php

  if($_SERVER["REQUEST_METHOD"] == "POST") {
	$username = "root";
	$password = "Hook5397hook";
	$hostname = "localhost"; //will be IP name for website
  $dbname = "mydb";

//	$dbhandle = mysql_connect($hostname, $username, $password) or die("Could not connect to database");

//	$selected = mysql_select_db("mydb", $dbhandle);
  $conn = new mysqli($hostname, $username, $password, $dbname);


  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 


	  $user = $_POST['user'];
	  $pass = $_POST['pass'];
//  $checkbox = $_POST['checkbox'];
//	  $units = $_POST['units'];
    $postcode = $_POST['postcode'];  
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $DOB = $_POST['DOB'];  
  
    $sql = "INSERT INTO tutee (StudentID, FirstName, LastName, DOB, Password) VALUES ('$user', '$firstname', '$lastname', '$DOB', '$pass')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

 // } 
 // mysql_close();
    $conn->close();
}
  
?>



<html>
  <title>Apply</title>
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

  <h1>Apply</h1>
 
  <form action="apply.php" method="POST">
  
  <div class="form-group">
      <label for="text">Student Number:</label>
      <input type="text" class="form-control" name="user" required>
    </div>

      <div class="form-group">
      <label for="text">First Name:</label>
      <input type="text" class="form-control" name="firstname" required>
    </div>

      <div class="form-group">
      <label for="text">Last Name:</label>
      <input type="text" class="form-control" name="lastname" required>
    </div>

      <div class="form-group">
      <label for="text">Date of Birth:</label>
      <input type="text" class="form-control" name="DOB" required>
    </div>

  <div class="form-group">
  	  <label for="inputPassword" class="control-label">Password:</label>
  
  <div class="form-group">
        <input type="password" data-minlength="6" class="form-control" id="inputPassword" placeholder="Password" name="pass" required>
        <div class="help-block">Minimum of 6 characters</div>
   </div>

  <div class="form-group">
    	<input type="password" class="form-control" id="inputPasswordConfirm" data-match="#inputPassword" data-match-error="Whoops, these don't match" placeholder="Confirm Password" required>
     	<div class="help-block with-errors"></div>
      </div>
    </div>

    <div class="checkbox">
      <label><input type="checkbox" name="checkbox"> Apply as a Tutor</label>
  </div>

  <div class="form-group">
      <label for="text">Units:</label>
      <input type="text" class="form-control" name="units">
    </div>

  <div class="form-group">
      <label for="text">Postcode:</label>
      <input type="text" class="form-control" name="postcode">
  </div>
    
  <button type="submit" class="btn btn-default">Apply</button>
  
  </form>

</div>
</div>
</div>
</div>
</div>

</body>
</form>

</div>
</div>
</div>
</div>

<?php include_once "footer.php";?>

</body>
</html>
