const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const connectDB = require("../config/db");
const User = require("../models/userModel");

const api = supertest(app);

const realUser = {
  name: "Sami",
  email: "sami@example.com",
  password: "Sami123!",
  phone_number: "+358401234567",
  gender: "male",
  date_of_birth: "2000-09-11",
  membership_status: "active",
};

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/users/signup", () => {
  describe("when the payload is valid", () => {
    it("should return status 201", async () => {
      await api
        .post("/api/users/signup")
        .send(realUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    });

    it("should return an email and token", async () => {
      const response = await api
        .post("/api/users/signup")
        .send(realUser)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe(realUser.email);
    });

    it("should persist the user in the database", async () => {
      await api.post("/api/users/signup").send(realUser).expect(201);

      const savedUser = await User.findOne({ email: realUser.email });
      expect(savedUser).not.toBeNull();
      expect(savedUser.name).toBe(realUser.name);
    });
  });

  describe("when the payload is invalid", () => {
    it("should return status 400 when required fields are missing", async () => {
      const response = await api
        .post("/api/users/signup")
        .send({ email: "missing@example.com" })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Please add all fields");
    });

    it("should not persist a user in the database", async () => {
      await api
        .post("/api/users/signup")
        .send({ email: "missing@example.com" })
        .expect(400);

      const usersAtEnd = await User.find({});
      expect(usersAtEnd).toHaveLength(0);
    });
  });

  describe("when the email is already registered", () => {
    it("should return status 400", async () => {
      await api.post("/api/users/signup").send(realUser).expect(201);

      const response = await api
        .post("/api/users/signup")
        .send({ ...realUser, name: "Another Productowner" })
        .expect(400);

      expect(response.body).toHaveProperty("error", "User already exists");
    });
  });
});