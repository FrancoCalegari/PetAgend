const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const supabase = require("./database/supabase");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
	session({
		secret: process.env.SESSION_SECRET || "petagent_secret_key_123",
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false },
	})
);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/pets", require("./routes/pets"));
app.use("/profile", require("./routes/profile"));

// Dashboard route
app.get("/dashboard", async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/auth/login");
	}

	try {
		// Fetch user
		const { data: user, error: userError } = await supabase
			.from("users")
			.select("*")
			.eq("id", req.session.userId)
			.single();

		if (userError) throw userError;

		// Fetch pets with categories
		const { data: pets, error: petsError } = await supabase
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
			.eq("user_id", req.session.userId)
			.order("created_at", { ascending: false });

		if (petsError) throw petsError;

		// Transform data to match old structure
		const transformedPets = (pets || []).map((pet) => ({
			...pet,
			Category: pet.categories,
		}));

		res.render("dashboard", {
			title: "Dashboard",
			pets: transformedPets,
			user: user,
		});
	} catch (error) {
		console.error("Dashboard error:", error);
		res.status(500).send("Error loading dashboard");
	}
});

// Root route
app.get("/", (req, res) => {
	if (req.session.userId) {
		return res.redirect("/dashboard");
	}
	res.render("index", { title: "PetAgent" });
});

// Start Server
app.listen(PORT, () => {
	console.log(`🚀 Server running at http://localhost:${PORT}`);
	console.log(`📊 Using Supabase PostgreSQL database`);
	console.log(`🔐 Supabase Auth enabled`);
});
