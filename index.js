const express = require("express");
const cors = require("cors");
const User = require("./db/User");
const Product = require("./db/Product");
require("./db/config");

const app = express();

const Jwt = require("jsonwebtoken");
const jwtKey = "Kamal-api";

app.use(express.json());
app.use(cors());

//registraton API
app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: "5h" }, (error, token) => {
    if (error) {
      resp.send({
        result: "SOmething is wrong during generaton of Jwt token",
      });
    } else {
      resp.send({ result, auth: token });
    }
  });
});

//LOGIN API
app.post("/login", async (req, resp) => {
  console.log(req.body);
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "5h" }, (error, token) => {
        if (error) {
          resp.send({
            result: "Something is wrong during generaton of Jwt token",
          });
        } else {
          resp.send({ user, auth: token });
        }
      });
    } else {
      resp.send({ result: "this user does not  exist" });
    }
  } else {
    resp.send({ result: " you have not provided either email id or password" });
  }
});

// ADD PRODUCT  API

app.post("/add-product", verifyToken, async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});

app.use('/test', (req, res) => {
  res.send({ name: "Kamal", age: 21 })
})

//PRODUCT LIST FIND APIs    Route bnayenege api k liye
app.get("/products", verifyToken, async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ key: "No Products found  there is no any product first add " });
  }
});


app.delete("/product/:id", verifyToken, async (req, resp) => {
  // resp.send(req.params.id)
  const result = await Product.deleteOne({ _id: req.params.id });

  resp.send(result);
});

//UPDATED  we are going to update a data

app.get("/product/:id", verifyToken, async (req, resp) => {
  let result = await Product.findOne({ _id: req.params.id }); //Object bana k
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "No Record Found" });
  }
});

//PUT ---- UPDATE   API   put k andar pahlaparameter route hota hai

app.put("/product/:id", verifyToken, async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  resp.send(result);
});


// GOING FOR SEARCHING   search wali api
app.get("/search/:key", verifyToken, async (req, resp) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

//Middleware
function verifyToken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: "Please provide a valid token" });
      } else {
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "Please add token with header" });
  }
}

app.listen(5000);
