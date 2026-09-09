const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      return callback(null, true);
    }

    callback(new Error('Solo se permiten archivos de imagen'));
  }
});

module.exports = upload;