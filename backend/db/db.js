const neo4j = require("neo4j-driver");
const dotenv = require("dotenv");
dotenv.config();

const neo4jConfig = {
  uri: process.env.NEO4J_URI || "bolt://localhost",
  user: process.env.NEO4J_USER || "neo4j",
  password: process.env.NEO4J_PASSWORD || "password",
};

const driver = neo4j.driver(neo4jConfig.uri, neo4j.auth.basic(neo4jConfig.user, neo4jConfig.password));

const getNeo4jDriver = () => driver;

module.exports = driver;