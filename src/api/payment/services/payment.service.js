const PAYPAL_PLAN_MONTHLY = process.env.PAYPAL_PLAN_MONTHLY;
const PAYPAL_PLAN_SIXMONTH = process.env.PAYPAL_PLAN_SIXMONTH;
const PAYPAL_PLAN_TWELVEMONTH = process.env.PAYPAL_PLAN_TWELVEMONTH;

module.exports = {
  /**
   * Save the data to DB for Stripe
   */
  setStripeSubscriberRoleById: async (checkoutSessionCompleted, role) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: checkoutSessionCompleted.client_reference_id },
          data: {
            role,
            stripeCustomerId: checkoutSessionCompleted.customer,
            payment: JSON.stringify(
              module.exports.customerStripeModel(checkoutSessionCompleted)
            ),
          },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  setStripeSubscriberRoleByCustomerId: async (id, role, data) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { stripeCustomerId: id },
          role,
          data: {
            payment: JSON.stringify(data),
          },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  /**
   * Save the data to DB for PayPal
   */
  setPayPalSubscriberRoleById: async (checkoutSessionCompleted) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: checkoutSessionCompleted.custom_id },
          data: {
            role: 3,
            payment: JSON.stringify(
              module.exports.customerPayPalModel(checkoutSessionCompleted)
            ),
          },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  /**
   * Stripe models to save
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

    await module.exports.setStripeSubscriberRoleByCustomerId(
      customerPaymentData.stripeCustomerId,
      module.exports.getRole(dataFromStripe.status),
      payment
    );
  },

  getRole(status) {
    return status === "active" ? 3 : 1;
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

  /**
   * Get data from DB
   */
  getUserData: async (id) => {
    try {
      return await strapi.query("plugin::users-permissions.user").findOne({
        where: { id: id },
      });
    } catch (err) {
      return err;
    }
  },

  getUserDataByStripeCustomerId: async (stripeCustomerId) => {
    try {
      const customer = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { stripeCustomerId: stripeCustomerId },
        });

      return customer;
    } catch (err) {
      return err;
    }
  },
};
