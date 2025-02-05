const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
const PASSWORD = "LeagueTeam2025";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files

// Root route with password form
app.get("/", (req, res) => {
  res.send(`
    <h1>Backend is running!</h1>
    <form action="/auth" method="POST">
      <input type="password" name="password" placeholder="Enter Password" required />
      <button type="submit">Submit</button>
    </form>
  `);
});

// Authentication route
app.post("/auth", (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.send(`
      <h1>Upload Excel File</h1>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" accept=".xlsx" required />
        <button type="submit">Upload Excel</button>
      </form>
    `);
  } else {
    res.send("<h1>Access Denied</h1><p>Incorrect password. Please try again.</p>");
  }
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to upload Excel file and parse data
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0]; // Read first sheet

    let jsonData = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      jsonData.push({
        gamer_name: row.getCell(1).value,
        league: row.getCell(2).value,
        maps: row.getCell(3).value,
        wins: row.getCell(4).value,
        losses: row.getCell(5).value,
        win_percentage: row.getCell(6).value,
      });
    });

    res.json({ message: "File processed successfully", data: jsonData });
  } catch (error) {
    res.status(500).json({ message: "Error processing file", error });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
