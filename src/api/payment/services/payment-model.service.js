module.exports = {
  /**
   * Stripe models to save
   * monthlySubscription: calculated from price
   *    - number of month (1-1month, 6-6month, 12-12month)
   */
  customerStripeModel(checkoutSessionCompleted) {
    const createdDate = new Date(checkoutSessionCompleted.created * 1000);
    const endDateTemplate = new Date(checkoutSessionCompleted.created * 1000);
    const monthlySubscription = parseInt(
      (checkoutSessionCompleted.amount_total / 10000) * 12
    );

    return {
      provider: "stripe",
      stripeCustomerId: checkoutSessionCompleted.customer,
      stripeEmail: checkoutSessionCompleted.customer_details.email,
      subscription: {
        id: checkoutSessionCompleted.subscription,
        invoice: checkoutSessionCompleted.invoice,
        type: monthlySubscription,
        startDate: createdDate,
        renewalDate: new Date(
          endDateTemplate.setMonth(
            endDateTemplate.getMonth() + monthlySubscription
          )
        ),
        cancelData: "",
        status: "active",
      },
    };
  },

  async customerStripeUpdate(dataFromStripe, customerPaymentData) {
    const payment = customerPaymentData.payment;

    payment.subscription.invoice = dataFromStripe.latest_invoice;
    payment.subscription.status = dataFromStripe.status;
    payment.subscription.renewalDate = new Date(
      dataFromStripe.current_period_end * 1000
    );

    return payment;
  },

  /**
   * Paypal models
   */
  customerPayPalModel(checkoutSessionCompleted) {
    return {
      provider: "paypal",
      paypalCustomId: checkoutSessionCompleted.id,
      subscription: {
        type: module.exports.customerPayPalModel(
          checkoutSessionCompleted.plan_id
        ),
        startDate: checkoutSessionCompleted.update_time,
        endDate: checkoutSessionCompleted.billing_info.next_billing_time,
      },
    };
  },

  /**
   * Helper functions
   * getRole: Role: 3 - subscriber, 1 - Authenticated
   * getPayPalType: monthlySubscription: calculated from paypal subscritpion ids
   *      (1-1month, 6-6month, 12-12month)
   */
  getRole(status) {
    return status === "active" ? 3 : 1;
  },

  getPayPalType(type) {
    switch (type) {
      case PAYPAL_PLAN_MONTHLY:
        return 1;
      case PAYPAL_PLAN_SIXMONTH:
        return 6;
      case PAYPAL_PLAN_TWELVEMONTH:
        return 12;
      default:
        return 1;
    }
  },
};
