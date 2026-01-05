const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/connection");

const Pet = sequelize.define("Pet", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	surname: {
		type: DataTypes.STRING,
	},
	dni: {
		type: DataTypes.STRING,
	},
	blood_type: {
		type: DataTypes.STRING,
	},
	photo_url: {
		type: DataTypes.STRING,
	},
	// Foreign keys (userId, categoryId) will be added via associations
});

module.exports = Pet;
