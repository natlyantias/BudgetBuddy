
const mysql = require('mysql2/promise');

async function loadTransactions(jfile, un) {
    try {
        const data = jfile;
        const connection = require("./db");
        const username = un;
        console.log(username);
        // Iterate over each account in the JSON data
        for (const account of data.accounts) {
            // Extract data
            const accountId = account.account_id; // Assuming account_id is provided in your JSON data
            const userId = username;
            const accountName = account.name;
            const accountBalance = account.balances.available;
            const accountType = account.subtype; // Assuming subtype is the account type
        
            // Insert into database
            const query = `
                INSERT ignore INTO accounts (account_id, user_id, account_name, account_balance, account_type)
                VALUES (?, ?, ?, ?, ?);`;
        
            await connection.execute(query, [accountId, userId, accountName, accountBalance, accountType]);
        }
        for (const transaction of data.transactions) {
            // Extract data
            const userId = username; // You might have a way to link transactions to users
            const amount = -1*(transaction.amount);
            const transactionDate = transaction.authorized_date;
            const category = transaction.category[0];
            const description = transaction.name; // Using 'name' as the description
        
            // Insert into database
            const query = `
                INSERT ignore INTO transactions (user_id, amount, transaction_date, category, description)
                VALUES (?, ?, ?, ?, ?);`;
        
            await connection.execute(query, [userId, amount, transactionDate, category, description]);
        }
        

        console.log('Data inserted successfully');
        
    } catch (error) {
        console.error('Error:', error);
    }
    }
module.exports = loadTransactions;