const paymentModelService = require("./payment-model.service");

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
            paymentType: "Stripe",
            subscriptionType: module.exports.getTypeSubscription(
              paymentModel.subscription.type
            ),
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
            subscriptionType: module.exports.getTypeSubscription(
              paymentModel.subscription.type
            ),
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
            subscriptionType: module.exports.getTypeSubscription(0),
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
   * Update the data to DB PayPal
   */
  setPayPalSubscriptionCreatedAndUpdate: async (checkoutSessionCompleted) => {
    const payPalModel = paymentModelService.customerPayPalModel(
      checkoutSessionCompleted
    );

    let selection = {};

    if (checkoutSessionCompleted.hasOwnProperty("custom_id")) {
      selection = { id: checkoutSessionCompleted.custom_id };
    } else {
      selection = { paypalSubscriptionId: checkoutSessionCompleted.id };
    }

    console.log(selection);

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: selection,
          data: {
            role: 3,
            orderId: `#${orderId++}`,
            paymentType: "PayPal",
            paypalSubscriptionId: payPalModel.subscription.id,
            subscriptionType: module.exports.getTypeSubscription(
              payPalModel.subscription.type
            ),
            currentPeriodEnd: payPalModel.subscription.currentPeriodEnd,
            payment: JSON.stringify(payPalModel),
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
  setPayPalSubscriptionDeleted: async (checkoutSessionCompleted) => {
    const payPalModel = paymentModelService.customerPayPalModelDelete(
      checkoutSessionCompleted
    );

    let selection = {};

    if (checkoutSessionCompleted.hasOwnProperty("custom_id")) {
      selection = { id: checkoutSessionCompleted.custom_id };
    } else {
      selection = { paypalSubscriptionId: checkoutSessionCompleted.id };
    }

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: selection,
          data: {
            role: 1,
            orderId: "",
            subscriptionType: module.exports.getTypeSubscription(0),
            currentPeriodEnd: payPalModel.subscription.currentPeriodEnd,
            payment: JSON.stringify(payPalModel),
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
   * Get Subscription type
   * @param (type) - number .. type number
   *   1 = 'Monthly',
   *   6 = 'Half year',
   *   12 = 'Yearly',
   */
  getTypeSubscription: (type) => {
    const typeSubscription = {
      0: "None",
      1: "Monthly",
      6: "Half Year",
      12: "Yearly",
    };

    return typeSubscription[type];
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
