const express = require("express");
const router = express.Router();
const path = require("path");
const { Pet, Category, MedicalDoc, FoodLog } = require("../models");
const upload = require("../middleware/upload");

// GET Add Pet View
router.get("/add", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	const categories = await Category.findAll();
	res.render("pets/add", { title: "Add Pet", categories });
});

// POST Add Pet
router.post("/add", upload.single("photo"), async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const { name, surname, dni, blood_type, category_id, new_category } =
			req.body;
		let finalCategoryId = category_id;

		console.log("Adding Pet:", {
			userId: req.session.userId,
			name,
			category_id,
			new_category,
		});

		// Handle new category
		if (new_category && new_category.trim() !== "") {
			const [cat] = await Category.findOrCreate({
				where: { name: new_category.trim(), is_custom: true },
			});
			finalCategoryId = cat.id;
		} else if (finalCategoryId === "other") {
			// If user selected 'other' but didn't type anything, maybe default to 'Other' category if it exists?
			// Or force them to type.
			// For now, let's error if it's 'other'
			return res.status(400).send("Please specify a category name.");
		}

		console.log("Final Category ID:", finalCategoryId);

		await Pet.create({
			userId: req.session.userId,
			name,
			surname,
			dni,
			blood_type,
			categoryId: finalCategoryId,
			categoryId: finalCategoryId,
			photo_url: req.file
				? "/uploads/" + req.file.filename
				: "/images/icon-512.png",
		});

		res.redirect("/dashboard");
	} catch (error) {
		console.error("Error creating pet:", error);
		res.status(500).send("Error creating pet: " + error.message);
	}
});

// GET Edit Pet View
router.get("/:id/edit", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const pet = await Pet.findOne({
			where: { id: req.params.id, userId: req.session.userId },
		});
		if (!pet) return res.status(404).send("Pet not found");
		const categories = await Category.findAll();
		res.render("pets/edit", { title: "Edit Pet", pet, categories });
	} catch (error) {
		console.error(error);
		res.status(500).send("Error loading edit view");
	}
});

// POST Edit Pet
router.post("/:id/edit", upload.single("photo"), async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const { name, surname, dni, blood_type, category_id, new_category } =
			req.body;
		const pet = await Pet.findOne({
			where: { id: req.params.id, userId: req.session.userId },
		});

		if (!pet) return res.status(404).send("Pet not found");

		let finalCategoryId = category_id;
		// Handle new category
		if (new_category && new_category.trim() !== "") {
			const [cat] = await Category.findOrCreate({
				where: { name: new_category.trim(), is_custom: true },
			});
			finalCategoryId = cat.id;
		} else if (finalCategoryId === "other") {
			return res.status(400).send("Please specify a category name.");
		}

		const updateData = {
			name,
			surname,
			dni,
			blood_type,
			categoryId: finalCategoryId,
		};

		if (req.file) {
			updateData.photo_url = "/uploads/" + req.file.filename;
		}

		await pet.update(updateData);
		res.redirect("/pets/" + req.params.id);
	} catch (error) {
		console.error(error);
		res.status(500).send("Error updating pet");
	}
});

// GET Pet Details
router.get("/:id", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const pet = await Pet.findOne({
			where: { id: req.params.id, userId: req.session.userId },
			include: [Category, MedicalDoc, FoodLog],
		});

		if (!pet) return res.status(404).send("Pet not found");

		res.render("pets/detail", { title: pet.name, pet });
	} catch (error) {
		console.error(error);
		res.status(500).send("Error loading pet details");
	}
});

// GET Add Medical Doc View
router.get("/:id/medical/add", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	const pet = await Pet.findByPk(req.params.id);
	res.render("pets/medical_add", { title: "Add Medical Doc", pet });
});

// POST Add Medical Doc
router.post("/:id/medical/add", upload.single("file"), async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const { doctor_name, date, info } = req.body;
		await MedicalDoc.create({
			petId: req.params.id,
			doctor_name,
			date,
			info,
			file_url: req.file ? "/uploads/" + req.file.filename : "",
			file_type: req.file
				? path.extname(req.file.originalname).toLowerCase()
				: "unknown",
		});
		res.redirect("/pets/" + req.params.id);
	} catch (error) {
		console.error(error);
		res.status(500).send("Error adding document");
	}
});

