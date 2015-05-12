// Karma configuration
// Generated on Tue Mar 24 2015 14:22:04 GMT-0600 (MDT)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/jquery/dist/jquery.js',
            'app/bower_components/bootstrap/dist/js/bootstrap.js',
            'app/bower_components/angular-resource/angular-resource.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/bower_components/angular-strap/dist/angular-strap.js',
            'app/bower_components/angular-strap/dist/angular-strap.tpl.js',
            'app/bower_components/ui-utils/ui-utils.js',
            'app/bower_components/angular-ui-select/dist/select.js',
            'app/bower_components/angular-img-fallback/angular.dcb-img-fallback.js',
            'app/bower_components/angular-animate/angular-animate.js',
            'app/bower_components/datejs/build/production/date.min.js',
            'app/bower_components/filesaverjs/filesaver.js',
            'app/bower_components/underscore/underscore.js',
            'app/bower_components/Autolinker.js/dist/Autolinker.js',
            'app/bower_components/angular-loading-bar/build/loading-bar.js',
            'app/js/*.js',
            'app/js/generalService.js',
            'app/js/**/*.js',
            'test/unit/*.js',
            'test/unit/**/*.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: false,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'Chrome',
            // 'Firefox',
            // 'Safari'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
