const emailTemplates = require("./email.template.js");

module.exports = {
  async mail(ctx) {
    const email = ctx.state.user.email;

    try {
      await strapi.plugins["email"].services.email.sendTemplatedEmail(
        {
          to: email,
        },
        emailTemplates.bankEmailTemplate(),
        {
          user: [],
        }
      );
      return true;
    } catch (err) {
      return false;
    }
  },
};
