import forEach from 'lodash/forEach';

import ExceptionThrower from './ExceptionThrower.js';
import FunctionChecker from './FunctionChecker.js';
import Structure from './Structure.js';
import TypeManager from './TypeManager.js';

export default class OptionsManager {
  constructor(types = []) {
    this.thrower = new ExceptionThrower('OptionsManager');
    this.typeManager = new TypeManager(this.thrower);
    forEach(types, (type) => { this.typeManager.set(type); });
  }

  // Accepts (name, obj) or just (obj)
  structure(name, obj) {
    return new Structure(obj, this.thrower.nest('.structure'), name);
  }

  check(name) {
    return new FunctionChecker(
      name,
      this.typeManager,
      this.thrower.nest('.check')
    );
  }
}
