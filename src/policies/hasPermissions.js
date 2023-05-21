module.exports = (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;
  const { params } = policyContext;

  if (user.id == params.id) {
    return true;
  }

  return false;
};
