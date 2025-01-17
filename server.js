import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// STOPPED AT 1:04:00

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/project-happy-thoughts-api";
mongoose.connect(mongoUrl, { useNewUrlParser : true, useUnifiedTopology: true })
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();


// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const { Schema } = mongoose;


const ThoughtSchema =new Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true // removes any whitespace before and after string
    // unique: true // if you don't want to allow duplicates
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now // or new Date()?
  }
  /* To create a way to differentiate between categories. Enum is an array of all allowed values. 
  category: {
    type: String,
    enum: ["love", "daily", "funny", "other"] */
});

const Thought = mongoose.model("Thought", ThoughtSchema)



// Start defining your routes here
app.get("/", (req, res) => {
  res.send("happy thoughts");
});

// fetch from database
app.get("/thoughts", async (req, res) => {
  try {
  const thoughts = await Thought.find().sort({ createdAt: "desc" }).limit(20).exec();
  res.status(200).json({
    success: true,
    response: thoughts,
    message: "Fetch successful"
  })
} catch (err) {
  res.status(400).json({
    success: false,
    response: "Pardon, could not find any thoughts", error: err.errors
  });
}});

// post to database
app.post("/thoughts", async (req, res) => {
  // Retrieve information sent by client to our API endpoint
  const { message } = req.body;
  try {
    const newThought = await new Thought({ message }).save();

    res.status(201).json({
      success: true,
      response: newThought,
      message: "Thought successfully saved"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      response: "Pardon, could not save",
      error: err.errors
    });
  }
});


app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params
  try {
    const likedThought = await Thought.findByIdAndUpdate(
      thoughtId,
      { $inc: { hearts: 1 } },
      { new: true }
    )
    res.status(200).json({
      success: true,
      response: likedThought,
      message: "Update successful"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      response: "Pardon, could not update", error: err.errors
    });
  }
});

//get by id to check the patch
app.get("/thoughts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const newThought = await Thought.findById(id);
    res.status(200).json({
      success: true,
      response: newThought,
      message: "Fetch successful"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      response: "Pardon, could not find this thought", error: err.errors
    });
  }
});

//delete by id
app.delete("/thoughts/:id", async (req, res) => {
  const { id } = req.params; 
  try {
    const newThought = await Thought.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      response: {},
      message: "Delete successful"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      response: "Pardon, could not delete", error: err.errors
    });
  }
});


//POST to create
//PATCH to update
//PUT to replace

/*
//No need for async when dealing with promises. Async await is more flexible so preferrable, but promises are common in leqacy code.
app.post("/thoughts",  (req, res) => {
  const { message, heart } = req.body;
  const thought = new Thought({ message, heart }).save()
  .then(item => {
    res.status(201).json({
    success: true,
    response: item,
    message: "Thought successfully saved"
  });
}).catch(err => {
  res.status(400).json({
    success: false,
    response: "Pardon, could not save", error: err.errors
  });
});
}); */

  
  
  /* From Vans codealong
  // use our mongoose model to create the database entry
  const thought = new Thought({ message });

  try {
    // success
    const newThought = await thought.save();
    res.status(201).json(newThought);
  } catch (err) {
    // bad request
    res.status(400).json({ message: "Pardon, could not save", error: err.errors });
  }
}); */


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