// GET Add Food Log View
router.get("/:id/food/add", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	const pet = await Pet.findByPk(req.params.id);
	res.render("pets/food_add", { title: "Add Food Log", pet });
});

// POST Add Food Log
router.post("/:id/food/add", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const { food_name, quantity, fed_at, notes } = req.body;
		await FoodLog.create({
			petId: req.params.id,
			food_name,
			quantity,
			fed_at: fed_at || new Date(),
			notes,
		});
		res.redirect("/pets/" + req.params.id);
	} catch (error) {
		console.error(error);
		res.status(500).send("Error adding food log");
	}
});

// --- Medical Docs CRUD ---

// GET Edit Medical Doc
router.get("/:id/medical/:docId/edit", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const pet = await Pet.findByPk(req.params.id);
		const doc = await MedicalDoc.findOne({
			where: { id: req.params.docId, petId: req.params.id },
		});
		if (!doc) return res.status(404).send("Document not found");
		res.render("pets/medical_edit", { title: "Edit Document", pet, doc });
	} catch (error) {
		console.error(error);
		res.status(500).send("Error loading edit view");
	}
});

// POST Edit Medical Doc
router.post(
	"/:id/medical/:docId/edit",
	upload.single("file"),
	async (req, res) => {
		if (!req.session.userId) return res.redirect("/auth/login");
		try {
			const { doctor_name, date, info } = req.body;
			const doc = await MedicalDoc.findOne({
				where: { id: req.params.docId, petId: req.params.id },
			});

			if (!doc) return res.status(404).send("Document not found");

			const updateData = { doctor_name, date, info };
			if (req.file) {
				updateData.file_url = "/uploads/" + req.file.filename;
				updateData.file_type = path
					.extname(req.file.originalname)
					.toLowerCase();
			}

			await doc.update(updateData);
			res.redirect("/pets/" + req.params.id);
		} catch (error) {
			console.error(error);
			res.status(500).send("Error updating document");
		}
	}
);

// POST Delete Medical Doc
router.post("/:id/medical/:docId/delete", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const doc = await MedicalDoc.findOne({
			where: { id: req.params.docId, petId: req.params.id },
		});
		if (doc) {
			// Optional: Delete file from filesystem here (fs.unlinkSync)
			await doc.destroy();
		}
		res.redirect("/pets/" + req.params.id);
	} catch (error) {
		console.error(error);
		res.status(500).send("Error deleting document");
	}
});

// --- Food Logs CRUD ---

// GET Edit Food Log
router.get("/:id/food/:logId/edit", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const pet = await Pet.findByPk(req.params.id);
		const log = await FoodLog.findOne({
			where: { id: req.params.logId, petId: req.params.id },
		});
		if (!log) return res.status(404).send("Log not found");
		res.render("pets/food_edit", { title: "Edit Food Log", pet, log });
	} catch (error) {
		console.error(error);
		res.status(500).send("Error loading edit view");
	}
});

// POST Edit Food Log
router.post("/:id/food/:logId/edit", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const { food_name, quantity, fed_at, notes } = req.body;
		const log = await FoodLog.findOne({
			where: { id: req.params.logId, petId: req.params.id },
		});

		if (!log) return res.status(404).send("Log not found");

		await log.update({ food_name, quantity, fed_at, notes });
		res.redirect("/pets/" + req.params.id);
	} catch (error) {
		console.error(error);
		res.status(500).send("Error updating food log");
	}
});

// POST Delete Food Log
router.post("/:id/food/:logId/delete", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	try {
		const log = await FoodLog.findOne({
			where: { id: req.params.logId, petId: req.params.id },
		});
		if (log) {
			await log.destroy();
		}
		res.redirect("/pets/" + req.params.id);
	} catch (error) {
		console.error(error);
		res.status(500).send("Error deleting food log");
	}
});

module.exports = router;
