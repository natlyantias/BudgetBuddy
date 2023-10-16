<!DOCTYPE html>
<html>
<head>    
<title>Redirecting...</title>
</head>
<body>
<?php
$servername = "localhost"; // Change to your MySQL server address if necessary
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "test"; // Your MySQL database name

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $user = $_POST['username'];
    $password = $_POST['password'];

    // Verify the password with bcyrpt
    $sql = "SELECT password_hash FROM users WHERE username='$user'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $hashed_password = $row['password_hash'];
        

        // Verify the entered password against the hashed password
        if (password_verify($password, $hashed_password)) {
            echo "Login successful";
            // Proceed with authenticated user actions
            header("Location: budgetsindex.php");
            exit();
        } else {
            echo $invalid;
            header("Location: loginindex.php?status=unauthorized");
            exit();
        }
    } else {
        header("Location: loginindex.php?status=unauthorized");
        exit();
    }

        // Close the connection when done
        $conn->close();

?>
</body>
</html>