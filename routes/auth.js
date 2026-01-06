const express = require("express");
const router = express.Router();
const supabase = require("../database/supabase");

// Register
router.post("/register", async (req, res) => {
	const { username, email, password } = req.body;

	try {
		// Create auth user in Supabase
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				emailRedirectTo: undefined, // Disable email confirmation
			},
		});

		if (authError) {
			console.error("Supabase auth error:", authError);
			return res.status(400).send(`Registration failed: ${authError.message}`);
		}

		// Create user profile in users table
		const { error: profileError } = await supabase.from("users").insert([
			{
				id: authData.user.id,
				username: username,
				email: email,
				photo_url: null,
			},
		]);

		if (profileError) {
			console.error("Profile creation error:", profileError);
			return res
				.status(400)
				.send(`Profile creation failed: ${profileError.message}`);
		}

		// Set session
		req.session.userId = authData.user.id;
		req.session.username = username;

		res.redirect("/dashboard");
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).send("Server error during registration");
	}
});

// Login
router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	try {
		// Check if username is an email
		const isEmail = username.includes("@");
		let email = username;

		// If not email, try to find user by username to get their email
		if (!isEmail) {
			const { data: profile, error: profileError } = await supabase
				.from("users")
				.select("email")
				.eq("username", username)
				.single();

			if (profileError || !profile || !profile.email) {
				return res.status(401).send("Invalid credentials");
			}
			email = profile.email;
		}

		// Sign in with Supabase Auth
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		if (error) {
			console.error("Login error:", error);
			return res.status(401).send("Invalid credentials");
		}

		// Get user profile
		const { data: profile, error: profileError } = await supabase
			.from("users")
			.select("*")
			.eq("id", data.user.id)
			.single();

		if (profileError) {
			console.error("Profile fetch error:", profileError);
			return res.status(500).send("Error fetching user profile");
		}

		// Set session
		req.session.userId = data.user.id;
		req.session.username = profile.username;
		req.session.supabaseToken = data.session.access_token;

		res.redirect("/dashboard");
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).send("Server error during login");
	}
});

// Logout
router.get("/logout", async (req, res) => {
	try {
		// Sign out from Supabase
		await supabase.auth.signOut();

		// Destroy session
		req.session.destroy((err) => {
			if (err) console.error("Session destroy error:", err);
			res.redirect("/");
		});
	} catch (error) {
		console.error("Logout error:", error);
		res.redirect("/");
	}
});

// Login page
router.get("/login", (req, res) => {
	res.render("auth/login", { title: "Login" });
});

// Register page
router.get("/register", (req, res) => {
	res.render("auth/register", { title: "Register" });
});

module.exports = router;
