const express = require("express");
const router = express.Router();
const supabase = require("../database/supabase");
const upload = require("../middleware/upload");

// Middleware to check auth
const requireAuth = (req, res, next) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	next();
};

// GET Profile View
router.get("/", requireAuth, async (req, res) => {
	try {
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", req.session.userId)
			.single();

		if (error) throw error;

		res.render("user/profile", { title: "My Profile", user });
	} catch (error) {
		console.error("Error loading profile:", error);
		res.status(500).send("Error loading profile");
	}
});

// POST Update Profile Info
router.post(
	"/update",
	requireAuth,
	upload.single("photo"),
	async (req, res) => {
		try {
			const { username, email } = req.body;

			const updateData = { username, email };

			if (req.file) {
				updateData.photo_url = "/uploads/" + req.file.filename;
			}

			const { error } = await supabase
				.from("users")
				.update(updateData)
				.eq("id", req.session.userId);

			if (error) throw error;

			// Update session username if needed
			req.session.username = username;

			res.redirect("/profile");
		} catch (error) {
			console.error("Error updating profile:", error);
			res.status(500).send("Error updating profile: " + error.message);
		}
	}
);

// POST Change Password
router.post("/password", requireAuth, async (req, res) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = req.body;

		if (newPassword !== confirmPassword) {
			return res.status(400).send("New passwords do not match");
		}

		// Use Supabase Auth to update password
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) {
			console.error("Password update error:", error);
			return res.status(500).send("Error changing password: " + error.message);
		}

		res.redirect("/profile");
	} catch (error) {
		console.error("Error changing password:", error);
		res.status(500).send("Error changing password");
	}
});

module.exports = router;
