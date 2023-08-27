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

  setPayPalSubscriberRoleByEmail: async (checkoutSessionCompleted) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { email: checkoutSessionCompleted.payer_email },
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
    return {
      provider: "paypal",
      paypalCustomId: checkoutSessionCompleted.recurring_payment_id,
      paypalEmail: checkoutSessionCompleted.payer_email,
      subscription: {
        type: {
          oneMonth: true,
          sixMonth: false,
          twelveMonth: false,
        },
        startDate: checkoutSessionCompleted.time_created,
        endDate: checkoutSessionCompleted.next_payment_date,
      },
    };
  },
};
