const mongoose = require("mongoose");
const User = require("../models/users");
const bycrpt = require("bcrypt");
const jwt = require("jsonwebtoken");

const connUri = process.env.MONGO_LOCAL_CONN_URL;

console.log(connUri);
module.exports = {
  add: async (req, res) => {
    try {
      await mongoose.connect(connUri, { useNewUrlParser: true })
      let result = {};
      let status = 201;

      const { name, password } = req.body;
      const user = new User();
      user.name = name;
      user.password = password;

      try {
        await user.save()
        result.status = status;
        result.result = user;
      } catch (err) {
        status = 500;
        result.status = status;
        result.error = err;
      }
      res.status(status).send(result);
    } catch (err) {
      status = 500;
      result.status = status;
      result.error = err;
      res.status(status).send(result);
    }
  },

  login: async (req, res) => {
    const { name, password } = req.body;

    try {
      await mongoose.connect(connUri, { useNewUrlParser: true });
      let result = {};
      let status = 200;

      try {
        const user = await User.findOne({ name })
        // We could compare passwords in our model instead of below
        try {
          const match = await bycrpt.compare(password, user.password)
          if (match) {
            status = 200;
            // Create a token
            const payload = { user: user.name };
            const options = { expiresIn: "2d", issuer: "barfly" }
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secret, options);

            console.log("TOKEN", token);
            result.token = token;
            result.status = status;
            result.result = user;
          } else {
            status = 401;
            result.status = status;
            result.error = "Authentication error";
          }
          res.status(status).send(result);
        } catch (err) {
          status = 500;
          result.status = status;
          result.error = err;
          res.status(status).send(result);
        };
      } catch (err) {
        status = 404;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      }
    } catch (err) {
      status = 500;
      result.status = status;
      result.error = err;
      res.status(status).send(result);
    }
  },

  getAll: async (req, res) => {
    try {
      await mongoose.connect(connUri, { useNewUrlParser: true })
      let result = {};
      let status = 200;

      const payload = req.decoded;
      // TODO: Log the payload here to verify that it's the same payload
      //  we used when created the token
      if (payload && payload.user === "Admin") {
        try {
          const users = await User.find({});
          result.status = status;
          result.result = users;
        } catch (err) {
          status = 500;
          result.status = status;
          result.error = err;
        }
        res.status(status).send(result);
      } else {
        status = 401;
        result.status = status;
        result.error = "Authentication error";
        res.status(status).send(result);
      }
    } catch (err) {
      status = 500;
      result.status = status;
      result.error = err;
      res.status(status).send(result);
    }
  }
}