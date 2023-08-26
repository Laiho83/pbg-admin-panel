module.exports = {
  paymentModel() {
    return {
      // stripe || paypal
      providerActive: {
        stripe: false,
        paypal: false,
      },
      stripeCustomId: "",
      paypalCustomId: "",
      stripeEmail: "",
      paypalEmail: "",
      subscription: {
        type: "",
        startDate: "",
        endDate: "",
      },
    };
  },
};
