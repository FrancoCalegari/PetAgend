const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/connection");
const bcrypt = require("bcrypt");

const User = sequelize.define(
	"User",
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isEmail: {
					msg: "Must be a valid email address",
				},
			},
			set(value) {
				// Convert empty string to null to avoid validation error
				this.setDataValue("email", value === "" ? null : value);
			},
		},
		photo_url: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		hooks: {
			beforeCreate: async (user) => {
				const salt = await bcrypt.genSalt(10);
				user.password = await bcrypt.hash(user.password, salt);
			},
		},
	}
);

module.exports = User;
