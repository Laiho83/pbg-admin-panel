module.exports = {
  routes: [
    {
      method: "POST",
      path: "/user-update-email/:id",
      handler: "user.updateEmail",
      config: {
        policies: ["global::hasPermissions"],
      },
    },
  ],
};
