const path = require('path')
const multer = require('multer')

const sanitizeFilename = (name) => {
  return name.replace(/[^a-zA-Z0-9-_.]/g, '_');
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    const timestamp = Date.now().toString(36);
    const sanitizedFilename = sanitizeFilename(originalname);
    const extension = path.extname(originalname);
    const filename = `${sanitizedFilename}-${timestamp}${extension}`;
    cb(null, filename);
  },
});

  
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      // Define the allowed file types
      const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
  
      // Check if the file extension is allowed
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (allowedFileTypes.includes(fileExtension)) {
        cb(null, true); // Accept the file
      } else {
        cb(new Error('Invalid file type')); // Reject the file
      }
    },
    limits : {
        fileSize: 1024 * 1024 * 2
    }
  });

  module.exports = upload