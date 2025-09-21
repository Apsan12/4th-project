import User from "./user.model.js";
import Route from "./route.model.js";
import Bus from "./bus.model.js";

// Define associations between models

// Route and Bus associations
Route.hasMany(Bus, {
  foreignKey: "routeId",
  as: "buses",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Bus.belongsTo(Route, {
  foreignKey: "routeId",
  as: "route",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// User (Driver) and Bus associations
User.hasMany(Bus, {
  foreignKey: "driverId",
  as: "buses",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Bus.belongsTo(User, {
  foreignKey: "driverId",
  as: "driver",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

export { User, Route, Bus };
