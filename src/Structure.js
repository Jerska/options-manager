import forEach from 'lodash/forEach';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isNull from 'lodash/isNull';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

export default class Structure {
  constructor(structure, thrower, path = null) {
    this.path = path;
    this.hasError = false;

    // Structure
    if (isUndefined(structure)) {
      thrower.throw(`${path}'s \`structure\` must be defined`);
    }

    // Required and default value
    this.required = structure.required === true;
    this.hasValue = structure.hasOwnProperty('value');
    this.value = structure.value;
    if (this.hasValue && this.required) {
      thrower.throw(`\`${path}\` can't be \`required\` and have a \`value\``);
    }

    // Types
    if (!isString(structure.type)) {
      thrower.throw(`\`${path}\` must have a \`type\``);
    }
    this.types = structure.type.split('|');
    this.typesStr = this.types.join('|');

    // Element and Children
    this.hasElement = !isUndefined(structure.element);
    this.hasChildren = !isUndefined(structure.children);
    if (this.hasElement && this.hasChildren) {
      thrower.throw(`\`${path}\`'s structure can't have both \`element\` and \`children\``);
    }

    // Children
    this.children = null;
    if (this.hasChildren) {
      this.children = isArray(structure.children) ? [] : {};
      forEach(structure.children, (childStructure, childName) => {
        const toAdd = isArray(structure.children) ? `[${childName}]` : `.${childName}`;
        this.children[childName] = new Structure(childStructure, thrower, this._childPath(toAdd));
      });
    }

    // Element
    this.element = null;
    if (this.hasElement) {
      this.element = new Structure(structure.element, thrower, this._childPath('[]'));
      if (this.element.hasValue) {
        thrower.throw(`\`${path}[]\` is an \`element\`, it can't have a \`value\``);
      }
      if (this.element.required) {
        thrower.throw(`\`${path}[]\` is an \`element\`, it can't be \`required\``);
      }
    }
  }

  usage(name = null, indent = 4) {
    const indentation = new Array(indent + 1).join(' ');

    const requiredChar = this.required ? '*' : ' ';
    const errorChar = this.hasError > 0 ? 'X' : ' ';
    const prefix = requiredChar + errorChar + indentation.substring(0, indentation.length - 2);

    const hasName = !isUndefined(name) && !isNull(name) && !isNumber(name);
    if (!hasName) name = '';

    let res = `${prefix}${name}<${this.typesStr}>`;

    if ((!isNull(this.children) || !isNull(this.element)) && hasName) res += ': ';

    if (!isNull(this.children)) {
      const childrenArray = isArray(this.children);
      res += childrenArray ? '[' : '{';
      res += '\n';
      let childrenUsages = [];
      forEach(this.children, (childStructure, childName) => {
        childrenUsages.push(childStructure.usage(childName, indent + 2));
      });
      res += childrenUsages.join(',\n');
      res += `\n${indentation}`;
      res += childrenArray ? ']' : '}';
    }

    if (!isNull(this.element)) {
      res += `[${this.element.usage(null, indent).substr(indent)}]`;
    }

    if (this.hasValue) res += ` = ${JSON.stringify(this.value)}`;
    return res;
  }

  _childPath(child) {
    return isNull(this.path) ? child : `${this.path}${child}`;
  }
}
