const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const upload = require("../middleware/upload");
const path = require("path");

// Middleware to check auth
const requireAuth = (req, res, next) => {
	if (!req.session.userId) return res.redirect("/auth/login");
	next();
};

// GET Profile View
router.get("/", requireAuth, async (req, res) => {
	try {
		const user = await User.findByPk(req.session.userId);
		res.render("user/profile", { title: "My Profile", user });
	} catch (error) {
		console.error(error);
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
			const user = await User.findByPk(req.session.userId);
			const { username, email } = req.body;

			const updateData = { username, email };

			if (req.file) {
				updateData.photo_url = "/uploads/" + req.file.filename;
			}

			await user.update(updateData);
			res.redirect("/profile");
		} catch (error) {
			console.error(error);
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

		const user = await User.findByPk(req.session.userId);
		const validPassword = await bcrypt.compare(currentPassword, user.password);

		if (!validPassword) {
			return res.status(401).send("Incorrect current password");
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update manually to bypass hook if needed, or rely on hook if it handles updates (hooks usually run on update if configured)
		// Sequelize hooks: beforeCreate, beforeUpdate. User model only has beforeCreate.
		// So we hash manually here.

		await user.update({ password: hashedPassword });

		res.redirect("/profile");
	} catch (error) {
		console.error(error);
		res.status(500).send("Error changing password");
	}
});

module.exports = router;
