/* eslint-env mocha */

import expect from 'expect';

import FunctionChecker from '../src/FunctionChecker.js';
import OptionsManager from '../src/OptionsManager.js';
import Structure from '../src/Structure.js';

describe('optionsManager', () => {
  let manager;

  beforeEach(() => {
    manager = new OptionsManager();
  });

  context('#constructor', () => {
    it('exposes .typeManager', () => {
      expect(manager.typeManager).toNotBe(undefined);
    });
  });

  context('#structure', () => {
    it('returns a Structure object', () => {
      expect(manager.structure('arg1', {type: 'string'})).toBeA(Structure);
    });
  });

  context('#check', () => {
    it('returns a FunctionChecker object', () => {
      expect(manager.check('customFunc')).toBeA(FunctionChecker);
    });
  });
});
