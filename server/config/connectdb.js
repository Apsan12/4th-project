import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false, // <-- disable all SQL query logs
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "require"
          ? { require: true, rejectUnauthorized: false }
          : false,
    },
  }
);

export default sequelize;

export async function connectDB(retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connected successfully."); // only log on success
      return sequelize;
    } catch (error) {
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error; // throw only if all retries fail
      }
    }
  }
}
