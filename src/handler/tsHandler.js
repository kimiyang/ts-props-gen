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
const Documentation = require('react-docgen/dist/Documentation');

const { namedTypes: t } = types;

function setPropDescriptor(
  documentation,
  path,
  typeParams,
) {
  if (t.ObjectTypeSpreadProperty.check(path.node)) {
    const argument = unwrapUtilityType(path.get('argument'));

    if (t.ObjectTypeAnnotation.check(argument.node)) {
      applyToFlowTypeProperties(
        documentation,
        argument,
        (propertyPath, innerTypeParams) => {
          setPropDescriptor(documentation, propertyPath, innerTypeParams);
        },
        typeParams,
      );
      return;
    }

    const name = argument.get('id').get('name');
    const resolvedPath = resolveToValue(name);

    if (resolvedPath && t.TypeAlias.check(resolvedPath.node)) {
      const right = resolvedPath.get('right');
      applyToFlowTypeProperties(
        documentation,
        right,
        (propertyPath, innerTypeParams) => {
          setPropDescriptor(documentation, propertyPath, innerTypeParams);
        },
        typeParams,
      );
    } else {
      documentation.addComposes(name.node.name);
    }
  } else if (t.ObjectTypeProperty.check(path.node)) {
    const type = getFlowType(path.get('value'), typeParams);
    const propName = getPropertyName(path);
    if (!propName) return;

    const propDescriptor = documentation.getPropDescriptor(propName);
    propDescriptor.required = !path.node.optional;
    propDescriptor.flowType = type;

    // We are doing this here instead of in a different handler
    // to not need to duplicate the logic for checking for
    // imported types that are spread in to props.
    setPropDescription(documentation, path);
  } else if (t.TSPropertySignature.check(path.node)) {
    const type = getTSType(path.get('typeAnnotation'), typeParams);

    const propName = getPropertyName(path);
    if (!propName) return;

    const propDescriptor = documentation.getPropDescriptor(propName);
    propDescriptor.required = !path.node.optional;
    propDescriptor.tsType = type;

    // We are doing this here instead of in a different handler
    // to not need to duplicate the logic for checking for
    // imported types that are spread in to props.
    setPropDescription(documentation, path);
  }
}

/**
 * This handler tries to find flow Type annotated react components and extract
 * its types to the documentation. It also extracts docblock comments which are
 * inlined in the type definition.
 */
module.exports = function flowTypeHandler(
  documentation,
  path,
) {
  let flowTypesPath = getFlowTypeFromReactComponent(path);

  if (flowTypesPath) {
    let componentName;
    if (t.FunctionExpression.check(path.node) || t.ArrowFunctionExpression.check(path.node)) {
      componentName = path.parentPath.get('id').value.name;
    } else {
      componentName = path.get('id').value.name;
    }
    documentation.set('name', componentName);
    documentation.set('type', 'component');
  } else {
    flowTypesPath = path.get('declaration');
    const interfaceName = flowTypesPath.get('id').value.name;
    documentation.set('name', interfaceName);
    documentation.set('type', 'interface');
  }

  if (!flowTypesPath) {
    return;
  }

  applyToFlowTypeProperties(
    documentation,
    flowTypesPath,
    (propertyPath, typeParams) => {
      setPropDescriptor(documentation, propertyPath, typeParams);
    },
  );
}
