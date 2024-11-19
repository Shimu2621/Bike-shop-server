const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')

const app = express()
const port = 5000

const bcrypt = require('bcrypt');
const saltRounds = 10;

// Middleware
app.use(cors())
app.use(express.json());


const uri = "mongodb+srv://bike-shop-server:AXpikQBwtnr7vREv@cluster0.8wzqzge.mongodb.net/bikeShopDB?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

     // Access the 'user' collection from the default database
    const userCollection = client.db().collection("user")

    // Signup route
    app.post("/signup", async(req, res) => {
     const {fullName, imageUrl, email, password} = req.body;
    //  console.log(newUser);

     // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds)
       // Create a new user object with the hashed password
    const newUser = {
      fullName, 
      imageUrl,
      email,
      password: hashedPassword // Store the hashed password
    }
     const result = await userCollection.insertOne(newUser)
     res.send({
      data: result,
      status: 200,
      message: "User created successfully"
     })
    })

    // Signin route
    app.post("/signin", async(req, res) => {  
      const { email, password } = req.body
      const user = await userCollection.findOne({email: email})
      if(!user){
        return res.status(404).send({status: 404, message: "User not found"})
      }
      const isPasswordMatched = await bcrypt.compare(password, user.password)
      if(isPasswordMatched){
        res.send({
          data: user,
          status: 200,
          message: "User signin successfully"
         })
      }else{
        res.status(404).send({status: 404, message: "Invalid credential"})
      }
    } )

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World! Good morning')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// bike-shop-server
// fWpD3Lg2X5QCdlOz
// database name: bikeShopDB