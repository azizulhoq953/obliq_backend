"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const database_options_1 = require("./database-options");
const AppDataSource = new typeorm_1.DataSource((0, database_options_1.createDatabaseOptions)(process.env));
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map