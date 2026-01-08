const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: path.join(__dirname, "database.sqlite"), // Database file
	logging: false, // Disable logging SQL queries to console
});

module.exports = { sequelize };
