const fs = require("fs");
const path = require("path");

// Ensure the files directory exists
const filesDir = path.join(__dirname, "../files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// Get all hisaab records
const getAllHisaab = (req, res) => {
  fs.readdir("./files", function (err, files) {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { message: "Error reading files" });
    }
    res.render("index", { files });
  });
};

// Render create form
const renderCreateForm = (req, res) => {
  res.render("create");
};

// Create new hisaab
const createHisaab = (req, res) => {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const year = currentDate.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;
  let data = req.body.hisaab;

  // Validate data is not empty
  if (!data || data.trim() === "") {
    return res.status(400).render("error", { message: "Content cannot be empty" });
  }

  fs.writeFile(`./files/${formattedDate}.txt`, data, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { message: "Error creating file" });
    }
    res.redirect("/");
  });
};

// Render edit form
const renderEditForm = (req, res) => {
  const fileName = req.params.filename;
  
  // Validate filename to prevent directory traversal attacks
  if (fileName.includes("..") || fileName.includes("/")) {
    return res.status(400).render("error", { message: "Invalid filename" });
  }
  
  fs.readFile(`./files/${fileName}`, "utf-8", function (err, data) {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { message: "Error reading file" });
    }
    res.render("edit", { fileName, data });
  });
};

// Update hisaab
const updateHisaab = (req, res) => {
  const oldFileName = req.params.filename;
  const newFileName = req.body.newFileName;
  const fileData = req.body.fileData;
  
  // Validate filenames to prevent directory traversal attacks
  if (oldFileName.includes("..") || oldFileName.includes("/") || 
      newFileName.includes("..") || newFileName.includes("/")) {
    return res.status(400).render("error", { message: "Invalid filename" });
  }
  
  // If the filename is being changed
  if (oldFileName !== newFileName) {
    // First write the new content to the new file
    fs.writeFile(`./files/${newFileName}`, fileData, function (err) {
      if (err) {
        console.error(err);
        return res.status(500).render("error", { message: "Error updating file" });
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
        return res.status(500).render("error", { message: "Error updating file" });
      }
      res.redirect("/");
    });
  }
};

// Delete hisaab
const deleteHisaab = (req, res) => {
  const fileName = req.params.filename;
  
  // Validate filename to prevent directory traversal attacks
  if (fileName.includes("..") || fileName.includes("/")) {
    return res.status(400).render("error", { message: "Invalid filename" });
  }
  
  fs.unlink(`./files/${fileName}`, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { message: "Error deleting file" });
    }
    res.redirect("/");
  });
};

module.exports = {
  getAllHisaab,
  renderCreateForm,
  createHisaab,
  renderEditForm,
  updateHisaab,
  deleteHisaab
};