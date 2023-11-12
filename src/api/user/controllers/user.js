"use strict";

/**
 * Get user data
 */
const fs = require("fs");
const userService = require("../services/user.service.js");

module.exports = {
  async updateEmail(ctx) {
    const id = ctx.params.id;
    const email = ctx.request.body.email;

    try {
      await strapi.query("plugin::users-permissions.user").update({
        where: { id: id },
        data: {
          email: email,
        },
      });
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({ message: "Email update success:" });
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = JSON.stringify({
        message: "Email update error: " + err,
      });
    }
  },

  async passwordRenewel(ctx) {
    const email = ctx.request.query.email;

    try {
      const entry = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { email: email } });

      const passwordRenewel = entry.passwordRenewel;
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({ passwordRenewel: passwordRenewel });
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = JSON.stringify({
        message: "Email update error: " + err,
      });
    }
  },

  async passwordRenewelUpdate(ctx) {
    const id = ctx.params.id;

    try {
      await strapi.query("plugin::users-permissions.user").update({
        where: { id: id },
        data: {
          passwordRenewel: true,
        },
      });
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({
        message: "Password Renewel updated successfully ",
      });
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = JSON.stringify({
        message: "Email update error: " + err,
      });
    }
  },

  async isUser(ctx) {
    const email = ctx.request.query.email;

    try {
      const entry = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { email: email } });

      if (!entry) {
        ctx.response.status = 400;
        ctx.response.body = JSON.stringify({
          message: "User does not exist",
        });

        return;
      }
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({ user: true });
      return;
    } catch (err) {
      ctx.response.status = 403;
      ctx.response.body = JSON.stringify({
        message: "User does not exist",
      });
    }
  },

  async welcomeEmail(ctx) {
    const id = ctx.params.id;
    const email = ctx.state.user.email;
    const username = ctx.state.user.username;
    const confirmationCompleted = ctx.state.user.confirmationCompleted;

    const template = fs
      .readFileSync("src/api/user/email/account-created.html")
      .toString();

    const emailTemplate = {
      subject: "PrettyBarnGood ACCOUNT CREATED",
      text: `PrettyBarnGood ACCOUNT CREATED`,
      html: template,
    };

    if (!confirmationCompleted) {
      await module.exports.updateUserConfirmation(id);

      try {
        await strapi.plugins["email"].services.email.sendTemplatedEmail(
          {
            to: email,
          },
          emailTemplate,
          {
            username: username,
          }
        );
        ctx.response.status = 200;
        ctx.response.body = JSON.stringify({
          message: "Confirmation completed",
        });
      } catch (err) {
        ctx.response.status = 400;
        ctx.response.body = JSON.stringify({
          message: "Confirmation completed Error: " + err,
        });
      }
    } else {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({
        message: "Confirmation already completed",
      });
    }
  },

  updateUserConfirmation: async (id) => {
    try {
      await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: id },
          data: {
            confirmationCompleted: true,
            passwordRenewel: true,
          },
        })
        .then(() => {
          return true;
        });
    } catch (err) {
      return err;
    }
  },
};
