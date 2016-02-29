/* global process */

var istanbul = require('browserify-istanbul');

module.exports = function(config) {
  var browserify = {
    debug: true,
    transform: []
  };

  var reporters = ['progress'];

  if (process.argv.indexOf('--debug') === -1) {
    browserify.transform.push(
      istanbul({
        ignore: [
          'tests/**'
        ]
      })
    );
    reporters.push('coverage');
  }

  config.set({
    frameworks: ['browserify', 'mocha', 'chai-sinon'],

    files: [
      'tests/test-widget.js',
      'widget.js'
    ],

    preprocessors: {
      'tests/test-widget.js': ['browserify'],
      'widget.js': ['browserify']
    },

    browserify: browserify,

    coverageReporter: {
      subdir: '.',
      reporters: [
        {type: 'html'},
        {type: 'text'},
        {type: 'json', file: 'coverage.json'}
      ]
    },

    reporters: reporters,
    browsers: ['PhantomJS'],
    port: 9876
  });
};
