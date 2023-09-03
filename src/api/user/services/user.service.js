module.exports = {
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
      return await strapi.query("plugin::users-permissions.user").findOne({
        where: { stripeCustomerId: stripeCustomerId },
      });
    } catch (err) {
      return err;
    }
  },
};
