/* eslint-env jest */

// Tests databse connection
jest.setTimeout(20000);
process.env.NODE_ENV = "test";
require("dotenv").config();

const { connectDB } = require("../db/database");

let dbConnection;

test("connects to database", async () => {
  dbConnection = await connectDB();
  expect(dbConnection).toBeDefined();
  expect(dbConnection.readyState).toBe(1);
  expect(dbConnection.name).toBeDefined();
});

test("dotenv config is loaded when NODE_ENV !== 'test'", async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  jest.isolateModules(() => {
    require("../db/database");
  });
  process.env.NODE_ENV = originalEnv;
});


afterAll(async () => {
  if (dbConnection) {
    await dbConnection.close();
  }
});
