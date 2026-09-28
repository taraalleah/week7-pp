const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const connectDB = require("../config/db");
const api = supertest(app);
const Product = require("../models/productModel");

const initialProducts = [
  { title: "Brush", 
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
  { title: "Brushpremium", 
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