const request = require("supertest");
const expect = require("chai").expect;

let REFRESH_TOKEN;
let ACCESS_TOKEN;
describe("Test Login",() => {
    it("should send error when empty body is only sent",async () => {
        const server = await request("http://localhost:3000");
        const emptyBody = {};
        const response = await server.post("/v1/login").send(emptyBody);
        expect(response.status).equal(404);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("account does not exist");
    });

    it("should send error when email is only sent",async () => {
        const server = await request("http://localhost:3000");
        const nonExistingUser = {
            email:"john@service.domain",
        }
        const response = await server
                               .post("/v1/login")
                               .send(nonExistingUser);
        expect(response.status).equal(404);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("account does not exist");
    });
    
    it("should send error when password is only sent",async () => {
        const server = await request("http://localhost:3000");
        const nonExistingUser = {
            password:"pass123"
        }
        const response = await server
                               .post("/v1/login")
                               .send(nonExistingUser);
        expect(response.status).equal(404);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("account does not exist");
    });
    it("should login",async () => {
        const server = await request("http://localhost:3000");
        const nonExistingUser = {
            email:"mansourirayen1002@gmail.com",
            password:"user1user1"

        }
        const response = await server
                               .post("/v1/login")
                               .send(nonExistingUser);
        expect(response.status).equal(200);
        expect(response.body).to.have.property("access_token");
        expect(response.body).to.have.property("refresh_token");
        REFRESH_TOKEN = response.body.refresh_token;
        ACCESS_TOKEN = response.body.access_token;
    });
})
describe("test forgot password",() => {
    it("should send an error whent account",async () => {
        const server = await request("http://localhost:3000");
        const nonExistingUser = {
            email:"john@service.domain",
        }
        const response = await server
                               .post("/v1/login/forgot_password")
                               .send(nonExistingUser);
        expect(response.status).equal(404);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("Account does not exist");
    })
    it("should send an reset link",async () => {
        const server = await request("http://localhost:3000");
        const nonExistingUser = {
            email:"mansourirayen1002@gmail.com",
        }
        const response = await server
                               .post("/v1/login/forgot_password")
                               .send(nonExistingUser);
        expect(response.status).equal(200);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("password reset link were sent check your mail");
    })
})

describe("test refresh token",() => {
    it("should send an access token",async () => {
        const server = await request("http://localhost:3000");
        const token = {
            token:REFRESH_TOKEN,
        }
        const response = await server
                               .post("/v1/login/token")
                               .send(token);
        expect(response.status).equal(200);
        expect(response.body).to.have.property("access_token");
    })
    it("should throw error when send bad token",async () => {
        const server = await request("http://localhost:3000");
        const token = {
            token:"nothing",
        }
        const response = await server
                               .post("/v1/login/token")
                               .send(token);
        expect(response.status).equal(500);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("bad token");
    })

    it("should throw an error when send non existing token",async () => {
        const server = await request("http://localhost:3000");
        const token = {
            token:ACCESS_TOKEN,
        }
        const response = await server
                               .post("/v1/login/token")
                               .send(token);
        expect(response.status).equal(404);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.equal("token not found");
    })
})