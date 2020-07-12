import React from 'react';
import classnames from 'classnames';
import { SpmInfoProps } from '../Container';

export interface TextProps {
  className?: string;
  color?: string;
  size?: string;
  fixHeight?: boolean;
  alipay?: boolean;
  ellipsis?: boolean;
  bold?: boolean;
  inline?: boolean;
  wrap?: boolean;
  style?: React.CSSProperties;
  spmInfo?: SpmInfoProps;
  onClick?: () => void;
}

const Text: React.FC<TextProps> = function (props: TextProps) {
  const {
    className = '',
    color = '',
    size = '',
    fixHeight = false,
    alipay = false,
    ellipsis = false,
    bold = false,
    inline = false,
    wrap = false,
    children = '',
    style = {},
    spmInfo = null,
    onClick,
  } = props || {};

  const prefixCls = 'wu-text';

  const textClass = classnames(prefixCls, {
    [`wu-color-${color}`]: !!color, // 预置颜色样式
    [`wu-font-${size}`]: !!size, // 预置字体样式
    'wu-alipay-number': !!alipay, // 使用alipayNumber字体
    'wu-line-ellipsis': !!ellipsis, // 使用单行超过显示...
    [`wu-font-${size}-ellipsis-height`]: !!ellipsis, // 单行显示的特殊处理，为了解决安卓上字体偏移问题
    [`wu-font-${size}-height`]: !ellipsis && !wrap && size && fixHeight, // 定高
    [`${prefixCls}-bold`]: !!bold, // 加粗
    [`${prefixCls}-wrap`]: !!wrap, // 可换行
    [`${prefixCls}-inline`]: !!inline, // inline-block
  }, className);

  let textStyle: any = {};

  // 设置color
  if (color && color[0] === '#') {
    textStyle.color = color;
  }

  // 使用传入的style进行覆盖
  textStyle = {
    ...textStyle,
    ...style,
  };

  if (spmInfo || onClick) {
    const { spm = '', param = '' } = spmInfo || {};
    return (
      <div className={textClass} style={textStyle}
        onClick={onClick}
        data-aspm-click={spm}
        data-aspm-expo
        data-aspm-param={param}
      >
        {children}
      </div>
    );
  }
  return (
    <div className={textClass} style={textStyle}>
      {children}
    </div>
  );
};

export default Text;
