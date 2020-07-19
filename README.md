# ts-props-gen

`ts-props-gen` is a CLI and toolbox to help extracting props info from [React](http://facebook.github.io/react/) components written in Typescript. It's based on [react-docgen](https://github.com/reactjs/react-docgen)

## Install

Install the module with yarn or npm:

```
yarn add ts-props-gen --dev
```

```
npm install --save-dev ts-props-gen
```

## CLI
```
Usage: ts-props-gen [path]... [options]

path     A component file or directory.

Options:
   -o FILE,  store extracted information in FILE

Extract meta information from React components.

example: ts-props-gen.js "./src/*/*.tsx" -o ./result.json
```
## API
```js
var tsPropsGen = require('ts-props-gen');
// options will be passed to react-docgen parse function, it's optional
var propsInfo = tsPropsGen.genProps(src, options);
```


### Example
for the following component

```tsx
import React from 'react';

export interface CC {
  ccName?: string,
}

export interface Complex {
  attrA?: string,
  attrB?: string,
  /** this is complex prop */
  attrC?: CC,
}

export interface CardProps {
  /** no-config */
  prefixCls?: string;
  /** array of complex props */
  complex?: Complex[];
  complex2?: Complex;
  complex3?: string[];
  onButtonClick?: (e: Event) => void;
}


class Card extends React.Component<CardProps> {
  static defaultProps = {
    prefixCls: 'card',
  };

  render() {
    return (
      <div>hello world</div>
    );
  }
}


export default Card;

```

we will get:
```json
{
  "Card": {
    "name": "Card",
    "type": "component",
    "props": {
      "prefixCls": {
        "required": false,
        "flowType": {
          "name": "string"
        },
        "description": "no-config",
        "defaultValue": {
          "value": "'card'",
          "computed": false
        }
      },
      "complex": {
        "required": false,
        "flowType": {
          "name": "Array",
          "elements": [
            {
              "name": "Complex"
            }
          ],
          "raw": "Complex[]"
        },
        "description": "array of complex props",
        "defaultValue": {
          "value": "{\n  attrA: 'I am default attrA value',\n  attrB: 'I am default attrB value',\n}",
          "computed": false
        }
      },
      "complex2": {
        "required": false,
        "flowType": {
          "name": "Complex"
        },
        "description": ""
      },
      "complex3": {
        "required": false,
        "flowType": {
          "name": "Array",
          "elements": [
            {
              "name": "string"
            }
          ],
          "raw": "string[]"
        },
        "description": ""
      },
      "onButtonClick": {
        "required": false,
        "flowType": {
          "name": "signature",
          "type": "function",
          "raw": "(e: Event) => void",
          "signature": {
            "arguments": [
              {
                "name": "e",
                "type": {
                  "name": "Event"
                }
              }
            ],
            "return": {
              "name": "void"
            }
          }
        },
        "description": "",
        "defaultValue": {
          "value": "() => {}",
          "computed": false
        }
      }
    }
  },
  "CC": {
    "name": "CC",
    "type": "interface",
    "props": {
      "ccName": {
        "required": false,
        "flowType": {
          "name": "string"
        },
        "description": ""
      }
    }
  },
  "Complex": {
    "name": "Complex",
    "type": "interface",
    "props": {
      "attrA": {
        "required": false,
        "flowType": {
          "name": "string"
        },
        "description": ""
      },
      "attrB": {
        "required": false,
        "flowType": {
          "name": "string"
        },
        "description": ""
      },
      "attrC": {
        "required": false,
        "flowType": {
          "name": "CC"
        },
        "description": "this is complex prop"
      }
    }
  },
  "CardProps": {
    "name": "CardProps",
    "type": "interface",
    "props": {
      "prefixCls": {
        "required": false,
        "flowType": {
          "name": "string"
        },
        "description": "no-config"
      },
      "complex": {
        "required": false,
        "flowType": {
          "name": "Array",
          "elements": [
            {
              "name": "Complex"
            }
          ],
          "raw": "Complex[]"
        },
        "description": "array of complex props"
      },
      "complex2": {
        "required": false,
        "flowType": {
          "name": "Complex"
        },
        "description": ""
      },
      "complex3": {
        "required": false,
        "flowType": {
          "name": "Array",
          "elements": [
            {
              "name": "string"
            }
          ],
          "raw": "string[]"
        },
        "description": ""
      },
      "onButtonClick": {
        "required": false,
        "flowType": {
          "name": "signature",
          "type": "function",
          "raw": "(e: Event) => void",
          "signature": {
            "arguments": [
              {
                "name": "e",
                "type": {
                  "name": "Event"
                }
              }
            ],
            "return": {
              "name": "void"
            }
          }
        },
        "description": ""
      }
    }
  }
}
```

## why ts-props-gen?
1. react-docgen only parse a single file while ts-props-gen can parse all files in a folder and save the result into a single file.
2. react-docgen helps to generate props from react component in typescript but for those props are interfaces defined in current file or other files, react-docgen will not be able to provide the full information. For example above, react-docgen will not extract `interface Complex`, while ts-props-gen will extract all exported interfaces.