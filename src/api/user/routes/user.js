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
    {
      method: "POST",
      path: "/user-welcome-email/:id",
      handler: "user.welcomeEmail",
      config: {
        policies: ["global::hasPermissions"],
      },
    },
    {
      method: "GET",
      path: "/user-password-renewel",
      handler: "user.passwordRenewel",
    },
    {
      method: "POST",
      path: "/user-password-renewel/:id",
      handler: "user.passwordRenewelUpdate",
    },
  ],
};
