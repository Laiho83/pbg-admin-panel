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
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;

        try {
          await paymentService.setStripeSubscriberRoleById(
            checkoutSessionCompleted
          );
          return [200];
        } catch (err) {
          return [400, `Subscription Error: ${err}`];
        }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return [200];
  },
};
