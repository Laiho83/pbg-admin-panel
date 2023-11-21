const paymentModelService = require("./payment-model.service");

const PAYPAL_PLAN_MONTHLY = process.env.PAYPAL_PLAN_MONTHLY;
const PAYPAL_PLAN_SIXMONTH = process.env.PAYPAL_PLAN_SIXMONTH;
const PAYPAL_PLAN_TWELVEMONTH = process.env.PAYPAL_PLAN_TWELVEMONTH;

let orderId = 8492;

module.exports = {
  /**
   * Sets Stripe payment field and stripeCustomerId on first subscription, when field is empty
   * Role - is always 3 - subscriber
   */
  setStripePaymentOnFirstSubscriptionCreated: async (
    checkoutSessionCompleted
  ) => {
    const role = 3;
    const paymentModel = paymentModelService.customerStripeModel(
      checkoutSessionCompleted
    );

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: checkoutSessionCompleted.client_reference_id },
          data: {
            role,
            orderId: `#${orderId++}`,
            stripeCustomerId: checkoutSessionCompleted.customer,
            currentPeriodEnd: paymentModel.subscription.currentPeriodEnd,
            payment: JSON.stringify(paymentModel),
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
   * Sets Stripe payment field and role on update (renewel, delete, ...)
   * Role: 3 - subscriber, 1 - Authenticated
   * Checks if customer payment data exist in DB if not returns nul.
   * In the above case, It's usually first subscription case and we have to continue to setStripePaymentOnFirstSubscriptionCreated (handled in function that envokes this one)
   */
  setStripePaymentOnUpdate: async (data, customerPaymentData) => {
    const customerId = data.customer;

    const paymentModel = paymentModelService.customerStripeUpdate(
      data,
      customerPaymentData
    );

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { stripeCustomerId: customerId },
          data: {
            role: paymentModelService.getRole(data.status),
            orderId: `#${orderId++}`,
            currentPeriodEnd: paymentModel.subscription.currentPeriodEnd,
            payment: JSON.stringify(paymentModel),
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
   * Sets Stripe payment field and role on update (renewel, delete, ...)
   * Role: 3 - subscriber, 1 - Authenticated
   * Checks if customer payment data exist in DB if not returns nul.
   * In the above case, It's usually first subscription case and we have to continue to setStripePaymentOnFirstSubscriptionCreated (handled in function that envokes this one)
   */
  setStripePaymentOnDelete: async (data, customerPaymentData) => {
    const customerId = data.customer;

    const paymentModel = paymentModelService.customerStripeDelete(
      data,
      customerPaymentData
    );

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { stripeCustomerId: customerId },
          data: {
            role: 1,
            currentPeriodEnd: paymentModel.subscription.endDate,
            payment: JSON.stringify(paymentModel),
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

  setOrderId: (customerId) => {
    return `#${customerId}00`;
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
