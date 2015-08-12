'use strict';

var foo = require('../lib/foomod/foomod.js');
var bar = require('./lib/bar.js');

/**
 * Function f to execute App
 * @param {string} msg - description.
 */
function f(msg) {
    foo(msg);
    bar.logic();
}

module.exports = f;