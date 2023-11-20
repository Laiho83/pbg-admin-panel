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

        paymentService.setStripeSubscriberRoleByCustomerId(
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

  async stripeCheckoutCompleted(event) {
    await paymentService.setStripeSubscriberRoleById(event, 3);
  },

  async stripeUpdateSubscription(event) {
    const customerId = event.customer;

    const customerPaymentData =
      await paymentService.getUserDataByStripeCustomerId(customerId);

    console.log(customerId);

    // On first payment we don't have pamynet data saved so there is nothing to update
    // we have to let the code to go to checkout.completed event
    if (!customerPaymentData) {
      return;
    }

    paymentService.customerStripeUpdate(event, customerPaymentData);

    try {
      // await strapi.plugins["email"].services.email.sendTemplatedEmail(
      //   {
      //     to: "pbgww.dev@gmail.com",
      //   },
      //   emailTemplates.bankEmailTemplate(),
      //   {
      //     user: [],
      //   }
      // );
      // return true;
    } catch (err) {
      return false;
    }
  },

  // This one deletes subscription
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

      paymentService.setStripeSubscriberRoleByCustomerId(
        customerId,
        1,
        data.payment
      );
    }
  },
};
