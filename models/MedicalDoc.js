const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/connection");

const MedicalDoc = sequelize.define("MedicalDoc", {
	doctor_name: {
		type: DataTypes.STRING,
	},
	date: {
		type: DataTypes.DATEONLY,
	},
	info: {
		type: DataTypes.TEXT,
	},
	file_url: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	file_type: {
		type: DataTypes.STRING,
	},
	// Foreign key (petId) will be added via associations
});

module.exports = MedicalDoc;
