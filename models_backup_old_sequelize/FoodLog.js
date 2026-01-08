const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/connection");

const FoodLog = sequelize.define("FoodLog", {
	food_name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	quantity: {
		type: DataTypes.STRING,
	},
	fed_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
	notes: {
		type: DataTypes.TEXT,
	},
	// Foreign key (petId) will be added via associations
});

module.exports = FoodLog;
