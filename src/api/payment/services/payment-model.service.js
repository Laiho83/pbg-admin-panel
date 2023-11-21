module.exports = {
  /**
   * Stripe models to save
   * monthlySubscription: calculated from price
   *    - number of month (1-1month, 6-6month, 12-12month)
   * endDate: 'When cancelled' or cancelation date
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
        currentPeriodStart: createdDate,
        currentPeriodEnd: new Date(
          endDateTemplate.setMonth(
            endDateTemplate.getMonth() + monthlySubscription
          )
        ),
        endDate: "When cancelled",
        status: "active",
      },
    };
  },

  customerStripeUpdate(dataFromStripe, customerPaymentData) {
    const payment = customerPaymentData.payment;
    const monthlySubscription = dataFromStripe.plan.amount
      ? parseInt((dataFromStripe.plan.amount / 10000) * 12)
      : customerPaymentData.subscription.type;

    payment.subscription.id = dataFromStripe.id;
    payment.subscription.type = monthlySubscription;
    payment.subscription.invoice = dataFromStripe.latest_invoice;
    payment.subscription.status = dataFromStripe.status;
    payment.subscription.currentPeriodStart = new Date(
      dataFromStripe.current_period_start * 1000
    );
    payment.subscription.currentPeriodEnd = new Date(
      dataFromStripe.current_period_end * 1000
    );

    return payment;
  },

  customerStripeDelete(dataFromStripe, customerPaymentData) {
    const payment = customerPaymentData.payment;
    const endDate = dataFromStripe.cancel_at
      ? new Date(dataFromStripe.cancel_at * 1000)
      : new Date(dataFromStripe.canceled_at * 1000);

    payment.subscription.id = dataFromStripe.id;
    payment.subscription.endDate = endDate;

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
