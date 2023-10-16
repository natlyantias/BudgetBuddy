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
    $email = $_POST['email'];

    // Hash the password with bcrypt
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Register user data
    $sql = "INSERT INTO users (username, email, password_hash) VALUES ('$user', '$email', '$hashed_password')";

    $result = $conn->query($sql);

    if ($result === TRUE) {
        echo "Account created successfully. Redirecting...";
        echo "If you are not redirected, <a href=loginindex.php>click here</a>.";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    // Close the connection when done
    $conn->close();

    // echo "You entered: $user";
    // echo "You entered: $email";

    header("Location: loginindex.php");
    exit()

    ?>
</body>

</html>