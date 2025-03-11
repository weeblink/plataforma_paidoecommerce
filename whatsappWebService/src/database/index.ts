import { Sequelize } from "sequelize-typescript";

// eslint-disable-next-line
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);

export default sequelize;