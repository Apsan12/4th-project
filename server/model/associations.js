import User from "./user.model.js";
import Route from "./route.model.js";
import Bus from "./bus.model.js";
import Booking from "./booking.model.js";

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

// User and Booking associations
User.hasMany(Booking, {
  foreignKey: "userId",
  as: "bookings",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Booking.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Bus and Booking associations
Bus.hasMany(Booking, {
  foreignKey: "busId",
  as: "bookings",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Booking.belongsTo(Bus, {
  foreignKey: "busId",
  as: "bus",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export { User, Route, Bus, Booking };
