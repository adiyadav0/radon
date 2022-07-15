const validation = require('../validator/validation')
const booksModel = require('../models/booksModel')
const reviewModel = require('../models/reviewModel')
const moment = require('moment')

const createReview = async function(req,res)
{
    try{

    let bookId = req.params.bookId;

    if(!bookId) return res.status(400).send({status:false, message:"please provide bookId"})
    if(!validation.isValidOjectId(bookId)) return res.status(400).send({status:false, message:"bookId is invalid"})
    
    let idExistOrNot = await booksModel.findOne({_id:bookId, isDeleted:false})
    if(!idExistOrNot) return res.status(404).send({status:false, message:"None of the books exists on this bookId"})
    // here i want to get review count, if i got any object

    let prevReviewCount = idExistOrNot.reviews // when we have to need to know , prevReivewCount then we can use this variable 

    // review, rating, reviewer's name

  let data = req.body;
  // data.bookId = bookId;
// check all mandetory tags
  if(!validation.isBodyEmpty(data)) return res.status(400).send({status:false, message:"Please provide required data like reviewdBy, rating,..."})
  let {reviewedBy,review,rating} = data;

  if(reviewedBy){
    if (!validation.isValid(reviewedBy)) return res.status(400).send({ status: false, message: "reviewdBy tag is required" });
    reviewedBy = reviewedBy.trim().split(" ").filter(word => word).join(" ")
    if (validation.isVerifyString(reviewedBy)) return res.status(400).send({ status: false, message: "ReviewdBy should contains only characters" });
    reviewedBy = reviewedBy.trim().split(" ").filter(word => word).join(" ")
  }

  if (!validation.isValid(rating)) return res.status(400).send({ status: false, message: "Rating tag is required" });
 
  if(!validation.checkRating(rating)) return res.status(400).send({ status: false, message: "please enter a valid rating value : 1 to 5" });

 
  const today = moment();
  data.reviewedAt= today.format('YYYY-MM-DD');
  let filter = {
    bookId:bookId,
    ...data
  }


  if(review)
  {
    if(!validation.isValid(review)) return res.status(400).send({ status: false, message: "review tag should not be empty" });
    review = review.trim().split(" ").filter(word => word).join(" ")
    filter["review"]=review;
  }


  let incReviewCount = await booksModel.findOneAndUpdate({_id:bookId, isDeleted:false},{$set:{reviews:prevReviewCount+1}})

  // i want to get specific key that's why we are performing db call again here so that we can use select , because select is not work on findOneAndUpdate
  let getBookData = await booksModel.findOne({_id:bookId}).select({ISBN:0,deletedAt:0,__v:0})

  let createReviewData = await reviewModel.create(filter)
 
  
 let output  = {
   id: createReviewData._id,
   bookId :createReviewData.bookId,
   reviewedBy: createReviewData.reviewedBy,
   reviewedAt:createReviewData.reviewedAt,
   rating:createReviewData.rating,
   review:createReviewData.review
 }


  let reviewsData = [];
  reviewsData.push(output)

  getBookData._doc["reviewsData"]=reviewsData

  res.status(201).send({status:true, message:'Success', data:getBookData})
} catch(error){
    res.status(500).send({status:false,message:error.message})
}   
}


// update review 

