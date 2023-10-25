const { MongoClient } = require("mongodb");

// The following statement will check for an environment variable called MONGO_CONNECT, which
//   should be the connection string found in your mongodb instance
// This is to safely handle passwords
const uri = process.env.MONGO_CONNECT;

const client = new MongoClient(uri);


// assure that the database can be connected to
async function db_connect() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db();
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
}

// database operations
async function db_login(username) {
  const db = await db_connect();
  const users = db.collection("users");
  return await users.findOne({ username });
}

// exports
module.exports = {
  connectToDB: db_connect,
  getUser: db_login,

};

// Reference: The quick start guide on mongoDB
// 
// async function db_test() {
//   try {
//     const database = client.db('sample_mflix');
//     const movies = database.collection('movies');

//     // Query for a movie that has the title 'Back to the Future'
//     const query = { title: 'Back to the Future' };
//     const movie = await movies.findOne(query);

//     console.log(movie);
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// db_test().catch(console.dir);
