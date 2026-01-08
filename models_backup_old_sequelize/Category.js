const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/connection");

const Category = sequelize.define("Category", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	is_custom: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
});

module.exports = Category;
