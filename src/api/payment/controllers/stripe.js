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
      return [400, `Webhook Error: ${err}`];
    }

    // Handle the event
    switch (event.type) {
      case "customer.subscription.updated":
        module.exports.stripeUpdateSubscription(event.data.object);
        // console.log("Checkout updated:");
        // console.log(event.data.object);
        break;

      case "checkout.session.completed":
        try {
          module.exports.stripeCheckoutCompleted(event.data.object);
          // console.log("Checkout completed:");
          // console.log(event.data.object);
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      case "customer.subscription.deleted":
        module.exports.stripeDeleteSubscription(event.data.object);

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return [200];
  },

  /**
   * Sets Stripe first subscription creation
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async stripeCheckoutCompleted(event) {
    await paymentService.setStripePaymentOnFirstSubscriptionCreated(event, 3);
  },

  /**
   * Sets Stripe payment field on update (renewel, delete, ...)
   * Role: 3 - subscriber, 1 - Authenticated
   * setStripePaymentOnUpdate methos hecks if customer payment data exist in DB if not returns nul.
   * In the above case, It's usually first subscription case and we have to continue to stripeCheckoutCompleted (handled in function that envokes this one)
   */
  async stripeUpdateSubscription(event) {
    try {
      const update = await paymentService.setStripePaymentOnUpdate(event);

      if (!update) {
        return;
      }
    } catch (err) {
      return false;
    }
  },

  /**
   * Deleted subscription
   * Role: 3 - subscriber, 1 - Authenticated
   */
  async stripeDeleteSubscription(event) {
    const customerId = event.customer;

    console.log("DELETED");
  },
};
