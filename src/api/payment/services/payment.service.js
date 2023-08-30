const PAYPAL_PLAN_MONTHLY = process.env.PAYPAL_PLAN_MONTHLY;
const PAYPAL_PLAN_SIXMONTH = process.env.PAYPAL_PLAN_SIXMONTH;
const PAYPAL_PLAN_TWELVEMONTH = process.env.PAYPAL_PLAN_TWELVEMONTH;

module.exports = {
  setStripeSubscriberRoleById: async (checkoutSessionCompleted) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: checkoutSessionCompleted.client_reference_id },
          data: {
            role: 3,
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

  setSubscriberRoleByEmail: async (email, customer) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { email: email },
          data: { role: 3, stripeCustomerId: customer },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },

  setSubscriberRole: async (ctx) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: ctx.state.user.id },
          data: { role: 3 },
        })
        .then((res) => {
          ctx.response.status = 200;
        });
      ctx.body = entry;
    } catch (err) {
      ctx.body = err;
    }
  },

  createSubscription: async (ctx) => {
    console.log(ctx.state.user.stripeCustomerId);

    ctx.response.status = 200;
  },

  customerStripeModel(checkoutSessionCompleted) {
    return {
      provider: "stripe",
      stripeCustomId: checkoutSessionCompleted.customer,
      stripeEmail: checkoutSessionCompleted.customer_details.email,
      subscription: {
        type: {
          oneMonth: checkoutSessionCompleted.subscription,
          sixMonth: false,
          twelveMonth: false,
        },
        startDate: new Date(),
        endDate: checkoutSessionCompleted.expires_at,
      },
    };
  },

  customerPayPalModel(checkoutSessionCompleted) {
    console.log(PAYPAL_PLAN_TWELVEMONTH);
    console.log(checkoutSessionCompleted.plan_id);

    return {
      provider: "paypal",
      paypalCustomId: checkoutSessionCompleted.id,
      subscription: {
        type: {
          oneMonth: checkoutSessionCompleted.plan_id === PAYPAL_PLAN_MONTHLY,
          sixMonth: checkoutSessionCompleted.plan_id === PAYPAL_PLAN_SIXMONTH,
          twelveMonth:
            checkoutSessionCompleted.plan_id === PAYPAL_PLAN_TWELVEMONTH,
        },
        startDate: checkoutSessionCompleted.update_time,
        endDate: checkoutSessionCompleted.billing_info.next_billing_time,
      },
    };
  },
};
