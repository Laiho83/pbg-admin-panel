const emailTemplates = require("./email.template.js");

module.exports = {
  async mail(ctx) {
    const email = ctx.state.user.email;
    const username = ctx.state.user.username;
    const subscription = ctx.request.body.subscription;

    try {
      await strapi.plugins["email"].services.email.sendTemplatedEmail(
        {
          to: email,
        },
        emailTemplates.bankEmailTemplate(subscription),
        {
          username: username,
        }
      );
      return true;
    } catch (err) {
      return false;
    }
  },
};
