const express = require("express");
const router = express.Router();
const supabase = require("../database/supabase");
const upload = require("../middleware/upload");

// Add Pet Page
router.get("/add", async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}

	try {
		const { data: categories, error } = await supabase
			.from("categories")
			.select("*")
			.order("name");

		if (error) throw error;

		res.render("pets/add", { title: "Add Pet", categories: categories || [] });
	} catch (error) {
		console.error("Error fetching categories:", error);
		res.status(500).send("Error loading add pet page");
	}
});

// Add Pet POST
router.post("/add", upload.single("photo"), async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}

	try {
		const { name, surname, dni, blood_type, category_id, new_category } =
			req.body;
		let finalCategoryId = category_id;

		// Handle new category creation
		if (new_category && new_category.trim()) {
			const { data: newCat, error: catError } = await supabase
				.from("categories")
				.insert([{ name: new_category.trim(), is_custom: true }])
				.select()
				.single();

			if (catError) throw catError;
			finalCategoryId = newCat.id;
		}

		// Handle photo upload
		const photo_url = req.file
			? `/uploads/${req.file.filename}`
			: "/images/icon-512.png";

		// Create pet
		const { data: pet, error: petError } = await supabase
			.from("pets")
			.insert([
				{
					user_id: req.session.userId,
					name: name,
					surname: surname || null,
					dni: dni || null,
					blood_type: blood_type || null,
					photo_url: photo_url,
					category_id: finalCategoryId ? parseInt(finalCategoryId) : null,
				},
			])
			.select()
			.single();

		if (petError) throw petError;

		res.redirect("/dashboard");
	} catch (error) {
		console.error("Error creating pet:", error);
		res.status(500).send("Error creating pet");
	}
});

// Pet Detail
router.get("/:id", async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}

	try {
		// Fetch pet with category
		const { data: pet, error: petError } = await supabase
			.from("pets")
			.select(
				`
				*,
				categories (
					id,
					name
				)
			`
			)
			.eq("id", req.params.id)
			.eq("user_id", req.session.userId)
			.single();

		if (petError) throw petError;
		if (!pet) return res.status(404).send("Pet not found");

		// Fetch medical docs
		const { data: medicalDocs, error: medError } = await supabase
			.from("medical_docs")
			.select("*")
			.eq("pet_id", req.params.id)
			.order("date", { ascending: false });

		if (medError) throw medError;

		// Fetch food logs
		const { data: foodLogs, error: foodError } = await supabase
			.from("food_logs")
			.select("*")
			.eq("pet_id", req.params.id)
			.order("fed_at", { ascending: false });

		if (foodError) throw foodError;

		// Transform to match old structure
		const transformedPet = {
			...pet,
			Category: pet.categories,
			MedicalDocs: medicalDocs || [],
			FoodLogs: foodLogs || [],
		};

		res.render("pets/detail", {
			title: pet.name,
			pet: transformedPet,
		});
	} catch (error) {
		console.error("Error fetching pet:", error);
		res.status(500).send("Error loading pet details");
	}
});

// Edit Pet Page
router.get("/:id/edit", async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}

	try {
		const { data: pet, error: petError } = await supabase
			.from("pets")
			.select("*")
			.eq("id", req.params.id)
			.eq("user_id", req.session.userId)
			.single();

		if (petError) throw petError;
		if (!pet) return res.status(404).send("Pet not found");

		const { data: categories, error: catError } = await supabase
			.from("categories")
			.select("*")
			.order("name");

		if (catError) throw catError;

		res.render("pets/edit", {
			title: "Edit Pet",
			pet: pet,
			categories: categories || [],
		});
	} catch (error) {
		console.error("Error loading edit page:", error);
		res.status(500).send("Error loading edit page");
	}
});

// Edit Pet POST
router.post("/:id/edit", upload.single("photo"), async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}

	try {
		const { name, surname, dni, blood_type, category_id } = req.body;

		// Prepare update data
		const updateData = {
			name: name,
			surname: surname || null,
			dni: dni || null,
			blood_type: blood_type || null,
			category_id: category_id ? parseInt(category_id) : null,
		};

		// Handle photo upload
		if (req.file) {
			updateData.photo_url = `/uploads/${req.file.filename}`;
		}

		// Update pet
		const { error } = await supabase
			.from("pets")
			.update(updateData)
			.eq("id", req.params.id)
			.eq("user_id", req.session.userId);

		if (error) throw error;

		res.redirect(`/pets/${req.params.id}`);
	} catch (error) {
		console.error("Error updating pet:", error);
		res.status(500).send("Error updating pet");
	}
});

// Delete Pet
router.post("/:id/delete", async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}

	try {
		const { error } = await supabase
			.from("pets")
			.delete()
			.eq("id", req.params.id)
			.eq("user_id", req.session.userId);

		if (error) throw error;

		res.redirect("/dashboard");
	} catch (error) {
		console.error("Error deleting pet:", error);
		res.status(500).send("Error deleting pet");
	}
});

// ============================================
// MEDICAL DOCS ROUTES
// ============================================

// Add Medical Doc Page
router.get("/:id/medical/add", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { data: pet, error } = await supabase
			.from("pets")
			.select("*")
			.eq("id", req.params.id)
			.eq("user_id", req.session.userId)
			.single();

		if (error) throw error;
		if (!pet) return res.status(404).send("Pet not found");

		res.render("pets/medical_add", { title: "Add Medical Document", pet });
	} catch (error) {
		console.error("Error loading medical add page:", error);
		res.status(500).send("Error loading page");
	}
});

