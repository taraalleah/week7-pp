const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const connectDB = require("../config/db");
const Product = require("../models/productModel");
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
const initialProducts = [
    {
        title: "Brush",
        category: "Food",
        description: "brush brush",
        price: 10,
        stockQuantity: 5,
        supplier: {
            name: "nvidia",
            contactEmail: "nvidia@gmail.com",
            contactPhone: "4093829582",
            rating: 4
        }
    },
    {
        title: "Brushpremium",
        category: "Food",
        description: "brush brush",
        price: 10,
        stockQuantity: 5,
        supplier: {
            name: "nvidia",
            contactEmail: "nvidia@gmail.com",
            contactPhone: "4093829582",
            rating: 4
        }
    }
];

const productsInDb = async () => {
  const products = await Product.find({});
  return products.map((product) => product.toJSON());
};

let token = null;

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({});
  await Product.deleteMany({});

  const signupResponse = await api
    .post("/api/users/signup")
    .send(realUser)
    .expect(201);

  token = signupResponse.body.token;
});

beforeEach(async () => {
  await Product.deleteMany({});

  for (const product of initialProducts) {
    await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(product)
      .expect(201);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/products", () => {
  it("should return all products", async () => {
    const response = await api.get("/api/products").expect(200);

    expect(response.body).toHaveLength(initialProducts.length);
  });

  it("should return products as JSON with status 200", async () => {
    await api
      .get("/api/products")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should include a specific product in the returned list", async () => {
    const response = await api.get("/api/products");

    expect(response.body.map((product) => product.title)).toContain(
      "Brush"
    );
  });
});

describe("GET /api/products/:productId", () => {
  describe("when the id is valid", () => {
    it("should return one product by ID", async () => {
      const product = await Product.findOne({ title: "Brush" });

      const response = await api
        .get(`/api/products/${product._id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body.title).toBe(product.title);
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 404", async () => {
      const response = await api.get("/api/products/not-a-valid-id").expect(404);

      expect(response.body).toHaveProperty("error", "No such product");
    });
  });
});