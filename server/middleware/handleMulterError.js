export default function handleMulterError(err, req, res, next) {
  // multer errors are instances of MulterError (name === 'MulterError')
  if (err && err.name === "MulterError") {
    console.error("MulterError handled:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }

  // If it's another error, pass through to next error handler
  next(err);
}
