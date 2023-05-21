module.exports = {
  routes: [
    {
      method: "GET",
      path: "/setSubscriberRole/:id",
      handler: "stripe.setSubscriberRole",
      config: {
        policies: ["global::hasPermissions"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/create-customer/:id",
      handler: "stripe.createCustomer",
      config: {
        policies: ["global::hasPermissions"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/exampleAction/:id",
      handler: "stripe.exampleAction",
      config: {
        policies: ["global::hasPermissions"],
        middlewares: [],
      },
    },
  ],
};
