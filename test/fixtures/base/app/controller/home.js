

module.exports = app => {

  class HomeController extends app.Controller {
    async index() {
      this.success('hello');
    }
  }

  return HomeController;
};

