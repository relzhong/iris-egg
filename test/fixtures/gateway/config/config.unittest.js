module.exports = () => {
  const config = {};
  config.datasource = {
    Testb: {
      mock: true,
    },
  };
  config.access = {
    defaultPolicies: `[
      {"effect":"allow","action":["POST","GET"],"resource":["/home"]},
      {"effect":"allow","action":["GET"],"resource":["/api/v1/iu/dictGroups"]},
      {"effect":"allow","action":["GET"],"resource":["/api/v1/iu/dictGroups/*"]},
      {"effect":"allow","action":["POST","GET"],"resource":["/api/v1/iu/user"]},
      {"effect":"allow","action":["POST","GET","PUT","DELETE"],"resource":["/api/v1/iu/user/*"]},
      {"effect":"allow","action":["POST","GET","PUT","DELETE"],"resource":["/api/v1/base/*"]},
      {"effect":"allow","action":["POST","GET"],"resource":["/api/v1/pu/payments/notify/*"]},
      {"effect":"deny","action":["POST","GET","PUT","DELETE"],"resource":["*"]}
    ]`,
  };
  config.keys = '123456';
  return config;
};

