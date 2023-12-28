const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_END_POINT_SECRET;

const stripe = require("stripe")(STRIPE_SECRET_KEY);
const unparsed = require("koa-body/unparsed.js");

const paymentService = require("../services/payment.service");

module.exports = {
  async stripe(ctx) {
    const body = ctx.request.body[unparsed];
    const signature = ctx.request.headers["stripe-signature"];

    let event;

    try {
      event = await stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
    } catch (err) {
      return [400, `Stripe Error: Verification failed, ${err}`];
    }

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
        try {
          await module.exports.stripeUpdateSubscription(event.data.object);
          // console.log("Subscription created:");
          // console.log(event.data.object);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      case "checkout.session.completed":
        try {
          await module.exports.stripeCheckoutCompleted(event.data.object);
          // console.log("Checkout completed:");
          // console.log(event.data.object);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      case "customer.subscription.updated":
        try {
          await module.exports.stripeUpdateSubscription(event.data.object);
          // console.log("Subscription updated:");
          // console.log(event.data.object);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      case "customer.subscription.deleted":
        try {
          await module.exports.stripeDeleteSubscription(event.data.object);
          // console.log("Subscription updated:");
          // console.log(event.data.object);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }
      default:
        return [400, "Stripe Error: Event type does not exist"];
    }
  },

  /**
   * Sets Stripe first subscription creation
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async stripeCheckoutCompleted(event) {
    try {
      await paymentService.setStripePaymentOnFirstSubscriptionCreated(event);

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Sets Stripe payment field on update (renewel, delete, ...)
   * Role: 3 - subscriber, 1 - Authenticated
   * setStripePaymentOnUpdate methos hecks if customer payment data exist in DB if not returns nul.
   * In the above case, It's usually first subscription case and we have to continue to stripeCheckoutCompleted (handled in function that envokes this one)
   */
  async stripeUpdateSubscription(stripeObj) {
    const customerId = stripeObj.customer;
    const customerPaymentData = await module.exports.getuserData(customerId);

    if (!customerPaymentData) {
      return;
    }

    try {
      await paymentService.setStripePaymentOnUpdate(
        stripeObj,
        customerPaymentData
      );

      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Deleted subscription
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async stripeDeleteSubscription(stripeObj) {
    const customerId = stripeObj.customer;
    const customerPaymentData = await module.exports.getuserData(customerId);

    if (!customerPaymentData) {
      return;
    }

    try {
      await paymentService.setStripePaymentOnDelete(
        stripeObj,
        customerPaymentData
      );
    } catch (err) {
      return false;
    }
  },

  async getuserData(customerId) {
    try {
      return await paymentService.getUserDataByStripeCustomerId(customerId);
    } catch (err) {
      return null;
    }
  },
};