const updateReivewData = async function(req,res)
{
  let bookId = req.params.bookId;
  let reviewId = req.params.reviewId
//  review, rating, reviewer's name.
  if(!bookId) return res.status(400).send({status:false, message:"please provide bookId"})
  if(!validation.isValidOjectId(bookId)) return res.status(400).send({status:false, message:"bookId is invalid"})
  

  if(!reviewId) return res.status(400).send({status:false, message:"please provide reviewID"})
  if(!validation.isValidOjectId(reviewId)) return res.status(400).send({status:false, message:"reviewId is invalid"})

  

  let bookIdExistOrNot = await booksModel.findOne({_id:bookId,isDeleted:false}).select({ deletedAt: 0, __v: 0, ISBN: 0 });
  if(!bookIdExistOrNot) return res.status(404).send({status:false, message:`None of the books exists on this [${bookId}] bookId`})
  let prevReviewCount = bookIdExistOrNot.reviews
  let reviewIdExistOrNot = await reviewModel.findOne({_id:reviewId,isDeleted:false})
  if(!reviewIdExistOrNot) return res.status(404).send({status:false, message: `None of the review exists on this [${reviewId}] reviewId`})

  let reviewAvailWithThisId = await reviewModel.findOne({_id:reviewId,isDeleted:false,bookId:bookIdExistOrNot._id})
  if(!reviewAvailWithThisId) return res.status(404).send({status:false, message:  `None of the review exists on this [${bookId}] bookId`})

  // now we will take data from the body 
  let data = req.body;
  //  review, rating, reviewedBy 
 
  if(!validation.isBodyEmpty(data)) return res.status(400).send({status:false,message:"Please provide some data for updation "})
  let {review, rating, reviewedBy} = data;
  let filter ={
   ...data
  }
  if(review)
  {
    if(!validation.isValid(review)) return res.status(400).send({status:false, message:"Review tag should not be empty"});
    filter["review"] = review;
  }
  if(rating)
  {
    if(!validation.isValid(rating)) return res.status(400).send({status:false, message:"Rating tag should not be empty"});
    if(!validation.checkRating(rating)) return res.status(400).send({ status: false, message: "please enter a valid rating value : 1 to 5" });
    filter["rating"] = rating
  }
  if(reviewedBy)
  {
    if(!validation.isValid(reviewedBy)) return res.status(400).send({ status: false, message: "reviewdBy tag is required" });
    reviewedBy = reviewedBy.trim().split(" ").filter(word => word).join(" ");
    filter["reviewedBy"] = reviewedBy;
  }


  let updateReview = await reviewModel.findOneAndUpdate({_id:reviewId, isDeleted:false},{$set:filter},{new:true})
  let totalReviewsData = await reviewModel.find({bookId:bookId , _id:reviewId, isDeleted:false}).select({createdAt:0,updatedAt:0,isDeleted:0,__v:0})
 
  let output = JSON.parse(JSON.stringify(bookIdExistOrNot))

  output.reviewsData=totalReviewsData
  res.status(200).send({status:true, message:'Success', data:output})


}


// delete review data 
const deleteReviewData = async function(req,res)
{
  try{
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId

    if(!bookId) return res.status(400).send({status:false, message:"please provide bookId"})
    if(!validation.isValidOjectId(bookId)) return res.status(400).send({status:false, message:"bookId is invalid"})

    if(!reviewId) return res.status(400).send({status:false, message:"please provide reviewID"})
    if(!validation.isValidOjectId(reviewId)) return res.status(400).send({status:false, message:"reviewId is invalid"})

    let bookIdExistOrNot = await booksModel.findById({_id:bookId,isDeleted:false})
    if(!bookIdExistOrNot) return res.status(404).send({status:false, message:`None of the books exists on this [${bookId}] bookId`})
    
    let prevReviewCount = bookIdExistOrNot.reviews
    let reviewIdExistOrNot = await reviewModel.findById({_id:reviewId,isDeleted:false})
    if(!reviewIdExistOrNot) return res.status(404).send({status:false, message: `None of the review exists on this [${reviewId}] reviewId`})

    let reviewAvailWithThisId = await reviewModel.findOne({_id:reviewId,isDeleted:false,bookId:bookIdExistOrNot._id})
    if(!reviewAvailWithThisId) return res.status(404).send({status:false, message:  `None of the review exists on this [${bookId}] bookId`})

    let decReviewCount = await booksModel.findOneAndUpdate({_id:bookId},{$set:{reviews:prevReviewCount-1}})
    let delReviewData = await reviewModel.findOneAndUpdate({_id:reviewId},{$set:{isDeleted:true}})

    res.status(200).send({status:true, message:"Review Deleted Successfully"});

  }catch(error){
    res.status(500).send({status:false,message:error.message})
  }   
    
}



module.exports = {createReview,updateReivewData,deleteReviewData}