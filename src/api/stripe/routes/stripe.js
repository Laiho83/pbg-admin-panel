module.exports = {
  routes: [
    {
      method: "POST",
      path: "/create-subscription/:id",
      handler: "stripe.createSubscription",
      config: {
        policies: ["global::hasPermissions"],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/create-customer/:id",
      handler: "stripe.createCustomer",
      config: {
        policies: ["global::hasPermissions"],
        middlewares: [],
      },
    },
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
      method: "POST",
      path: "/webhook",
      handler: "stripe.webhook",
      config: {
        middlewares: [],
      },
    },
  ],
};
