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
    const periodEnd = new Date(
      paymentModel.subscription.currentPeriodEnd
    ).toISOString();

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
            subscriptionStatus:
              module.exports.getStripeSubscriptionStatus("active"),
            stripeCustomerId: checkoutSessionCompleted.customer,
            currentPeriodEnd: periodEnd,
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
    const periodEnd = new Date(
      paymentModel.subscription.currentPeriodEnd
    ).toISOString();

    const status =
      data.cancel_at_period_end == true
        ? "pending_cancelation"
        : data.status.toLowerCase();

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { stripeCustomerId: customerId },
          data: {
            role: paymentModelService.getRole(data.status),
            orderId: `#${orderId++}`,
            subscriptionStatus:
              module.exports.getStripeSubscriptionStatus(status),
            subscriptionType: module.exports.getTypeSubscription(
              paymentModel.subscription.type
            ),
            currentPeriodEnd: periodEnd,
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

    const periodEnd = new Date(paymentModel.subscription.endDate).toISOString();

    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { stripeCustomerId: customerId },
          data: {
            role: 1,
            subscriptionType: module.exports.getTypeSubscription(0),
            subscriptionStatus:
              module.exports.getStripeSubscriptionStatus("delete"),
            currentPeriodEnd: periodEnd,
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
            subscriptionStatus: module.exports.getPayPalSubscriptionStatus(
              payPalModel.subscription.status.toLowerCase() ?? "none"
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
            subscriptionStatus:
              module.exports.getPayPalSubscriptionStatus("canceled"),
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

  getStripeSubscriptionStatus: (type) => {
    const typeSubscription = {
      none: "None",
      active: "Active",
      pending_cancelation: "Pending Cancellation",
      past_due: "On Hold",
      delete: "Canceled",
    };

    return typeSubscription[type];
  },

  getPayPalSubscriptionStatus: (type) => {
    const typeSubscription = {
      none: "None",
      active: "Active",
      pending_cancelation: "Pending Cancellation",
      suspended: "On Hold",
      paused: "On Hold",
      cancelled: "Canceled",
      canceled: "Canceled",
    };

    return typeSubscription[type];
  },
};
