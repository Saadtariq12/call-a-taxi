import db_connect from "./database/db_connect.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import { http } from "./server.js";
// const express = require("express");
dotenv.config({
  path: "./.env",
});
db_connect()
  .then(() => {
    http.listen(process.env.PORT || 8000, () => {
      console.log(`example app listening on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
