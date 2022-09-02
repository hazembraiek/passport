
const { existingUser } = require("./mock.js"); // 
const supertest = require("supertest");
const app = require("../../../src/app");

//falgs for test
let REFRESH_TOKEN; 
let ACCESS_TOKEN;

describe("Test Login",() => {
    const server = supertest(app);
    it("should send error when empty body is only sent",async () => {
        const emptyBody = {};
        const response = await server.post("/v1/login").send(emptyBody);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch("account does not exist");
    });

    it("should send error when email is only sent",async () => {
        const nonExistingUser = {
            email:"john@service.domain",
        }
        const response = await server
                               .post("/v1/login")
                               .send(nonExistingUser);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch("account does not exist");
    });
    
    it("should send error when password is only sent",async () => {
        const nonExistingUser = {
            password:"pass123"
        }
        const response = await server
                               .post("/v1/login")
                               .send(nonExistingUser);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch("account does not exist");
    });
    it("should send error when password is incorrect ",async () => {
        const user = {
            ...existingUser,
            password:""
        }
        const response = await server
                               .post("/v1/login")
                               .send(user);
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch("invalid password or email");
    });
    
    it("should login",async () => {
        const response = await server
                               .post("/v1/login")
                               .send(existingUser);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("access_token");
        expect(response.body).toHaveProperty("refresh_token");
        REFRESH_TOKEN = response.body.refresh_token;
        ACCESS_TOKEN = response.body.access_token;
    });
})

describe("test forgot password",() => {
    const server = supertest(app);
    it("should send an error whent account",async () => {
        const nonExistingUser = {
            email:"john@service.domain",
        }
        const response = await server
                               .post("/v1/login/forgot_password")
                               .send(nonExistingUser);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Account does not exist");
    })
    it("should send an reset link",async () => {
        const response = await server
                               .post("/v1/login/forgot_password")
                               .send(existingUser);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("password reset link were sent check your mail");
    })
})


describe("test refresh token",() => {
    const server = supertest(app);
    it("should send an access token",async () => {
       
        const token = {
            token:REFRESH_TOKEN,
        }
        const response = await server
                               .post("/v1/login/token")
                               .send(token);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("access_token");
    })
    it("should throw error when send bad token",async () => {
        const token = {
            token:"nothing",
        }
        const response = await server
                               .post("/v1/login/token")
                               .send(token);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("bad token");
    })

    it("should throw an error when send non existing token",async () => {
        const token = {
            token:ACCESS_TOKEN,
        }
        const response = await server
                               .post("/v1/login/token")
                               .send(token);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("token not found");
    })
})

describe("test reset password",() => {
    const server = supertest(app);
    it("should set new password",async () => {
        const newPassword = {
            password:"pass1"
        }
       
        const response = await server
                                .post("/v1/login/"+global.RESET_LINK)
                                .send(newPassword);
        expect(response.status).toBe(200)
    })
    
    it("should send an error when reset link expired",async () => {
        const newPassword = {
            password:"pass1"
        }
       
        const response = await server
                                .post("/v1/login/"+RESET_LINK)
                                .send(newPassword);
        expect(response.status).toBe(404)
    })
    it("should send an error when reset link is wrong",async () => {
        const newPassword = {
            password:"pass1"
        }
        const response = await server
                                .post("/v1/login/"+"blablabla")
                                .send(newPassword);
        expect(response.status).toBe(404)
    })

})