// Add Medical Doc POST
router.post("/:id/medical/add", upload.single("file"), async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { doctor_name, date, info } = req.body;
		const file_url = req.file ? `/uploads/${req.file.filename}` : null;

		if (!file_url) {
			return res.status(400).send("File is required");
		}

		const { error } = await supabase.from("medical_docs").insert([
			{
				pet_id: req.params.id,
				doctor_name: doctor_name,
				date: date,
				info: info || null,
				file_url: file_url,
				file_type: req.file.mimetype,
			},
		]);

		if (error) throw error;

		res.redirect(`/pets/${req.params.id}`);
	} catch (error) {
		console.error("Error adding medical doc:", error);
		res.status(500).send("Error adding medical document");
	}
});

// Edit Medical Doc Page
router.get("/:petId/medical/:docId/edit", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { data: doc, error } = await supabase
			.from("medical_docs")
			.select(
				`
				*,
				pets!inner (
					id,
					user_id
				)
			`
			)
			.eq("id", req.params.docId)
			.eq("pets.user_id", req.session.userId)
			.single();

		if (error) throw error;
		if (!doc) return res.status(404).send("Document not found");

		res.render("pets/medical_edit", {
			title: "Edit Medical Document",
			doc: doc,
			petId: req.params.petId,
		});
	} catch (error) {
		console.error("Error loading medical edit page:", error);
		res.status(500).send("Error loading page");
	}
});

// Edit Medical Doc POST
router.post(
	"/:petId/medical/:docId/edit",
	upload.single("file"),
	async (req, res) => {
		if (!req.session.userId) return res.redirect("/auth/login");

		try {
			const { doctor_name, date, info } = req.body;
			const updateData = {
				doctor_name: doctor_name,
				date: date,
				info: info || null,
			};

			if (req.file) {
				updateData.file_url = `/uploads/${req.file.filename}`;
				updateData.file_type = req.file.mimetype;
			}

			const { error } = await supabase
				.from("medical_docs")
				.update(updateData)
				.eq("id", req.params.docId);

			if (error) throw error;

			res.redirect(`/pets/${req.params.petId}`);
		} catch (error) {
			console.error("Error updating medical doc:", error);
			res.status(500).send("Error updating medical document");
		}
	}
);

// Delete Medical Doc
router.post("/:petId/medical/:docId/delete", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { error } = await supabase
			.from("medical_docs")
			.delete()
			.eq("id", req.params.docId);

		if (error) throw error;

		res.redirect(`/pets/${req.params.petId}`);
	} catch (error) {
		console.error("Error deleting medical doc:", error);
		res.status(500).send("Error deleting medical document");
	}
});

// ============================================
// FOOD LOGS ROUTES
// ============================================

// Add Food Log Page
router.get("/:id/food/add", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { data: pet, error } = await supabase
			.from("pets")
			.select("*")
			.eq("id", req.params.id)
			.eq("user_id", req.session.userId)
			.single();

		if (error) throw error;
		if (!pet) return res.status(404).send("Pet not found");

		res.render("pets/food_add", { title: "Add Food Log", pet });
	} catch (error) {
		console.error("Error loading food add page:", error);
		res.status(500).send("Error loading page");
	}
});

// Add Food Log POST
router.post("/:id/food/add", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { food_name, quantity, fed_at, notes } = req.body;

		const { error } = await supabase.from("food_logs").insert([
			{
				pet_id: req.params.id,
				food_name: food_name,
				quantity: quantity || null,
				fed_at: fed_at,
				notes: notes || null,
			},
		]);

		if (error) throw error;

		res.redirect(`/pets/${req.params.id}`);
	} catch (error) {
		console.error("Error adding food log:", error);
		res.status(500).send("Error adding food log");
	}
});

// Edit Food Log Page
router.get("/:petId/food/:logId/edit", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { data: log, error } = await supabase
			.from("food_logs")
			.select(
				`
				*,
				pets!inner (
					id,
					user_id
				)
			`
			)
			.eq("id", req.params.logId)
			.eq("pets.user_id", req.session.userId)
			.single();

		if (error) throw error;
		if (!log) return res.status(404).send("Food log not found");

		res.render("pets/food_edit", {
			title: "Edit Food Log",
			log: log,
			petId: req.params.petId,
		});
	} catch (error) {
		console.error("Error loading food edit page:", error);
		res.status(500).send("Error loading page");
	}
});

// Edit Food Log POST
router.post("/:petId/food/:logId/edit", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { food_name, quantity, fed_at, notes } = req.body;

		const { error } = await supabase
			.from("food_logs")
			.update({
				food_name: food_name,
				quantity: quantity || null,
				fed_at: fed_at,
				notes: notes || null,
			})
			.eq("id", req.params.logId);

		if (error) throw error;

		res.redirect(`/pets/${req.params.petId}`);
	} catch (error) {
		console.error("Error updating food log:", error);
		res.status(500).send("Error updating food log");
	}
});

// Delete Food Log
router.post("/:petId/food/:logId/delete", async (req, res) => {
	if (!req.session.userId) return res.redirect("/auth/login");

	try {
		const { error } = await supabase
			.from("food_logs")
			.delete()
			.eq("id", req.params.logId);

		if (error) throw error;

		res.redirect(`/pets/${req.params.petId}`);
	} catch (error) {
		console.error("Error deleting food log:", error);
		res.status(500).send("Error deleting food log");
	}
});

module.exports = router;
