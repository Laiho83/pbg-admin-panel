module.exports = {
  routes: [
    {
      method: "POST",
      path: "/webhook-stripe",
      handler: "payment.webhookStripe",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/webhook-paypal",
      handler: "payment.webhookPayPal",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/bank-payment/:id",
      handler: "payment.bankPayment",
      config: {
        policies: ["global::hasPermissions"],
      },
    },
  ],
};
