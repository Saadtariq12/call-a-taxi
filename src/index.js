import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import db_connect from "./database/db_connect.js";
import { app } from "./app.js";
import { http } from "./server.js";
// const express = require("express");
db_connect()
  .then(() => {
    http.listen(process.env.PORT || 3000, () => {
      console.log(`example app listening on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
