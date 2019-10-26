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
