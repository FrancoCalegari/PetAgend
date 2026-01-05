const express = require("express");
const path = require("path");
const session = require("express-session");
const { sequelize, User } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
	session({
		secret: "petagent_secret_key_123", // In production, use environment variable
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false }, // Set to true if using HTTPS
	})
);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/pets", require("./routes/pets"));
app.use("/profile", require("./routes/profile"));

app.get("/", (req, res) => {
	if (req.session.userId) {
		return res.redirect("/dashboard");
	}
	res.render("index", { title: "PetAgent" });
});

// Database Sync and Server Start
sequelize
	.sync({ force: false }) // Don't drop tables, just sync
	.then(async () => {
		console.log("Database synchronized.");

		// Seed default categories if empty
		const { Category } = require("./models");
		const count = await Category.count();
		if (count === 0) {
			await Category.bulkCreate([
				{ name: "Dog" },
				{ name: "Cat" },
				{ name: "Bird" },
				{ name: "Other" }, // Pre-create 'Other' or handle it dynamically?
				// Actually 'other' in dropdown is special value. Let's just seed common ones.
			]);
			console.log("Default categories seeded.");
		}

		app.listen(PORT, () => {
			console.log(`Server running at http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Unable to connect to the database:", err);
	});
