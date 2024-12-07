import multer from "multer";

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldNameSize: 200, fileSize: 1024 * 1024 * 10, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only jpg, png, and webp image files are allowed.",
        ),
      );
    }
  },
});
