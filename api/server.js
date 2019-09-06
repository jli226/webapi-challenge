const express = require("express");
const actionsRouter = require("./actionsRouter");
const projectsRouter = require("./projectsRouter");

const server = express();

// global middleware
server.use(express.json());

// router
server.use("/api/projects", projectsRouter, actionsRouter);

server.get("/", (req, res) => {
  res.send("Server is up and running!");
});

module.exports = server;
