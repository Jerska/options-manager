/* eslint-env mocha */

import expect from 'expect';

import ExceptionThrower from '../src/ExceptionThrower.js';
import Structure from '../src/Structure.js';

describe('Structure', () => {
  let path;
  let structure;
  let thrower;
  let expected;

  beforeEach(() => {
    path = 'opt';
    structure = {type: 'string', value: 'default value'};
    thrower = new ExceptionThrower('StructureChecker');
  });

  context('constructor', () => {
    beforeEach(() => {
      expected = {
        children: null,
        element: null,
        hasChildren: false,
        hasElement: false,
        hasError: false,
        hasValue: true,
        required: false,
        path: 'opt',
        types: ['string'],
        typesStr: 'string',
        value: 'default value'
      };
    });

    function object() {
      return JSON.parse(JSON.stringify(new Structure(structure, thrower, path)));
    }

    function check() {
      expect(object()).toEqual(expected);
    }

    context('path', () => {
      it('uses it', () => {
        path = 'customOpt';
        expected.path = 'customOpt';
        check();
      });

      it('handles unnamed structure', () => {
        path = undefined;
        expected.path = null;
        check();
      });

      it('handles unnamed structure children', () => {
        path = undefined;
        structure = {type: 'Array', children: [
          {type: 'string'}
        ]};
        expected = {
          children: [{
            children: null,
            element: null,
            hasChildren: false,
            hasElement: false,
            hasError: false,
            hasValue: false,
            required: false,
            path: '[0]',
            types: ['string'],
            typesStr: 'string'
          }],
          element: null,
          hasChildren: true,
          hasElement: false,
          hasError: false,
          hasValue: false,
          required: false,
          path: null,
          types: ['Array'],
          typesStr: 'Array'
        };
        check();
      });
    });

    context('structure', () => {
      it('throws if undefined', () => {
        structure = undefined;
        expect(object).toThrow('[StructureChecker] opt\'s `structure` must be defined');
      });

      context('required', () => {
        beforeEach(() => {
          delete structure.value;
          structure.required = true;

          delete expected.value;
          expected.required = true;
          expected.hasValue = false;
        });

        it('uses it', () => {
          check();
        });
      });

      context('value', () => {
        it('handles undefined correctly', () => {
          structure.value = undefined;
          expected.hasValue = true;
          delete expected.value;
          check();
        });

        it('handles not defined correctly', () => {
          delete structure.value;
          expected.hasValue = false;
          delete expected.value;
          check();
        });
      });

      context('type', () => {
        it('throws if type is undefined', () => {
          delete structure.type;
          expect(object).toThrow('[StructureChecker] `opt` must have a `type`');
        });
      });

      context('element', () => {
        beforeEach(() => {
          structure = {type: 'Array', element: {
            type: 'string'
          }};
          expected = {
            children: null,
            element: {
              children: null,
              element: null,
              hasChildren: false,
              hasElement: false,
              hasError: false,
              hasValue: false,
              required: false,
              path: 'opt[]',
              types: ['string'],
              typesStr: 'string'
            },
            hasChildren: false,
            hasElement: true,
            hasError: false,
            hasValue: false,
            required: false,
            path: 'opt',
            types: ['Array'],
            typesStr: 'Array'
          };
        });

        it('works', () => {
          check();
        });
        it('throws if element has a default value', () => {
          structure.element.value = undefined;
          expect(object).toThrow('[StructureChecker] `opt[]` is an `element`, it can\'t have a `value`');
        });
        it('throws if element is required', () => {
          structure.element.required = true;
          expect(object).toThrow('[StructureChecker] `opt[]` is an `element`, it can\'t be `required`');
        });
      });

      context('children', () => {
        context('array', () => {
          beforeEach(() => {
            structure = {type: 'Array', children: [
              {type: 'string', value: 'default value for child 0'},
              {type: 'string', value: 'default value for child 1'}
            ]};
            expected = {
              children: [{
                children: null,
                element: null,
                hasChildren: false,
                hasElement: false,
                hasError: false,
                hasValue: true,
                required: false,
                path: 'opt[0]',
                types: ['string'],
                typesStr: 'string',
                value: 'default value for child 0'
              }, {
                children: null,
                element: null,
                hasChildren: false,
                hasElement: false,
                hasError: false,
                hasValue: true,
                required: false,
                path: 'opt[1]',
                types: ['string'],
                typesStr: 'string',
                value: 'default value for child 1'
              }],
              element: null,
              hasChildren: true,
              hasElement: false,
              hasError: false,
              hasValue: false,
              required: false,
              path: 'opt',
              types: ['Array'],
              typesStr: 'Array'
            };
          });

          it('works', () => {
            check();
          });
        });

        context('object', () => {
          beforeEach(() => {
            structure = {type: 'Object', children: {
              subOpt1: {type: 'string', value: 'default value for subOpt1'},
              subOpt2: {type: 'string', value: 'default value for subOpt2'}
            }};
            expected = {
              children: {
                subOpt1: {
                  children: null,
                  element: null,
                  hasChildren: false,
                  hasElement: false,
                  hasError: false,
                  hasValue: true,
                  required: false,
                  path: 'opt.subOpt1',
                  types: ['string'],
                  typesStr: 'string',
                  value: 'default value for subOpt1'
                },
                subOpt2: {
                  children: null,
                  element: null,
                  hasChildren: false,
                  hasElement: false,
                  hasError: false,
                  hasValue: true,
                  required: false,
                  path: 'opt.subOpt2',
                  types: ['string'],
                  typesStr: 'string',
                  value: 'default value for subOpt2'
                }
              },
              element: null,
              hasChildren: true,
              hasElement: false,
              hasError: false,
              hasValue: false,
              required: false,
              path: 'opt',
              types: ['Object'],
              typesStr: 'Object'
            };
          });

          it('works', () => {
            check();
          });
        });
      });


      context('element and children', () => {
        beforeEach(() => {
          structure = {type: 'Array', element: {
            type: 'string', value: 'default value for subElement'
          }};
        });

        it('throws if children is an array', () => {
          structure.children = [];
          const error = '`opt`\'s structure can\'t have both `element` and `children`';
          expect(object).toThrow(`[StructureChecker] ${error}`);
        });
        it('throws if children is an object', () => {
          structure.children = [];
          const error = '`opt`\'s structure can\'t have both `element` and `children`';
          expect(object).toThrow(`[StructureChecker] ${error}`);
        });
      });

      context('required and value', () => {
        beforeEach(() => {
          structure.required = true;
          structure.value = 'xxx';
        });

        it('throws', () => {
          expect(object).toThrow('[StructureChecker] `opt` can\'t be `required` and have a `value`');
        });
      });
    });
  });

  context('usage', () => {
    function check() {
      expect(new Structure(structure, thrower, path).usage(path)).toEqual(expected);
    }

    it('puts no name by default', () => {
      path = undefined;
      expected = '    <string> = "default value"';
      check();
    });

    it('uses name', () => {
      expected = '    optName<string> = "default value"';
      expect(new Structure(structure, thrower, path).usage('optName')).toEqual(expected);
    });
    it('respects indentation', () => {
      expected = '      optName<string> = "default value"';
      expect(new Structure(structure, thrower, path).usage('optName', 6)).toEqual(expected);
    });
    it('displays required', () => {
      structure = {type: 'string', required: true};
      expected = '*   opt<string>';
      check();
    });
    it('displays an error', () => {
      let s = new Structure(structure, thrower, path);
      s.hasError = true;
      expected = ' X  opt<string> = "default value"';
      expect(s.usage(path)).toEqual(expected);
    });
    it('handles multiple types', () => {
      structure.type = 'string|number';
      expected = '    opt<string|number> = "default value"';
      check();
    });
    it('handles a string element', () => {
      structure = {type: 'Array', value: [], element: {type: 'string'}};
      expected = '    opt<Array>: [<string>] = []';
      check();
    });
    it('handles an object element', () => {
      structure = {type: 'Array', required: true, element: {type: 'Object', children: {
        elementOpt1: {type: 'string', required: true},
        elementOpt2: {type: 'number', value: 42},
        elementOpt3: {type: 'string', value: 'default value'}
      }}};
      expected = '' +
        '*   opt<Array>: [<Object>{\n' +
        '*     elementOpt1<string>,\n' +
        '      elementOpt2<number> = 42,\n' +
        '      elementOpt3<string> = "default value"\n' +
        '    }]';
      check();
    });
    it('handles children object', () => {
      structure = {type: 'Object', value: {}, children: {
        subOpt1: {type: 'string', required: true},
        subOpt2: {type: 'number', value: 42},
        subOpt3: {type: 'string', value: 'default value'}
      }};
      expected = '' +
        '    opt<Object>: {\n' +
        '*     subOpt1<string>,\n' +
        '      subOpt2<number> = 42,\n' +
        '      subOpt3<string> = "default value"\n' +
        '    } = {}';
      check();
    });
    it('handles children array', () => {
      structure = {type: 'Array', value: [], children: [
        {type: 'string', required: true},
        {type: 'number', value: 42},
        {type: 'string', value: 'default value'}
      ]};
      expected = '' +
        '    opt<Array>: [\n' +
        '*     <string>,\n' +
        '      <number> = 42,\n' +
        '      <string> = "default value"\n' +
        '    ] = []';
      check();
    });
  });
});
