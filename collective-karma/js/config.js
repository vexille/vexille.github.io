// Original concepts provided by Backbone Boilerplate project: https://github.com/tbranyen/backbone-boilerplate
require.config({
    // Initialize the application with the main application file
    deps: ["main"],
    baseUrl: "js",
    paths: {
        // Libraries
        jquery: "libs/jquery.min",
        lodash: "libs/lodash.min",
        parse: "libs/parse.min",
        text: 'libs/text',
        theater: 'libs/theater',
        template: '../templates',
    },
    shim: {
        parse: {
            deps: ["lodash", "jquery"],
            exports: "Parse"
        }
    }
});
