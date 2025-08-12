import express from "express";
import cloudinary from "../lib/cloudinary";
import Book from "../models/Books.js";
const booksRouter  = express.Router();

// get all the books
booksRouter.post("/",protectRoute, async(req, res) => {
    try{
        const { title, caption, rating, image} = req.body;
        if(!title || !caption || !rating || !image){
            return res.status(400).send("All fields are required");
        }
        // upload the img to cloudinary and mDB
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imgURL = uploadResponse.secure_url;
        // save the db
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imgURL,
            user: req.user._id
        })
        await newBook.save();

        res.status(201).json(newBook);

    }catch(err){
        res.status(500).send(err.message);
    }
});

// pagination => infinite loading
booksRouter.get("/", protectRoute, async(req, res) => {
    try{
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
        .sort({createdAt: -1})
        .skip(skip) // to skip the previous results of the books and get new one
        .limit(limit)
        .populate("user", "username profileImage"); // to display the usernameand it's profile accordigly to the post we ae seeing

        const totalBooks = await Book.countDocuments();
        res.send({
            books, 
            currentPage : page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        })
    }catch(err){
        console.log(err);
        res.status(500).json({message : "Internal server error"});
    }
});

// get recommended books by the logged in user
booksRouter.get("/user" , async(req, res) => {
    try{
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books);
    }catch(err){
        console.log(err);
        res.status(500).json({message : "Internal server error"});
    }
})

booksRouter.delete("/:id", protectRoute, async(req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({message : "Book not found"});
        }

            //check if the user is the creator the the book that is being deleted
            if (book.user.toString() !== req.user._id.toString()){
                return res.status(401).json({message : "Unauthorized"});
            }// book.user.toString() thisw is the owner of the book
            // delete the image from cloudinary db
            if(book.image && book.image.includes("cloudinary")){
                try {
                    const publicId = book.image.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.log("error in delete the image from cloudinary")
                }
            }
            await book.deleteOne();

            res.json({message: "Book deleted"});
        

    }catch(err){

    }
});






export default booksRouter;



