import isBoolean from 'lodash/isBoolean';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isRegExp from 'lodash/isRegExp';

import ExceptionThrower from './ExceptionThrower.js';

export default class TypeManager {
  constructor(thrower = null) {
    this.thrower = isNull(thrower)
      ? new ExceptionThrower('TypeManager')
      : thrower.nest('TypeManager');
    this.checkers = {
      'boolean': isBoolean,
      'function': isFunction,
      'null': isNull,
      number: isNumber,
      string: isString,
      Array: isArray,
      Object: isPlainObject,
      RegExp: isRegExp
    };
    this.printers = {
      'boolean': JSON.stringify,
      'function': (f) => f.toSource(),
      'null': () => 'null',
      number: JSON.stringify,
      string: JSON.stringify,
      Array: JSON.stringify,
      Object: JSON.stringify,
      RegExp: (r) => r.toString()
    };
  }

  checker(type) {
    const thrower = this.thrower.nest('.checker');

    if (!isString(type)) {
      thrower.throw(`Type \`${type}\` should be a string`);
    }

    let res = this.checkers[type];

    if (isUndefined(res)) {
      thrower.throw(`Type \`${type}\` has no associated check function`);
    }

    return res;
  }

  printer(type) {
    const thrower = this.thrower.nest('.printer');
    if (!isString(type)) {
      thrower.throw(`Type \`${type}\` should be a string`);
    }

    let res = this.printers[type];

    if (isUndefined(res)) {
      thrower.throw(`Type \`${type}\` has no associated print function`);
    }

    return res;
  }

  set({type, checker, printer}, method = 'set') {
    const thrower = this.thrower.nest(`.${method}`);
    if (!isString(type)) {
      thrower.throw(`Type \`${type}\` should be a string`);
    }
    if (!isFunction(checker)) {
      thrower.throw(`Checker \`${checker}\` should be a function`);
    }
    if (!isFunction(printer)) {
      thrower.throw(`Printer \`${printer}\` should be a function`);
    }
    this.checkers[type] = checker;
    this.printers[type] = printer;
  }
  add(arg) { this.set(arg, 'add'); }

  check(value, types) {
    let res = false;
    for (let i = 0; i < types.length; ++i) {
      if (this.checker(types[i])(value)) res = true;
    }
    return res;
  }

  print(value, types) {
    return this.printer(types[0])(value);
  }
}
