'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _components = require('../components');

var _transitions = require('./transitions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// instant fade; all transition-group children must be transitions
var AnimatedSingleValue = function AnimatedSingleValue(props) {
  return _react2.default.createElement(_transitions.Fade, _extends({ component: _components.components.SingleValue }, props));
};

exports.default = AnimatedSingleValue;