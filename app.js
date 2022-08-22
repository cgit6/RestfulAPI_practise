const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/user");
const methodOverride = require("method-override");
const { findOneAndUpdate } = require("./models/user");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));


mongoose
  .connect("mongodb://localhost:27017/tryDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((d) => {
    console.log("connection successfully");
  })
  .catch((e) => {
    console.log("connection failed");
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("This is home page");
});

app.get("/user", async (req, res) => {
  try {
    let data = await User.find({});
    res.send( { data });
  } catch {
    res.send({ message : "Error with finding user" });
  }
});

// app.get("/user/signup", (req, res) => {
//   res.render("signup.ejs");
// });

app.post("/user/signup", (req, res) => {
  let { id, username, password, email } = req.body;

  let newUser = new User({ id, username, password, email });
  newUser
    .save()
    .then(() => {
      res.send(newUser);
    })
    .catch((e) => {
      res.status(404);
      res.send(e);
    });
});

// user page
app.get("/user/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await User.findOne({ id });

    if (data !== null) {
      res.send(data);
    } else {
      res.status(404);
      res.send({message : "Not found userinfo id"});
    }
  } catch (e) {
    res.send({ message : "Not found data check dbs is connecting"});
    console.log(e);
  }
});

// update
app.get("/user/edit/:id" , async (req,res) => {
  let { id } = req.params;
  try {
    let data = await User.findOne({ id });
    console.log(data);
    if (data !== null) {
      res.render("edit.ejs" , { data });
    } else {
      res.send("Cannot find student");
    }
  }
  catch(e) {
    res.send("update get Error");
    console.log(e);
  }
});

app.put("/user/edit/:id" ,async (req,res) => {
  let { id, username, password, email } = req.body;
  try {
    // findOneAndUpdate return query 
    let d = await User.findOneAndUpdate(
      {id},
      {id,username,password,email},
      {
        new:true,
        runValidators: true,
      }
    );
      res.send({message: "Successfully PUT the data"});
  } catch(e) {
    res.status(404);
    res.send({message: "update put failed" });
    console.log(e);
  }
} )

// patch page

class newData {
  constructor() {}
  setProperty(key,value) {
    // 如果key 不是 mail 且 key 不是 password
      this[key] = value;
    } 
  }


app.patch("user/:id" , async (req,res) => {
  let { id } = req.params;
  let newObject = new newData();

  for ( let property in req.body ) {
    newObject.setProperty(property, req.body[property]);
  }
  console.log(newObject);
  try { 
    let d = await User.findOneAndUpdate( {id}, newObject, {
      new: true,
      runValidators: true,
    });
      console.log(d);
      res.send({message: "Successfully PATCH the data"});
  } catch (e) {
    res.status(404);
    res.send({message: "update put failed"})
    console.log(e);
  }
}) 

// 這個寫法需要透過postman來完成刪除
// delete data page
app.delete("/user/delete/:id" , (req,res) => {
  let { id } = req.params;
  User.deleteOne({ id })
  .then((meg) => {
    res.send("data has been delete");
    console.log(meg);
  })
  .catch((e) => {
    res.send("delete error happened");
    console.log(e)
  });

});

// error headling
app.get("/*", (req, res) => {
  res.status(404);
  res.send("404 not found");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
