const changeCase = require('change-case');
const SYMBOL_CONNECTOR = Symbol('connector');

module.exports = {

  /**
   * rewrite egg-graphql connector name
   * @member Context#connector
   */

  get connector() {
    /* istanbul ignore else */
    if (!this[SYMBOL_CONNECTOR]) {
      const connectors = {};
      for (const [ type, Class ] of this.app.connectorClass) {
        connectors[changeCase.camelCase(type)] = new Class(this);
      }
      this[SYMBOL_CONNECTOR] = connectors;
    }
    return this[SYMBOL_CONNECTOR];
  },

};
