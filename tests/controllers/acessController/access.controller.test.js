const mongoose = require("mongoose");
const supertest = require("supertest");
const { UserRepository } = require("../../../src/db/repository");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../src/app");

//mock send mail function
jest.mock("../../../src/utils/mailSender.js", () => {
  return jest.fn(
    (mailOptions) => (global.RESET_LINK = mailOptions.text.split("/").pop())
  );
});

const user = {
  email: "mansouri@rayen.com",
  password: "pass1",
  name: "doubleA",
};

beforeAll(async () => {
  //if mongoose is connected close connection to remote DB
  if (mongoose.connection.readyState === 0) await mongoose.disconnect();
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await UserRepository.create(user);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe("Test Login", () => {
  const server = supertest(app);
  it("should send error when empty body is only sent", async () => {
    const emptyBody = {};
    const response = await server.post("/v1/login").send(emptyBody);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatch("account does not exist");
  });

  it("should send error when sending wrong email", async () => {
    const nonuser = {
      email: "john@service.domain",
    };
    const response = await server.post("/v1/login").send(nonuser);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatch("account does not exist");
  });
  it("should send error when password is incorrect ", async () => {
    const userWithWrongPass = {
      ...user,
      password: "",
    };
    const response = await server.post("/v1/login").send(userWithWrongPass);
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toMatch("invalid password or email");
  });

  it("should login", async () => {
    const response = await server.post("/v1/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
    expect(response.body).toHaveProperty("refresh_token");
    global.REFRESH_TOKEN = response.body.refresh_token;
    global.ACCESS_TOKEN = response.body.access_token;
  });
});

describe("test forgot password", () => {
  const server = supertest(app);
  it("should send an error when account does not exist", async () => {
    const nonuser = {
      email: "bla@bla.com",
    };
    const response = await server
      .post("/v1/login/forgot_password")
      .send(nonuser);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Account does not exist");
  });
  it("should send an reset link", async () => {
    const response = await server.post("/v1/login/forgot_password").send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe(
      "password reset link were sent check your mail"
    );
  });
});

describe("test refresh token", () => {
  const server = supertest(app);
  it("should send an access token", async () => {
    const token = {
      token: global.REFRESH_TOKEN,
    };
    const response = await server.post("/v1/login/token").send(token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
  });
  it("should throw error when send bad token", async () => {
    const token = {
      token: "nothing",
    };
    const response = await server.post("/v1/login/token").send(token);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("bad token");
  });

  it("should throw an error when send non existing token", async () => {
    const token = {
      token: global.ACCESS_TOKEN,
    };
    const response = await server.post("/v1/login/token").send(token);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("token not found");
  });
});

describe("test reset password", () => {
  const server = supertest(app);
  it("should set new password", async () => {
    const newPassword = {
      password: "pass1",
    };

    const response = await server
      .post("/v1/login/" + global.RESET_LINK)
      .send(newPassword);
    expect(response.status).toBe(200);
  });

  it("should send an error when reset link expired", async () => {
    const newPassword = {
      password: "pass1",
    };

    const response = await server
      .post("/v1/login/" + RESET_LINK)
      .send(newPassword);
    expect(response.status).toBe(404);
  });
  it("should send an error when reset link is wrong", async () => {
    const newPassword = {
      password: "pass1",
    };
    const response = await server
      .post("/v1/login/" + "blablabla")
      .send(newPassword);
    expect(response.status).toBe(404);
  });
});
