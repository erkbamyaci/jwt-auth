const controller = require("../controllers/users");
const validateToken = require("../utils").validateToken;

module.exports = (router) => {
  router.route("/users/add")
    .post(controller.add);

  router.route("/users/getall")
    .get(validateToken, controller.getAll); // This route is now protected

  router.route("/users/login")
    .post(controller.login);
};