<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Budget Buddy</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
        }

        header {
            background-color: #333;
            color: #fff;
            padding: 1rem;
            text-align: center;
        }

        header h1 {
            font-size: 2rem;
            margin: 0;
        }

        main {
            max-width: 400px;
            margin: 2rem auto;
            padding: 2rem;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            text-align: center;
        }

        .login-form {
            text-align: center;
        }

        label {
            font-size: 1.2rem;
            margin-top: 1rem;
            display: block;
            text-align: left;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-top: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 1rem;
        }

        button[type="submit"] {
            display: block;
            margin: 2rem auto;
            background-color: #007bff;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
        }

        button[type="submit"]:hover {
            background-color: #0056b3;
        }

        p {
            text-align: center;
            margin-top: 1rem;
        }

        a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }

        a:hover {
            text-decoration: underline;
        }

        footer {
            text-align: center;
            padding: 1rem;
            background-color: #333;
            color: #fff;
        }
    </style>
</head>

<body>
    <script>
        // Get the current URL without parameters
        var cleanURL = window.location.protocol + "//" + window.location.host + window.location.pathname;

        // Use replaceState to update the URL without parameters
        history.replaceState({}, document.title, cleanURL);
    </script>
    <header>
        <nav>
            <ul>
                <li><a href="index.php">Home</a></li>

            </ul>
        </nav>
        <h1>Budget Buddy</h1>
    </header>


    <main>
        <section class="login-form">
            <h2>Login to Your Budget Buddy Account</h2>
            <div class="message">
                <?php
                if (isset($_GET['status'])) {
                    $error = $_GET['status'];
                    if ($error === 'unauthorized') {
                        echo "Invalid username or password";
                    } else {
                        echo "ERROR: " . $error;
                    }
                }
                ?>
            </div>
            <form action="login_script.php" method="post">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>

                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>

                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="createaccountindex.php">Sign up here</a></p>
        </section>
    </main>

    <footer>
        <p>&copy; 2023 Budget Buddy. All rights reserved.</p>
    </footer>
</body>

</html>