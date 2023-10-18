# BudgetBuddy.github.io
BudgetBuddy

Requries Node.js v18.18.2 LTS. https://nodejs.org/dist/v18.18.2/node-v18.18.2-x64.msi

BudgetBuddy requires a connection string from a running MongoDB cloud instance.
Because this string supplies a password, it should be stored as an environment variable for better security.
This string should be added as MONGO_CONNECT in your user environment variables.

Run 'node app.js' to start the web server.

Run the included 'install_packages.bat' or instead use 'npm ci' to update required packages.
