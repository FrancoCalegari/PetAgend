const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
		);
	},
});

// File filter
const fileFilter = (req, file, cb) => {
	// Accept images, pdfs, videos
	const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mov/;
	const extname = allowedTypes.test(
		path.extname(file.originalname).toLowerCase()
	);
	const mimetype = allowedTypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb("Error: File type not supported!");
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

module.exports = upload;
