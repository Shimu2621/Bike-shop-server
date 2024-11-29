const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 5000;

const bcrypt = require("bcrypt");
const saltRounds = 10;

// Middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://bike-shop-server:AXpikQBwtnr7vREv@cluster0.8wzqzge.mongodb.net/bikeShopDB?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Access the 'user' collection from the default database

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const userCollection = client.db().collection("user");
// 'products' collection from the default database
const productCollection = client.db().collection("products");
// 'Orders' collection from the default database
const orderCollection = client.db().collection("orders");
// 'Services' collection from the default database
const serviceCollection = client.db().collection("services");

// AUTHENTICATION SECTION
// Signup route
app.post("/signup", async (req, res) => {
  const { fullName, imageUrl, email, password, role } = req.body;
  //  console.log(newUser);

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Create a new user object with the hashed password
  const newUser = {
    fullName,
    imageUrl,
    email,
    password: hashedPassword, // Store the hashed password
    role,
  };
  const result = await userCollection.insertOne(newUser);
  res.send({
    data: result,
    status: 200,
    message: "User created successfully",
  });
});

// Signin route
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await userCollection.findOne({ email: email });
  if (!user) {
    return res.status(404).send({ status: 404, message: "User not found" });
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  console.log(isPasswordMatched);
  console.log(user);
  if (isPasswordMatched) {
    res.send({
      data: user,
      status: 200,
      message: "User signin successfully",
    });
  } else {
    res.status(404).send({ status: 404, message: "Invalid credential" });
  }
});
//AUTHENTICATION END

// PRODUCT SECTION START
// create-product
app.post("/create-product", async (req, res) => {
  const { name, thumbnail, price, ratingCount, category, featured } = req.body;
  const newProduct = {
    name,
    thumbnail,
    price,
    ratingCount,
    category,
    featured,
  };
  const result = await productCollection.insertOne(newProduct);
  res.send({
    data: result,
    status: 200,
    message: "Product created successfully",
  });
});
// Find all-product
app.get("/products", async (req, res) => {
  const result = await productCollection.find({}).toArray();
  res.send({
    data: result,
    status: 200,
    message: "Retrieve all products successfully",
  });
});

// Find a product
app.get("/products/:id", async (req, res) => {
  // const objectId = req.body;
  // console.log(objectId.id);
  const { id } = req.params;
  // console.log(id);

  const result = await productCollection.findOne({ _id: new ObjectId(id) });
  res.send({
    data: result,
    status: 200,
    message: "Product retrieve successfully",
  });
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  const result = await productCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.send({
    data: result,
    status: 200,
    message: "Product deleted successfully",
  });
});

// update product(put: all field change & patch: one field change)
app.put("/update-product/:id", async (req, res) => {
  const { id } = req.params;
  const filter = { _id: new ObjectId(id) };
  const updatedProduct = req.body; // Assuming the updated data is sent in the request body
  const updatedDocument = {
    $set: {
      name: updatedProduct.name,
      thumbnail: updatedProduct.thumbnail,
      price: updatedProduct.price,
      ratingCount: updatedProduct.ratingCount,
      category: updatedProduct.category,
      featured: updatedProduct.featured,
    },
  };
  const result = await productCollection.updateOne(filter, updatedDocument);
  res.send({
    data: result,
    status: 200,
    message: "Product updated successfully",
  });
});
// PRODUCT SECTION END

// Cart SECTION SRART
// Order product to cart
app.post("/create-order", async (req, res) => {
  const { productId, name, thumbnail, price, ratingCount, category, email } =
    req.body;
  const newOrder = {
    productId,
    name,
    thumbnail,
    price,
    ratingCount,
    category,
    email,
  };
  console.log(newOrder);

  const result = await orderCollection.insertOne(newOrder);
  res.send({
    data: result,
    status: 200,
    message: "Order product successfully to cart",
  });
});

// // Order service to cart
// app.post("/order-service", async (req, res) => {
//   const { productId, title, image, price, description, email } = req.body;
//   const newOrder = {
//     productId,
//     title,
//     image,
//     price,
//     description,
//     email,
//   };

//   const result = await orderCollection.insertOne(newOrder);
//   res.send({
//     data: result,
//     status: 200,
//     message: "Order seervice successfully to cart",
//   });
// });

// Cart items-retreive by user email
app.get("/order-list", async (req, res) => {
  const { email } = req.query;
  console.log(email);
  const result = await orderCollection.find({ email: email }).toArray();
  res.send({
    data: result,
    status: 200,
    message: "Order-list created successfully",
  });
});

// Cart items delete by user email
// Delete product
app.delete("/order-list/:productId", async (req, res) => {
  const { productId } = req.params;
  // console.log(id);

  const result = await orderCollection.deleteOne({
    _id: new ObjectId(productId),
  });
  res.send({
    data: result,
    status: 200,
    message: "Product deleted from cart successfully",
  });
});

//SERVICE SECTION
// Create Services
app.post("/create-service", async (req, res) => {
  const { image, title, description, price } = req.body;
  const newService = {
    image,
    title,
    description,
    price,
  };
  const result = await serviceCollection.insertOne(newService);
  res.send({
    data: result,
    status: 200,
    message: "Service created successfully",
  });
});
// Get all services
app.get("/services", async (req, res) => {
  const result = await serviceCollection.find().toArray();
  res.send({
    data: result,
    status: 200,
    message: "Retrieve all Services successfully",
  });
});
//Get single services
app.get("/services/:id", async (req, res) => {
  const { id } = req.params;
  const result = await serviceCollection.findOne({ _id: new ObjectId(id) });
  res.send({
    data: result,
    status: 200,
    message: "Service retreived successfully",
  });
});
// Update services
app.put("/update-service/:id", async (req, res) => {
  const { id } = req.params;
  const filter = { _id: new ObjectId(id) };
  const updatedService = req.body;

  const updatedDocument = {
    $set: {
      image: updatedService.image,
      title: updatedService.title,
      description: updatedService.description,
      price: updatedService.price,
    },
  };

  const result = await serviceCollection.updateOne(filter, updatedDocument);
  res.send({
    data: result,
    status: 200,
    message: "Service Updated successfully",
  });
});
// Delete a services
app.delete("/services/:id", async (req, res) => {
  const { id } = req.params;

  const result = await serviceCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.send({
    data: result,
    status: 200,
    message: "Services Deleted successfully",
  });
});

app.get("/", (req, res) => {
  res.send("Hello World! Good morning");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// bike-shop-server
// fWpD3Lg2X5QCdlOz
// database name: bikeShopDB
// database name: bikeShopDB
// database name: bikeShopDB
// database name: bikeShopDB
// database name: bikeShopDB
