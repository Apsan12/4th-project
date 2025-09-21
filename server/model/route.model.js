import sequelize from "../config/connectdb.js";
import { DataTypes, Model } from "sequelize";

class Route extends Model {
  // Static methods for route operations
  static async findByOriginDestination(origin, destination) {
    return await Route.findAll({
      where: {
        origin: origin,
        destination: destination,
        isActive: true,
      },
    });
  }

  static async findActiveRoutes() {
    return await Route.findAll({
      where: { isActive: true },
      include: ["buses"], // Include associated buses
    });
  }

  static async findByRouteCode(routeCode) {
    return await Route.findOne({ where: { routeCode } });
  }
}

Route.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    routeCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    routeName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    estimatedDuration: {
      type: DataTypes.INTEGER, // Duration in minutes
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    fare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    stops: {
      type: DataTypes.JSON, // Array of stop objects [{name: "Stop1", order: 1}, ...]
      allowNull: true,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Route",
    tableName: "routes",
    timestamps: true,
    indexes: [
      {
        fields: ["routeCode"],
        unique: true,
      },
      {
        fields: ["origin", "destination"],
      },
      {
        fields: ["isActive"],
      },
    ],
  }
);

export default Route;
