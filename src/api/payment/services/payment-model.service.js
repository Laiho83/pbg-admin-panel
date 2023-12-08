const PAYPAL_PLAN_MONTHLY = process.env.PAYPAL_PLAN_MONTHLY;
const PAYPAL_PLAN_SIXMONTH = process.env.PAYPAL_PLAN_SIXMONTH;
const PAYPAL_PLAN_TWELVEMONTH = process.env.PAYPAL_PLAN_TWELVEMONTH;

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
    const currentPeriodStart = new Date(
      dataFromStripe.current_period_start * 1000
    );
    const currentPeriodEnd = new Date(dataFromStripe.current_period_end * 1000);
    const monthlySubscription = dataFromStripe.plan.amount
      ? parseInt((dataFromStripe.plan.amount / 10000) * 12)
      : customerPaymentData.subscription.type;
    const endDate =
      dataFromStripe.cancel_at_period_end == true
        ? dataFromStripe.cancel_at
        : "When cancelled";

    payment.subscription.id = dataFromStripe.id;
    payment.subscription.type = monthlySubscription;
    payment.subscription.invoice =
      dataFromStripe.latest_invoice ?? payment.subscription.invoice;
    payment.subscription.status =
      dataFromStripe.status ?? payment.subscription.status;
    payment.subscription.currentPeriodStart =
      currentPeriodStart ?? payment.subscription.currentPeriodStart;
    payment.subscription.currentPeriodEnd =
      currentPeriodEnd ?? payment.subscription.currentPeriodEnd;
    payment.subscription.endDate = endDate ?? payment.subscription.endDate;

    return payment;
  },

  customerStripeDelete(dataFromStripe, customerPaymentData) {
    const payment = customerPaymentData.payment;
    const endDate = dataFromStripe.cancel_at
      ? new Date(dataFromStripe.cancel_at * 1000)
      : new Date(dataFromStripe.canceled_at * 1000);

    payment.subscription.id = dataFromStripe.id;
    payment.subscription.endDate = endDate;
    payment.subscription.status = "Canceled";

    return payment;
  },

  /**
   * Paypal models
   */
  customerPayPalModel(checkoutSessionCompleted) {
    return {
      provider: "paypal",
      payPalCustomerId: checkoutSessionCompleted.subscriber.payer_id,
      payPalEmail: checkoutSessionCompleted.subscriber.email_address,
      subscription: {
        id: checkoutSessionCompleted.id,
        // invoice: checkoutSessionCompleted.invoice,
        type: module.exports.getPayPalType(checkoutSessionCompleted.plan_id),
        startDate: checkoutSessionCompleted.start_time,
        currentPeriodStart: checkoutSessionCompleted.update_time,
        currentPeriodEnd:
          checkoutSessionCompleted.billing_info.next_billing_time,
        endDate: "When cancelled",
        status: checkoutSessionCompleted.status,
      },
    };
  },

  /**
   * Paypal models
   */
  customerPayPalModelDelete(checkoutSessionCompleted) {
    return {
      provider: "paypal",
      payPalCustomerId: checkoutSessionCompleted.subscriber.payer_id,
      payPalEmail: checkoutSessionCompleted.subscriber.email_address,
      subscription: {
        id: checkoutSessionCompleted.id,
        // invoice: checkoutSessionCompleted.invoice,
        type: module.exports.getPayPalType(checkoutSessionCompleted.plan_id),
        startDate: checkoutSessionCompleted.start_time,
        currentPeriodStart: checkoutSessionCompleted.update_time,
        currentPeriodEnd: checkoutSessionCompleted.status_update_time,
        endDate: checkoutSessionCompleted.status_update_time,
        status: checkoutSessionCompleted.status,
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
    return status.toLowerCase() === "active" ? 3 : 1;
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
