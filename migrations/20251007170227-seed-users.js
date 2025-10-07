
module.exports = {
  async up(db, client) {
    const users = [
      { username: "user", email: "user@example.com", role: "user" },
      { username: "admin", email: "admin@example.com", role: "admin" },
      { username: "support", email: "support@example.com", role: "support" },
      {
        username: "moderator",
        email: "moderator@example.com",
        role: "moderator",
      },
      { username: "random user", email: "demo@example.com", role: "user" },
    ];

    await db.collection("users").insertMany(users);
    console.log("5 users seeded successfully");
  },

  async down(db, client) {
    await db.collection("users").deleteMany({
      username: {
        $in: ["user", "admin", "support", "moderator", "random user"],
      },
    });
    console.log("✅ Seeded users removed");
  },
};
