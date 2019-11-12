const types = require('ast-types');
const getFlowType = require('react-docgen/dist/utils/getFlowType').default;
const getTSType = require('react-docgen/dist/utils/getTSType').default;
const getPropertyName = require('react-docgen/dist/utils/getPropertyName').default;
const getFlowTypeFromReactComponent = require('react-docgen/dist/utils/getFlowTypeFromReactComponent').default;
const { applyToFlowTypeProperties } = require('react-docgen/dist/utils/getFlowTypeFromReactComponent');
const resolveToValue = require('react-docgen/dist/utils/resolveToValue').default;
const setPropDescription = require('react-docgen/dist/utils/setPropDescription').default;
const { unwrapUtilityType } = require('react-docgen/dist/utils/flowUtilityTypes');
const TypeParameters = require('react-docgen/dist/utils/getTypeParameters').default;
const Documentation = require('react-docgen/dist/Documentation').default;
const getMemberValuePath  = require('react-docgen/dist/utils/getMemberValuePath').default;
const printValue = require('react-docgen/dist/utils/printValue').default;
const resolveFunctionDefinitionToReturnValue = require('react-docgen/dist/utils/resolveFunctionDefinitionToReturnValue').default;
const isReactComponentClass = require('react-docgen/dist/utils/isReactComponentClass').default;
const isReactForwardRefCall = require('react-docgen/dist/utils/isReactForwardRefCall').default;


const { namedTypes: t } = types;

function getDefaultValue(path) {
  let node = path.node;
  let defaultValue;
  if (t.Literal.check(node)) {
    defaultValue = node.raw;
  } else {
    if (t.AssignmentPattern.check(path.node)) {
      path = resolveToValue(path.get('right'));
    } else {
      path = resolveToValue(path);
    }
    if (t.ImportDeclaration.check(path.node)) {
      defaultValue = node.name;
    } else {
      node = path.node;
      defaultValue = printValue(path);
    }
  }
  if (typeof defaultValue !== 'undefined') {
    return {
      value: defaultValue,
      computed:
        t.CallExpression.check(node) ||
        t.MemberExpression.check(node) ||
        t.Identifier.check(node),
    };
  }

  return null;
}

function getStatelessPropsPath(componentDefinition) {
  const value = resolveToValue(componentDefinition);
  if (isReactForwardRefCall(value)) {
    const inner = value.get('arguments', 0);
    return inner.get('params', 0);
  }
  return value.get('params', 0);
}

function getDefaultPropsPath(componentDefinition) {
  let defaultPropsPath = getMemberValuePath(
    componentDefinition,
    'defaultProps',
  );
  if (!defaultPropsPath) {
    return null;
  }

  defaultPropsPath = resolveToValue(defaultPropsPath);
  if (!defaultPropsPath) {
    return null;
  }

  if (t.FunctionExpression.check(defaultPropsPath.node)) {
    // Find the value that is returned from the function and process it if it is
    // an object literal.
    const returnValue = resolveFunctionDefinitionToReturnValue(
      defaultPropsPath,
    );
    if (returnValue && t.ObjectExpression.check(returnValue.node)) {
      defaultPropsPath = returnValue;
    }
  }
  return defaultPropsPath;
}

function getDefaultValuesFromProps(
  properties,
  documentation,
  isStateless,
) {
  properties
    .filter(propertyPath => t.Property.check(propertyPath.node))
    // Don't evaluate property if component is functional and the node is not an AssignmentPattern
    .filter(
      propertyPath =>
        !isStateless ||
        t.AssignmentPattern.check(propertyPath.get('value').node),
    )
    .forEach(propertyPath => {
      const propName = getPropertyName(propertyPath);
      if (!propName) return;

      const propDescriptor = documentation.getPropDescriptor(propName);
      const defaultValue = getDefaultValue(
        isStateless
          ? propertyPath.get('value', 'right')
          : propertyPath.get('value'),
      );
      if (defaultValue) {
        propDescriptor.defaultValue = defaultValue;
      }
    });
}

module.exports = function defaultPropsHandler(
  documentation,
  componentDefinition,
) {
  try {
    let statelessProps = null;
    const defaultPropsPath = getDefaultPropsPath(componentDefinition);
    /**
     * function, lazy, memo, forwardRef etc components can resolve default props as well
     */
    if (!isReactComponentClass(componentDefinition)) {
      statelessProps = getStatelessPropsPath(componentDefinition);
    }
  
    // Do both statelessProps and defaultProps if both are available so defaultProps can override
    if (statelessProps && t.ObjectPattern.check(statelessProps.node)) {
      getDefaultValuesFromProps(
        statelessProps.get('properties'),
        documentation,
        true,
      );
    }
    if (defaultPropsPath && t.ObjectExpression.check(defaultPropsPath.node)) {
      getDefaultValuesFromProps(
        defaultPropsPath.get('properties'),
        documentation,
        false,
      );
    }
  } catch(ex) {
    // do nothing;
  }

}
