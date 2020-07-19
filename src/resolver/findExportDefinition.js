const types = require('ast-types');
const isExportsOrModuleAssignment = require('react-docgen/dist/utils/isExportsOrModuleAssignment').default;
const isReactComponentClass = require('react-docgen/dist/utils/isReactComponentClass').default;
const isReactCreateClassCall = require('react-docgen/dist/utils/isReactCreateClassCall').default;
const isReactForwardRefCall = require('react-docgen/dist/utils/isReactForwardRefCall').default;
const isStatelessComponent = require('react-docgen/dist/utils/isStatelessComponent').default;
const normalizeClassDefinition = require('react-docgen/dist/utils/normalizeClassDefinition').default;
const resolveExportDeclaration = require('react-docgen/dist/utils/resolveExportDeclaration').default;
const resolveToValue = require('react-docgen/dist/utils/resolveToValue').default;
const resolveHOC = require('react-docgen/dist/utils/resolveHOC').default;



const { visit, namedTypes: t } = types;

function ignore() {
  return false;
}

function isComponentDefinition(path) {
  return (
    isReactCreateClassCall(path) ||
    isReactComponentClass(path) ||
    isStatelessComponent(path) ||
    isReactForwardRefCall(path)
  );
}

function resolveDefinition(definition) {
  if (isReactCreateClassCall(definition)) {
    // return argument
    const resolvedPath = resolveToValue(definition.get('arguments', 0));
    if (t.ObjectExpression.check(resolvedPath.node)) {
      return resolvedPath;
    }
  } else if (isReactComponentClass(definition)) {
    normalizeClassDefinition(definition);
    return definition;
  } else if (
    isStatelessComponent(definition) ||
    isReactForwardRefCall(definition)
  ) {
    return definition;
  }
  return null;
}

/**
 * Given an AST, this function tries to find the exported component definitions.
 *
 * The component definitions are either the ObjectExpression passed to
 * `React.createClass` or a `class` definition extending `React.Component` or
 * having a `render()` method.
 *
 * If a definition is part of the following statements, it is considered to be
 * exported:
 *
 * modules.exports = Definition;
 * exports.foo = Definition;
 * export default Definition;
 * export var Definition = ...;
 */
module.exports = function findExportedComponentDefinitions(ast) {
  const components = [];
  const interfaces = [];

  function exportDeclaration(path) {
    const definitions = resolveExportDeclaration(path)
      .reduce((acc, definition) => {
        if (t.InterfaceDeclaration.check(definition.node)) {
          interfaces.push(path);
        }
        else if (isComponentDefinition(definition)) {
          acc.push(definition);
        } else {
          const resolved = resolveToValue(resolveHOC(definition));
          if (isComponentDefinition(resolved)) {
            acc.push(resolved);
          }
        }
        return acc;
      }, [])
      .map(definition => resolveDefinition(definition));

    if (definitions.length === 0) {
      return false;
      // definitions.push(path);
    }
    definitions.forEach(definition => {
      if (definition && components.indexOf(definition) === -1) {
        components.push(definition);
      }
    });
    return false;
  }

  function statelessVisitor(path) {
    if (isStatelessComponent(path)) {
      components.push(path);
    }
    return false;
  }

  visit(ast, {
    visitFunctionDeclaration: statelessVisitor,
    visitFunctionExpression: statelessVisitor,
    visitClassDeclaration: ignore,
    visitClassExpression: ignore,
    visitIfStatement: ignore,
    visitWithStatement: ignore,
    visitSwitchStatement: ignore,
    visitCatchCause: ignore,
    visitWhileStatement: ignore,
    visitDoWhileStatement: ignore,
    visitForStatement: ignore,
    visitForInStatement: ignore,

    visitExportDeclaration: exportDeclaration,
    visitExportNamedDeclaration: exportDeclaration,
    visitExportDefaultDeclaration: exportDeclaration,

    visitAssignmentExpression: function(path) {
      // Ignore anything that is not `exports.X = ...;` or
      // `module.exports = ...;`
      if (!isExportsOrModuleAssignment(path)) {
        return false;
      }
      // Resolve the value of the right hand side. It should resolve to a call
      // expression, something like React.createClass
      path = resolveToValue(path.get('right'));
      if (!isComponentDefinition(path)) {
        path = resolveToValue(resolveHOC(path));
        if (!isComponentDefinition(path)) {
          return false;
        }
      }
      const definition = resolveDefinition(path);
      if (definition && components.indexOf(definition) === -1) {
        components.push(definition);
      }
      return false;
    },
  });

  return components.concat(interfaces);
}
