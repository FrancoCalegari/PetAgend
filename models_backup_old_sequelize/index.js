const { sequelize } = require("../database/connection");
const User = require("./User");
const Pet = require("./Pet");
const Category = require("./Category");
const MedicalDoc = require("./MedicalDoc");
const FoodLog = require("./FoodLog");

// Define Associations

// User has many Pets
User.hasMany(Pet, { foreignKey: "userId" });
Pet.belongsTo(User, { foreignKey: "userId" });

// Category has many Pets
Category.hasMany(Pet, { foreignKey: "categoryId" });
Pet.belongsTo(Category, { foreignKey: "categoryId" });

// Pet has many MedicalDocs
Pet.hasMany(MedicalDoc, { foreignKey: "petId" });
MedicalDoc.belongsTo(Pet, { foreignKey: "petId" });

// Pet has many FoodLogs
Pet.hasMany(FoodLog, { foreignKey: "petId" });
FoodLog.belongsTo(Pet, { foreignKey: "petId" });

module.exports = {
	User,
	Pet,
	Category,
	MedicalDoc,
	FoodLog,
	sequelize,
};
