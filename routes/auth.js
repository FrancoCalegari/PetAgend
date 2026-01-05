const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");

// GET Register View
router.get("/register", (req, res) => {
	res.render("auth/register", { title: "Register" });
});

// POST Register
router.post("/register", async (req, res) => {
	try {
		const { username, password } = req.body;
		await User.create({ username, password });
		res.redirect("/auth/login");
	} catch (error) {
		console.error(error);
		res.status(500).send("Error registering user");
	}
});

// GET Login View
router.get("/login", (req, res) => {
	res.render("auth/login", { title: "Login" });
});

// POST Login
router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ where: { username } });

		if (!user) {
			return res.status(401).send("Invalid credentials");
		}

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(401).send("Invalid credentials");
		}

		req.session.userId = user.id;
		res.redirect("/dashboard");
	} catch (error) {
		console.error(error);
		res.status(500).send("Error logging in");
	}
});

// GET Logout
router.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/");
});

module.exports = router;
