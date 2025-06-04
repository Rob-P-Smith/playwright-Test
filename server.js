import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Store generated random numbers
let randomNumbers = [];

// Function to generate a random number entry
function generateRandomNumber() {
  // Generate a unique key
  const key = `random_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;
  // Generate a random number between 1 and 1000
  const value = Math.floor(Math.random() * 1000) + 1;

  return { key, value };
}

// Initialize with 10 random numbers when server starts
function initializeRandomNumbers() {
  console.log("Initializing 10 random numbers...");
  randomNumbers = [];

  for (let i = 0; i < 10; i++) {
    const randomNumber = generateRandomNumber();
    randomNumbers.push(randomNumber);
  }
}

// Initialize on server start
initializeRandomNumbers();

// Middleware
app.use(cors());
app.use(express.json());

// Add delay for GET requests
app.use((req, res, next) => {
  if (req.method === "GET") {
    console.log("Delaying GET request by 4 seconds...");
    setTimeout(() => {
      next();
    }, 4000);
  } else {
    next();
  }
});

// Route 1: Get random numbers
app.get("/api/random-numbers", (req, res) => {
  // Simply return the stored random numbers
  console.log("Returning existing random numbers:", randomNumbers.length);
  res.json(randomNumbers);
});

// Route to generate a single new random entry
app.post("/api/generate-random", (req, res) => {
  // Generate a new random number
  const newRandomNumber = generateRandomNumber();

  // Add to our existing array
  randomNumbers.push(newRandomNumber);

  console.log("Added new random number. Total count:", randomNumbers.length);

  // Return the new entry
  res.status(201).json({
    success: true,
    message: "New random number generated",
    data: newRandomNumber,
  });
});

// Route 2: Check random number
app.post("/api/check-random", (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({
      success: false,
      message: "Both key and value are required",
    });
  }

  // Find the entry with the given key
  const entry = randomNumbers.find((item) => item.key === key);

  // Check if the key exists
  if (!entry) {
    return res.status(404).json({
      success: false,
      message: "Key not found",
    });
  }

  // Check if the value matches
  const matches = Number(value) === entry.value;

  res.json({
    success: matches,
    message: matches ? "The value matches!" : "The value does not match",
    expected: entry.value,
    received: value,
  });
});

// Optional: Reset endpoint for testing
app.post("/api/reset", (req, res) => {
  initializeRandomNumbers();
  res.json({
    success: true,
    message: "Random numbers reset to initial 10 values",
    count: randomNumbers.length,
  });
});

// Route to delete a random number by key
app.delete("/api/random-numbers/:key", (req, res) => {
  const key = req.params.key;

  // Find the index of the entry with the given key
  const index = randomNumbers.findIndex((item) => item.key === key);

  // Check if the key exists
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Random number with the specified key not found",
    });
  }

  // Remove the entry from the array
  const removedItem = randomNumbers.splice(index, 1)[0];

  console.log(
    `Removed random number with key: ${key}. Remaining count: ${randomNumbers.length}`
  );

  // Return success response
  res.json({
    success: true,
    message: "Random number removed successfully",
    removed: removedItem,
    remainingCount: randomNumbers.length,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
