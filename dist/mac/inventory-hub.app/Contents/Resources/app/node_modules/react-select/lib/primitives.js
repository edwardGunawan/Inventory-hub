'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.A11yText = exports.Input = exports.Span = exports.Div = exports.Button = undefined;

var _emotion = require('emotion');

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var createPrimitive = function createPrimitive(Tag) {
  return function (_ref) {
    var css = _ref.css,
        innerRef = _ref.innerRef,
        props = _objectWithoutProperties(_ref, ['css', 'innerRef']);

    return _react2.default.createElement(Tag, _extends({ ref: innerRef, className: (0, _emotion.css)(css)
    }, props));
  };
};

var Button = exports.Button = createPrimitive('button');
var Div = exports.Div = createPrimitive('div');
var Span = exports.Span = createPrimitive('span');
var Input = exports.Input = createPrimitive('input');

// Assistive text to describe visual elements. Hidden for sighted users.
var A11yText = exports.A11yText = function A11yText(props) {
  return _react2.default.createElement('span', _extends({
    className: (0, _emotion.css)({
      border: 0,
      clip: 'rect(1px, 1px, 1px, 1px)',
      height: 1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1
    })
  }, props));
};