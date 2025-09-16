const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the files directory exists
const filesDir = path.join(__dirname, "files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

app.get("/", function (req, res) {
  fs.readdir("./files", function (err, files) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading files");
    }
    res.render("index", { files });
  });
});

app.get("/edit/:filename", function (req, res) {
  const fileName = req.params.filename;
  // Validate filename to prevent directory traversal attacks
  if (fileName.includes("..") || fileName.includes("/")) {
    return res.status(400).send("Invalid filename");
  }
  
  fs.readFile(`./files/${fileName}`, "utf-8", function (err, data) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading file");
    }
    res.render("edit", { fileName, data });
  });
});

app.get("/delete/:filename", function (req, res) {
  const fileName = req.params.filename;
  // Validate filename to prevent directory traversal attacks
  if (fileName.includes("..") || fileName.includes("/")) {
    return res.status(400).send("Invalid filename");
  }
  
  fs.unlink(`./files/${fileName}`, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error deleting file");
    }
    res.redirect("/");
  });
});

app.post("/update/:filename", function (req, res) {
  const oldFileName = req.params.filename;
  const newFileName = req.body.newFileName;
  const fileData = req.body.fileData;
  
  // Validate filenames to prevent directory traversal attacks
  if (oldFileName.includes("..") || oldFileName.includes("/") || 
      newFileName.includes("..") || newFileName.includes("/")) {
    return res.status(400).send("Invalid filename");
  }
  
  // If the filename is being changed
  if (oldFileName !== newFileName) {
    // First write the new content to the new file
    fs.writeFile(`./files/${newFileName}`, fileData, function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Error updating file");
      }
      
      // Then delete the old file
      fs.unlink(`./files/${oldFileName}`, function (err) {
        if (err) {
          console.error(err);
          // If deletion fails, we still have the new file
        }
        res.redirect("/");
      });
    });
  } else {
    // If only content is being updated (same filename)
    fs.writeFile(`./files/${oldFileName}`, fileData, function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Error updating file");
      }
      res.redirect("/");
    });
  }
});

app.get("/create", function (req, res) {
  res.render("create");
});

app.post("/createHisab", function (req, res) {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const year = currentDate.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;
  let data = req.body.hisaab;

  // Validate data is not empty
  if (!data || data.trim() === "") {
    return res.status(400).send("Content cannot be empty");
  }

  fs.writeFile(`./files/${formattedDate}.txt`, data, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error creating file");
    }
    res.redirect("/");
  });
});

app.listen(3000, function () {
  console.log("Server is running on port http://localhost:3000");
});