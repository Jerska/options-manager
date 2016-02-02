/* eslint-env mocha */

import expect from 'expect';

import ExceptionThrower from '../src/ExceptionThrower.js';
import FunctionChecker from '../src/FunctionChecker.js';
import Structure from '../src/Structure.js';
import TypeManager from '../src/TypeManager.js';

describe('FunctionChecker', () => {
  let defaultStructure;
  let name;
  let thrower;
  let typeManager;

  beforeEach(() => {
    defaultStructure = new Structure({type: 'string'}, thrower);
    name = 'customFunc';
    thrower = new ExceptionThrower('Function Checker');
    typeManager = new TypeManager();
  });

  context('constructor', () => {
    it('should work', () => {
      expect(() => (new FunctionChecker(name, typeManager, thrower))).toNotThrow();
    });
  });

  context('arg', () => {
    it('should be able to chain arg calls', () => {
      expect(() => {
        new FunctionChecker(name, typeManager, thrower)
          .arg(defaultStructure, 'val1')
          .arg(defaultStructure, 'val2');
      }).toNotThrow();
    });
  });

  context('values', () => {
    it('should assign the default value if not present', () => {
      const [value] = new FunctionChecker(name, typeManager, thrower)
        .arg(new Structure({type: 'string', value: 'default value'}, thrower), undefined)
        .values();
      expect(value).toBe('default value');
    });
    it('should not assign the default value if present', () => {
      const [value] = new FunctionChecker(name, typeManager, thrower)
        .arg(new Structure({type: 'string', value: 'default value'}, thrower), 'value')
        .values();
      expect(value).toBe('value');
    });

    context('error management', () => {
      it('throws with multiple errors', () => {
        const expectedError = `
Usage:
  customFunc(
 X  arg1<string> = "default value",
    arg2<Object>: {
*X    subArg1<string>,
      subArg2<number> = 42,
 X    subArg3<string>
    },
    arg3<Array>: [<Object>{
*X    elementArg1<string>,
      elementArg2<number> = 42,
 X    elementArg3<string>
    }]
  )
----------------
Errors:
  - \`arg1\` should be <string>, received number
  - \`arg2.subArg1\` is required
  - \`arg2.subArg3\` should be <string>, received number
  - \`arg3[].elementArg1\` should be <string>, received number
  - \`arg3[].elementArg1\` is required
  - \`arg3[].elementArg3\` should be <string>, received number
----------------
Legend:
  <...> Type
  *     Required
  X     Error`;
        let catchCalled = false;

        try {
          new FunctionChecker(name, typeManager, thrower)
          .arg(new Structure({type: 'string', value: 'default value'}, thrower, 'arg1'), 42)
          .arg(new Structure({type: 'Object', children: {
            subArg1: {type: 'string', required: true},
            subArg2: {type: 'number', value: 42},
            subArg3: {type: 'string'}
          }}, thrower, 'arg2'), {subArg2: 0, subArg3: 42})
          .arg(new Structure({type: 'Array', element: {type: 'Object', children: {
            elementArg1: {type: 'string', required: true},
            elementArg2: {type: 'number', value: 42},
            elementArg3: {type: 'string'}
          }}}, thrower, 'arg3'), [
            {elementArg1: 1, elementArg2: 30},
            {elementArg3: 42},
            {elementArg1: 'value'}
          ])
          .values();
        } catch (e) {
          expect(e.message).toEqual(expectedError);
          catchCalled = true;
        }
        expect(catchCalled).toBe(true);
      });
    });
  });

  context('usage', () => {
    it('works', () => {
      const expected = `
Usage:
  customFunc(
    <string>,
    <string>
  )
----------------
Legend:
  <...> Type
  *     Required`;
      expect(new FunctionChecker(name, typeManager, thrower)
        .arg(defaultStructure, 'val1')
        .arg(defaultStructure, 'val2')
        .usage()
      ).toEqual(expected);
    });
  });
});
