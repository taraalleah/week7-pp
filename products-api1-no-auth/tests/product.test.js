const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const connectDB = require("../config/db");
const api = supertest(app);
const Product = require("../models/productModel");

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


beforeAll(async () => {
  await connectDB();
});

afterAll(() => {
  mongoose.connection.close();
});

beforeEach(async () => {
  await Product.deleteMany({});
  let productObject = new Product(initialProducts[0]);
  await productObject.save();
  productObject = new Product(initialProducts[1]);
  await productObject.save();
});

// GET /api/products
describe("when there is initially some products saved", () => {
  it("should return all products",
    async () => {
      const response = await api.get("/api/products").expect(200);
      expect(response.body).toHaveLength(initialProducts.length);

    })

  it("should return products as json", async () => {
    await api
      .get("/api/products")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should include a specific product in the returned list", async () => {
    const response = await api.get("/api/products");

    expect(response.body.map((product) => product.category)).toContain(
      "Food"
    );
  });
});

// POST /api/products

//   when the payload is valid
//     should return status 201
//     should persist the new product in the database

describe("POST /api/products", () => {
  describe("when the payload is valid", () => {
    it("should return status 201", async () => {
      const newProduct = {
        title: "Phone",
        category: "Electronics",
        description: "beep boop",
        price: 2000,
        stockQuantity: 67,
        supplier: {
          name: "Apple",
          contactEmail: "jeff@gmail.com",
          contactPhone: "4093829582",
          rating: 5,
        },
      };

      await api.post("/api/products").send(newProduct).expect(201);
    });

    it("should persist the new product in the database", async () => {
      const newProduct = {
        title: "Phone",
        category: "Electronics",
        description: "beep boop",
        price: 2000,
        stockQuantity: 67,
        supplier: {
          name: "Apple",
          contactEmail: "jeff@gmail.com",
          contactPhone: "4093829582",
          rating: 5,
        },
      };

      await api.post("/api/products").send(newProduct).expect(201);

      const productsAfterPost = await Product.find({});
      expect(productsAfterPost).toHaveLength(initialProducts.length + 1);
      expect(productsAfterPost.map((product) => product.title)).toContain(newProduct.title);
    });
  });

  //   when the payload is invalid
  //     should return status 400 when title is missing
  //     should not increase the number of products in the database

  describe("when the payload is invalid", () => {
    it("should return status 400 when title is missing", async () => {
      const invalidProduct = {
        category: "Electronics", 
        description: "Missing title should fail.",
        price: 2000,
        stockQuantity: 67,
        supplier: {
          name: "Apple",
          contactEmail: "jeff@gmail.com",
          contactPhone: "4093829582",
          rating: 5,
        },
      };

      await api.post("/api/products").send(invalidProduct).expect(400);
    });

    it("should not increase the number of products in the database", async () => {
      const invalidProduct = {
        fgfgf: "dfds",
        category: "Electronics", 
        description: "Missing title should fail.",
        price: 2000,
        stockQuantity: 67,
        supplier: {
          name: "Apple",
          contactEmail: "jeff@gmail.com",
          contactPhone: "4093829582",
          rating: 5,
        },
      };

      await api.post("/api/products").send(invalidProduct).expect(400);

      const productsAtEnd = await Product.find({});
      expect(productsAtEnd).toHaveLength(initialProducts.length);
    });
  });
});

//GET /api/products/:productId


describe("GET /api/products/:productId", () => {
  describe("when the id is valid", () => {
    it("should return one product by ID", async () => {
      const product = await Product.findOne();

      const response = await api
        .get(`/api/products/${product._id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body.title).toBe(product.title);
    });
  });

  describe("when the id does not exist", () => {
    it("should return status 404", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await api.get(`/api/products/${nonExistentId}`).expect(404);
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 400", async () => {
      await api.get("/api/products/12345").expect(404);
    });
  });
});
