import forEach from 'lodash/forEach';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';

export default class FunctionChecker {
  constructor(name, typeChecker, thrower) {
    this.name = name;
    this.options = [];
    this.errors = [];
    this.typeChecker = typeChecker;
    this.thrower = thrower;
  }

  arg(structure, value) {
    this.options.push({name: structure.path, structure, value});
    return this;
  }

  usage() {
    let usages = [];
    forEach(this.options, (option) => {
      usages.push(option.structure.usage(option.name));
    });
    let res = [];
    res.push(`Usage:\n  ${this.name}(\n${usages.join(',\n')}\n  )`);
    if (this.errors.length > 0) {
      res.push(`Errors:\n  - ${this.errors.join('\n  - ')}`);
    }
    res.push(`Legend:\n  ${this._legend().join('\n  ')}`);
    return `\n${res.join('\n----------------\n')}`;
  }

  values() {
    let res = [];
    forEach(this.options, (option) => {
      res.push(option.value = this._buildValue(option.structure, option.value));
      this._check(option);
    });
    if (this.errors.length > 0) throw new Error(this.usage());
    return res;
  }

  _legend() {
    let res = ['<...> Type', '*     Required'];
    if (this.errors.length > 0) res.push('X     Error');
    return res;
  }

  _buildValue({
      children,
      element,
      hasValue,
      value: defaultValue
    },
    value) {
    if (isUndefined(value) && hasValue) {
      value = defaultValue;
    }
    if (!isNull(children)) {
      forEach(children, (childStructure, key) => {
        const res = this._buildValue(childStructure, value[key]);
        if (!isUndefined(res)) value[key] = res;
      });
    }
    if (!isNull(element)) {
      forEach(value, (childValue, index) => {
        value[index] = this._buildValue(element, childValue);
      });
    }
    return value;
  }

  _addError(structure, message) {
    this.errors.push(`\`${structure.path}\` ${message}`);
    structure.hasError = true;
  }

  _check({value, structure}) {
    const {
      children,
      element,
      hasChildren,
      hasElement,
      required,
      types,
      typesStr
    } = structure;

    // Required
    if (required && isUndefined(value)) {
      this._addError(structure, 'is required');
      return;
    }

    // Skip if not required and absent
    if (!required && isUndefined(value)) return;

    // Type error
    const typeError = !this.typeChecker.check(value, types);
    if (typeError) {
      const message = `should be <${typesStr}>, received ${typeof value}`;
      this._addError(structure, message);
      return;
    }

    // Recursive calls
    if (hasChildren) {
      forEach(children, (childStructure, key) => {
        this._check({value: value[key], structure: childStructure});
      });
    }

    if (hasElement) {
      forEach(value, (childValue) => {
        this._check({value: childValue, structure: element});
      });
    }
  }
}
