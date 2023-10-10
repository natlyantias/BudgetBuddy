<!DOCTYPE html>
<html>

<head>
    <title>test.php</title>
</head>

<body>
<!--#echo var="DATE_LOCAL" -->
    <p>Begin SQL query</p>
    <br>
    <!-- begin php code (this comment should be obfuscated in a real production environment) -->
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

    $sql = "SELECT * FROM users";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo "Username: " . $row["username"] . " - E-mail: " . $row["email"] . "<br>";
        }
    } else {
        echo "0 results";
    }

    // Close the connection when done
    $conn->close();

    ?>
    <!-- end php code -->
    <br>
    <p>End SQL query</p>
</body>

</html>
