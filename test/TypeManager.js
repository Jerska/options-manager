/* eslint-env mocha */

import expect from 'expect';

import ExceptionThrower from '../src/ExceptionThrower.js';
import TypeManager from '../src/TypeManager.js';

describe('TypeManager', () => {
  context('constructor', () => {
    it('should automatically use a thrower', () => {
      expect(() => {
        let manager = new TypeManager();
        manager.thrower.throw('Custom Error');
      }).toThrow('[TypeManager] Custom Error');
    });

    it('should reuse a thrower', () => {
      expect(() => {
        let thrower = new ExceptionThrower('Custom Thrower');
        let manager = new TypeManager(thrower);
        manager.thrower.throw('Custom Error');
      }).toThrow('[Custom Thrower][TypeManager] Custom Error');
    });
  });

  context('methods', () => {
    let manager;

    beforeEach(() => {
      manager = new TypeManager();
    });

    context('#checker', () => {
      context('()', () => {
        it('throws', () => {
          const expected = '[.checker] Type `undefined` should be a string';
          expect(() => manager.checker()).toThrow(expected);
        });
      });

      context('(type)', () => {
        it('throws if type isn\'t a string', () => {
          const expected = '[.checker] Type `null` should be a string';
          expect(() => { manager.checker(null); }).toThrow(expected);
        });
        it('throws if type doesn\'t exist', () => {
          const expected = '[.checker] Type `ACustomType` has no associated check';
          expect(() => { manager.checker('ACustomType'); }).toThrow(expected);
        });
        it('returns a function for boolean', () => {
          expect(manager.checker('boolean')).toBeA('function');
        });
        it('returns a function for function', () => {
          expect(manager.checker('function')).toBeA('function');
        });
        it('returns a function for number', () => {
          expect(manager.checker('number')).toBeA('function');
        });
        it('returns a function for string', () => {
          expect(manager.checker('string')).toBeA('function');
        });
        it('returns a function for Array', () => {
          expect(manager.checker('Array')).toBeA('function');
        });
        it('returns a function for Object', () => {
          expect(manager.checker('Object')).toBeA('function');
        });
        it('returns a function for RegExp', () => {
          expect(manager.checker('RegExp')).toBeA('function');
        });
      });
    });

    context('#printer', () => {
      context('()', () => {
        it('throws', () => {
          const expected = '[.printer] Type `undefined` should be a string';
          expect(() => manager.printer()).toThrow(expected);
        });
      });

      context('(type)', () => {
        it('throws if type isn\'t a string', () => {
          const expected = '[.printer] Type `null` should be a string';
          expect(() => { manager.printer(null); }).toThrow(expected);
        });
        it('throws if type doesn\'t exist', () => {
          const expected = '[.printer] Type `ACustomType` has no associated print function';
          expect(() => { manager.printer('ACustomType'); }).toThrow(expected);
        });
        it('returns a function for boolean', () => {
          expect(manager.printer('boolean')).toBeA('function');
        });
        it('returns a function for function', () => {
          expect(manager.printer('function')).toBeA('function');
        });
        it('returns a function for number', () => {
          expect(manager.printer('number')).toBeA('function');
        });
        it('returns a function for string', () => {
          expect(manager.printer('string')).toBeA('function');
        });
        it('returns a function for Array', () => {
          expect(manager.printer('Array')).toBeA('function');
        });
        it('returns a function for Object', () => {
          expect(manager.printer('Object')).toBeA('function');
        });
        it('returns a function for RegExp', () => {
          expect(manager.printer('RegExp')).toBeA('function');
        });
      });
    });

    function setContext(method) {
      return () => {
        let type;
        let checker;
        let printer;

        beforeEach(() => {
          type = 'ACustomType';
          checker = () => false;
          printer = JSON.stringify;
        });

        it('throws if type is undefined', () => {
          const expected = `[.${method}] Type \`undefined\` should be a string`;
          type = undefined;
          expect(() => { manager[method]({type, checker, printer}); }).toThrow(expected);
        });
        it('throws if type isn\'t a string', () => {
          const expected = `[.${method}] Type \`null\` should be a string`;
          type = null;
          expect(() => { manager[method]({type, checker, printer}); }).toThrow(expected);
        });
        it('throws if checker is undefined', () => {
          const expected = `[.${method}] Checker \`undefined\` should be a function`;
          checker = undefined;
          expect(() => { manager[method]({type, checker, printer}); }).toThrow(expected);
        });
        it('throws if checker isn\'t a function', () => {
          const expected = `[.${method}] Checker \`null\` should be a function`;
          checker = null;
          expect(() => { manager[method]({type, checker, printer}); }).toThrow(expected);
        });
        it('throws if printer is undefined', () => {
          const expected = `[.${method}] Printer \`undefined\` should be a function`;
          printer = undefined;
          expect(() => { manager[method]({type, checker, printer}); }).toThrow(expected);
        });
        it('throws if printer isn\'t a function', () => {
          const expected = `[.${method}] Printer \`null\` should be a function`;
          printer = null;
          expect(() => { manager[method]({type, checker, printer}); }).toThrow(expected);
        });
        it('adds a new type checker', () => {
          type = 'MyCustomType';
          checker = () => true;
          printer = () => 'elt';

          manager[method]({type, checker, printer});

          expect(manager.checker(type)).toBe(checker);
          expect(manager.printer(type)).toBe(printer);
        });
        it('overwrites an existing one', () => {
          type = 'string';
          checker = () => true;
          printer = () => 'elt';
          let oldIsString = manager.checker(type);
          let oldStringPrinter = manager.printer(type);

          manager[method]({type, checker, printer});

          expect(manager.checker('string')).toNotBe(oldIsString);
          expect(manager.checker('string')).toBe(checker);
          expect(manager.printer('string')).toNotBe(oldStringPrinter);
          expect(manager.printer('string')).toBe(printer);
        });
      };
    }

    context('#set(type, checker)', setContext('set'));
    context('#add(type, checker)', setContext('add'));

    context('#check(value, types)', () => {
      let value;
      let types;

      beforeEach(() => {
        value = 'AString';
        types = ['string'];
      });

      it('throws if first of the types has no type checker', () => {
        types = ['ACustomType'].concat(types);

        const expected = '[.checker] Type `ACustomType` has no associated check function';
        expect(() => { manager.check(value, types); }).toThrow(expected);
      });
      it('throws if last of the types has no type checker', () => {
        types = types.concat(['ACustomType']);

        const expected = '[.checker] Type `ACustomType` has no associated check function';
        expect(() => { manager.check(value, types); }).toThrow(expected);
      });
      it('returns true if value matches a single type', () => {
        expect(manager.check(value, types)).toBe(true);
      });
      it('returns true if value matches one in multiple types (it being the first one)', () => {
        types = types.concat(['number']);
        expect(manager.check(value, types)).toBe(true);
      });
      it('returns true if value matches one in multiple types (it being the last one)', () => {
        types = ['number'].concat(types);
        expect(manager.check(value, types)).toBe(true);
      });
      it('returns false if types is an empty array', () => {
        types = [];
        expect(manager.check(value, types)).toBe(false);
      });
      it('returns false if value doesn\'t match a single element array', () => {
        value = 'AString';
        types = ['number', 'boolean'];
        expect(manager.check(value, types)).toBe(false);
      });
    });
  });
});
