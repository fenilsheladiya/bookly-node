import productModel from "../models/productModel.js";
import categoryModel from "../models/CategoryModel.js";
import orderModel from "../models/orderModel.js";
import blogModel from "../models/blogModel.js";

import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

// payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, author, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is Required" });
      case !author:
        return res.status(400).send({ error: "author is Required" });
      case !description:
        return res.status(400).send({ error: "Description is Required" });
      case !price:
        return res.status(400).send({ error: "Price is Required" });
      case !category:
        return res.status(400).send({ error: "Category is Required" });
      case !quantity:
        return res.status(400).send({ error: "Quantity is Required" });
      case !photo || (photo && photo.size > 1000000):
        return res
          .status(400)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    console.log(products);
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate producta
export const updateProductController = async (req, res) => {
  try {
    const { name, author, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    if (!name) {
      return res.status(400).send({ error: "Name is Required" });
    }
    if (!author) {
      return res.status(400).send({ error: "Author is Required" });
    }
    if (!description) {
      return res.status(400).send({ error: "Description is Required" });
    }
    if (!price) {
      return res.status(400).send({ error: "Price is Required" });
    }
    if (!category) {
      return res.status(400).send({ error: "Category is Required" });
    }
    if (!quantity) {
      return res.status(400).send({ error: "Quantity is Required" });
    }
    if (!photo || (photo && photo.size > 1000000)) {
      return res
        .status(400)
        .send({ error: "Photo is Required and should be less than 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update product",
    });
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {}; //multiple query mate args namno object banavyo jem ke radio and checkbox mate
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          //name and description parti serch thashe
          { name: { $regex: keyword, $options: "i" } },
          { author: { $regex: keyword, $options: "i" } }, //i no means case insensitivr
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid }, //ne not encluded atle ke id no show karavi aa id sivay na show karavana
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      //gatway mathi token malshe and token mathi generate and object{}
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body; //braintree mate nonce
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// blog contoller start
//blog add
export const createBlogController = async (req, res) => {
  try {
    const { title, description } = req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !title:
        return res.status(400).send({ error: "title is Required" });
      case !description:
        return res.status(400).send({ error: "Description is Required" });
      case !photo || (photo && photo.size > 1000000):
        return res
          .status(400)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const blogs = new blogModel({ ...req.fields, slug: slugify(title) });
    if (photo) {
      blogs.photo.data = fs.readFileSync(photo.path); //path pass
      blogs.photo.contentType = photo.type;
    }
    await blogs.save();
    res.status(200).send({
      success: true,
      message: "blog Created Successfully",
      blogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating blog",
    });
  }
};

export const getBlogController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).select("-photo"); //no photo ,different photo api
    res.status(200).send({
      success: true,
      countTotal: blogs.length,
      message: "ALlProducts ",
      blogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting blogs",
      error: error.message,
    });
  }
};

// get single product
export const getSingleBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      .findOne({ slug: req.params.slug })
      .select("-photo");
    res.status(200).send({
      success: true,
      message: "Single Blog Fetched",
      blog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single blog",
      error,
    });
  }
};

// get photo
export const blogPhotoController = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.bid).select("photo");
    if (blog?.photo?.data) {
      res.set("Content-type", blog.photo.contentType);
      return res.status(200).send(blog.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

// blog count
export const blogCountController = async (req, res) => {
  try {
    const total = await blogModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in Blog count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const BlogListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const blogs = await blogModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      blogs,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

///delete blog

//delete controller
export const deleteBlogController = async (req, res) => {
  try {
    var data = await blogModel
      .findByIdAndDelete(req.params.bid)
      .select("-photo");

    res.status(200).send({
      success: true,
      message: "Blog Deleted successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting Blog",
      error,
    });
  }
};
