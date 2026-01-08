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
	// Accept images, videos, documents, and spreadsheets
	const allowedTypes =
		/jpeg|jpg|png|gif|webp|avif|pdf|mp4|mov|doc|docx|odt|xls|xlsx|ods|csv/;
	const extname = allowedTypes.test(
		path.extname(file.originalname).toLowerCase()
	);

	// Check MIME types
	const allowedMimeTypes = [
		// Images
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/avif",
		// Videos
		"video/mp4",
		"video/quicktime",
		// Documents
		"application/pdf",
		"application/msword", // .doc
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
		"application/vnd.oasis.opendocument.text", // .odt
		// Spreadsheets
		"application/vnd.ms-excel", // .xls
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
		"application/vnd.oasis.opendocument.spreadsheet", // .ods
		"text/csv",
	];

	const mimetypeValid = allowedMimeTypes.includes(file.mimetype);

	if (mimetypeValid && extname) {
		return cb(null, true);
	} else {
		cb(
			`Error: File type not supported! Allowed: images, videos, PDF, documents, spreadsheets`
		);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

module.exports = upload;
