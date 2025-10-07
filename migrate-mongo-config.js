require('dotenv').config();

module.exports = {
  mongodb: {
    url: String(process.env.MONGO_URI),
    databaseName: "test",
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
};
