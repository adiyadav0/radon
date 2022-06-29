// # PLEASE READ THE README FILE FIRST AND THIS IS NOT THE FINAL BRANCH, PLEASE DO TESTING ON FINAL BRANCH "project/blog"
const { default: mongoose } = require("mongoose");
const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const isValid = require("../validators/dataValidator");

/** 
 * @createBlog 
    POST API TO CREATE A BLOG
    AFTER VALIDATING ALL THE FIELDS
*/
const createBlog = async (req, res) => {
  try {
    let data = req.body;
    let dataLength = Object.keys(data).length;
    const { title, category, body, tags, subcategory, authorId } = data;

    //VALIDATIONS
    if (!dataLength) {
      return res.status(400).send({
        status: false,
        msg: "Please provide some valid data for the blog",
      });
    }
    if (!isValid.check(title)) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter a valid Title" });
    }
    if (!isValid.check(category)) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter a valid category" });
    }
    if (!isValid.check(body)) {
      return res.status(400).send({
        status: false,
        msg: "Please provide valid content in the body",
      });
    }
    if (tags) {
      if (!isValid.checkArr(tags))
        return res.status(400).send({
          status: false,
          msg: "Please check the tags",
        });
    }
    if (subcategory) {
      if (!isValid.checkArr(subcategory))
        return res.status(400).send({
          status: false,
          msg: "Please check the subcategory",
        });
    }
    let valid = isValid.checkId(authorId);

    if (!(valid && (await authorModel.findById(authorId)))) {
      return res.status(404).send({
        status: false,
        msg: "Please provide a valid authorId",
      });
    }
    let result = await blogModel.create(data);
    res.status(201).send({ status: true, data: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, msg: err.message });
  }
};

/** 
 * @getBlogs
    GET API TO GET ALL BLOGS
    OR GET BLOGS BASED ON QUERY FILTERS
*/
const getBlogs = async (req, res) => {
  try {
    let query = Object.keys(req.query);
    if (query.length) {
      /* THE CODE INSIDE THIS SCOPE WILL RUN ONLY IF THE REQUEST IS 
         MADE USING QUERIES */

      let filter = req.query;
      if (filter.authorId && !isValid.checkId(filter.authorId)) {
        return res.status(400).send({
          status: false,
          msg: "Invalid authorId",
        });
      }
      if (Array.isArray(filter.tags)) {
        filter.tags = { $all: filter.tags };
      }
      if (Array.isArray(filter.subcategory)) {
        filter.subcategory = { $all: filter.subcategory };
      }
      filter.isDeleted = false;
      filter.isPublished = true;
      let data = await blogModel.find(filter);
      if (!data.length) {
        return res.status(404).send({ status: false, msg: "No blogs found" });
      }
      return res.status(200).send({ status: true, data: data });
    }

    // THE CODE HERE WILL RUN WHEN THERE WERE NO QUERIES IN THE REQUEST

    let data = await blogModel.find({ isDeleted: false, isPublished: true });

    if (!data.length)
      return res.status(404).send({ status: false, msg: "No blogs found" });

    res.status(200).send({ status: true, data: data });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, msg: err.message });
  }
};

/** 
 * @updateBlog
    PUT API TO GET ALL BLOG
*/
const updateBlog = async function (req, res) {
  try {
    let id = req.params.blogId;
    let docs = req.body;
    let update = Object.keys(docs);
    let updates = {};
    let arrUpdate = {};
    let { title, category, body, tags, subcategory, isPublished } = docs;

    //VALIDATIONS
    if (!update.length) {
      return res.status(400).send({
        status: false,
        msg: "Please provide valid data to update",
      });
    }
    if (title) {
      if (!isValid.check(title)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter a valid Title" });
      }
      updates.title = title;
    }
    if (category) {
      if (!isValid.check(category)) {
        return res
        .status(400)
        .send({ status: false, msg: "Please enter a valid category" });
      }
      updates.category = category;
    }
    if (body) {
      if (!isValid.check(body)) {
        return res.status(400).send({
          status: false,
          msg: "Please provide valid content in the body",
        });
      }
      updates.body = body;
    }
    if (!isValid.checkId(id)) {
      return res.status(400).send({ status: false, msg: "Invalid Blog-Id" });
    }
    if (tags) {
      if (!isValid.checkArr(tags)) {
        return res
          .status(500)
          .send({ status: false, msg: "Please check the tags field" });
      }
      if (Array.isArray(tags)) {
        arrUpdate["tags"] = { $each: [...tags] };
      } else {
        arrUpdate["tags"] = tags;
      }
    }
    if (subcategory) {
      if (!isValid.checkArr(subcategory)) {
        return res
          .status(500)
          .send({ status: false, msg: "Please check the subcategory field" });
      }
      if (Array.isArray(subcategory)) {
        arrUpdate["subcategory"] = { $each: [...subcategory] };
      } else {
        arrUpdate["subcategory"] = subcategory;
      }
    }

    if (typeof isPublished == "boolean") {
      updates.isPublished = isPublished;
    }
    let published = await blogModel.findById(id);
    if (!published.publishedAt) updates.publishedAt = new Date();
    let data = await blogModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updates, $addToSet: arrUpdate },
      { new: true }
    );
    if (!data)
      return res.status(404).send({
        status: false,
        msg: "No blog with such id or already deleted",
      });
    res.status(200).send({ status: true, data: data });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, msg: err.message });
  }
};

/** 
 * @deleteBlogByQuery
    DELETE API TO DELETE BLOGS BY QUERY FILTERS
*/
const deleteBlogByQuery = async (req, res) => {
  try {
    let query = Object.keys(req.query);
    if (!query.length)
      return res.status(400).send({
        status: false,
        msg: "Please provide valid query params",
      });
    let filter = req.query;
    filter.isDeleted = false;

    if (Array.isArray(filter.tags)) {
      filter.tags = { $all: filter.tags };
    }
    if (Array.isArray(filter.subcategory)) {
      filter.subcategory = { $all: filter.subcategory };
    }
    if (!filter.authorId) filter.authorId = req["x-api-key"];
    let result = await blogModel.updateMany(filter, {
      $set: { isDeleted: true, deletedAt: new Date() },
    });
    if (!result.modifiedCount) {
      return res
        .status(404)
        .send({ status: false, msg: "No such blogs or already deleted" });
    }
    res.status(200).send({ status: true, data: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ status: false, msg: err.message });
  }
};

/** 
 * @deleteBlog
    DELETE API TO DELETE BLOGS BY BLOG ID
*/
const deleteBlog = async function (req, res) {
  try {
    let id = req.params.blogId;

    //BLOGID VALIDATION
    if (!(id && isValid.checkId(id))) {
      return res.status(400).send({
        status: false,
        msg: "Please provide the valid blogId in params",
      });
    }
    let result = await blogModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );
    if (!result) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog not present or already deleted" });
    }
    res.status(200).send();
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
};

module.exports = {
  create: createBlog,
  delete: deleteBlog,
  deleteBlogByQuery: deleteBlogByQuery,
  getBlogs: getBlogs,
  updateBlog: updateBlog,
};
