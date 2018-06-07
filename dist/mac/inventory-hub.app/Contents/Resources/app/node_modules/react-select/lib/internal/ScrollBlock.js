'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _emotion = require('emotion');

exports.default = ScrollBlock;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('./ScrollLock/index');

var _index2 = _interopRequireDefault(_index);

var _primitives = require('../primitives');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ScrollBlock() {
  return _react2.default.createElement(
    _primitives.Div,
    {
      className: (0, _emotion.css)({ position: 'fixed', left: 0, bottom: 0, right: 0, top: 0 })
    },
    _react2.default.createElement(_index2.default, null)
  );
}