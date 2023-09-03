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
      case "customer.subscription.updated":
        break;

      case "customer.subscription.deleted":
        module.exports.stripeDeleteSubscription(event.data.object);

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return [200];
  },

  // This one is envoked when subscription is canceled and the cancel date is set. Does not delete/remove subscription
  async cancelSubscriptionStripe(ctx) {
    const email = ctx.state.user.email;
    const id = ctx.params.id;

    const userData = await paymentService.getUserData(id);

    const userEmail = userData.email;
    const userStripeId = userData.payment.subscription.id;
    const userStripeCancel = userData.payment.subscription.cancelData;
    const userStripeCustomerId = userData.stripeCustomerId;

    if (userEmail === email && userStripeId && !userStripeCancel.length) {
      try {
        const subscription = await stripe.subscriptions.update(userStripeId, {
          cancel_at_period_end: true,
        });

        userData.payment.subscription.cancelData = new Date();

        paymentService.updateStripeSubscriberRoleByCustomerId(
          userStripeCustomerId,
          3,
          userData.payment
        );

        return [200];
      } catch (err) {
        return [400, `Subscription Cancelation Error: ${err}`];
      }
    }

    return [400, `Subscription Cancelation Error:`];
  },

  async stripeDeleteSubscription(event) {
    const customerId = event.customer;

    if (event.status == "canceled") {
      const data = await paymentService.getUserDataByStripeCustomerId(
        customerId
      );

      data.payment.subscription = {
        active: false,
        cancelDate: new Date(),
      };

      paymentService.updateStripeSubscriberRoleByCustomerId(
        customerId,
        1,
        data.payment
      );
    }
  },
};
