module.exports = {
  routes: [
    {
      method: "POST",
      path: "/webhook",
      handler: "stripe.webhook",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/payPal",
      handler: "stripe.webhookPayPal",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/bank-payment/:id",
      handler: "stripe.bankPayment",
      config: {
        policies: ["global::hasPermissions"],
      },
    },
  ],
};
