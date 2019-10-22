

module.exports = app => {

  class HomeController extends app.Controller {
    async index() {
      this.success('hello');
    }
    async home() {
      this.success('hello');
    }
  }

  return HomeController;
};

