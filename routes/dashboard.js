const express = require("express");
const router = express.Router();
const { Pet, Category } = require("../models");

router.get("/", async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}
	try {
		const { User, Pet, Category } = require("../models");
		const user = await User.findByPk(req.session.userId);
		const pets = await Pet.findAll({
			where: { userId: req.session.userId },
			include: Category,
		});
		res.render("dashboard", { title: "Dashboard", pets, user });
	} catch (error) {
		console.error(error);
		res.status(500).send("Error loading dashboard");
	}
});

module.exports = router;
