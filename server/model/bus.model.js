import sequelize from "../config/connectdb.js";
import { DataTypes, Model } from "sequelize";

class Bus extends Model {
  // Static methods for bus operations
  static async findByRoute(routeId) {
    return await Bus.findAll({
      where: {
        routeId: routeId,
        isActive: true,
      },
    });
  }

  static async findAvailableBuses() {
    return await Bus.findAll({
      where: {
        isActive: true,
        status: "available",
      },
      include: ["route"], // Include associated route
    });
  }

  static async findByBusNumber(busNumber) {
    return await Bus.findOne({ where: { busNumber } });
  }

  static async findByDriverId(driverId) {
    return await Bus.findAll({ where: { driverId } });
  }
}

Bus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    busNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    busType: {
      type: DataTypes.ENUM("standard", "luxury", "semi-luxury", "sleeper"),
      allowNull: false,
      defaultValue: "standard",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 10,
        max: 35,
      },
    },
    routeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "routes",
        key: "id",
      },
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null if no driver assigned
      references: {
        model: "users", // Assuming drivers are users with role 'driver'
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "available",
        "in-transit",
        "maintenance",
        "out-of-service"
      ),
      allowNull: false,
      defaultValue: "available",
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearOfManufacture: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1950,
        max: new Date().getFullYear() + 1,
      },
    },
    lastMaintenanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nextMaintenanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    amenities: {
      type: DataTypes.JSON, // Array of amenities like ['WiFi', 'AC', 'TV', 'USB Charging']
      allowNull: true,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Bus",
    tableName: "buses",
    timestamps: true,
    indexes: [
      {
        fields: ["busNumber"],
        unique: true,
      },
      {
        fields: ["licensePlate"],
        unique: true,
      },
      {
        fields: ["routeId"],
      },
      {
        fields: ["driverId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["isActive"],
      },
    ],
  }
);

export default Bus;
