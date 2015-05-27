/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-21 09:32:21
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-27 16:11:01
 */

'use strict';
module.exports = function(grunt) {
	// Unified Watch Object
	var watchFiles = {
			clientViews: [
				'public/index.shtml',
				'public/src/modules/**/*.html',
				'public/dev/*.html'
			],
			clientDirectives: [
				'public/src/modules/**/*.client.directive.html',
				'public/src/modules/**/*.client.directive.js'
			],
			clientImages: ['public/src/modules/**/img/*'],
			clientJS: ['public/src/modules/**/*.js'],
			clientCSS: ['public/src/modules/**/*.css']
		},
		cssLibFiles = [
			'public/src/lib/bootstrap/dist/css/bootstrap.min.css',
			'public/src/lib/angular-ui-select/dist/select.min.css',
			'public/src/lib/angular-motion/dist/angular-motion.min.css',
			'public/src/lib/bootstrap-additions/dist/bootstrap-additions.min.css',
			'public/src/lib/angular-loading-bar/build/loading-bar.min.css'
		],
		orderedJsAppFiles = [
			'public/src/modules/config.js',
			'public/src/modules/application.js',

			// Applications
			'public/src/modules/applications/*.js',
			'public/src/modules/applications/**/*.js',

			// Core
			'public/src/modules/core/*.js',
			'public/src/modules/core/**/*.js',

			// Employees
			'public/src/modules/employees/*.js',
			'public/src/modules/employees/**/*.js',

			// FTE-Tools
			'public/src/modules/fte-tools/*.js',
			'public/src/modules/fte-tools/**/*.js',

			// HR
			'public/src/modules/hr/*.js',
			'public/src/modules/hr/**/*.js',

			// Messages
			'public/src/modules/messages/*.js',
			'public/src/modules/messages/**/*.js',

			// Professors
			'public/src/modules/professors/*.js',
			'public/src/modules/professors/**/*.js',

			// Saras
			// 'public/src/modules/saras/*.js',
			// 'public/src/modules/saras/**/*.js',

			// Semesters
			'public/src/modules/semesters/*.js',
			'public/src/modules/semesters/**/*.js',

			// Shifts
			'public/src/modules/shifts/*.js',
			'public/src/modules/shifts/**/*.js',

			// User
			'public/src/modules/user/*.js',
			'public/src/modules/user/**/*.js',

			// Utilities
			'public/src/modules/utilities/*.js',
			'public/src/modules/utilities/**/*.js'
		],
		orderedJsLibFiles = [
			'public/src/lib/xdomain/dist/xdomain.min.js',
			'public/src/lib/jquery/dist/jquery.min.js',
			'public/src/lib/bootstrap/dist/js/bootstrap.min.js',
			'public/src/lib/angular/angular.min.js',
			'public/src/lib/angular-resource/angular-resource.min.js',
			'public/src/lib/angular-route/angular-route.min.js',
			'public/src/lib/angular-animate/angular-animate.min.js',
			'public/src/lib/angular-sanitize/angular-sanitize.min.js',
			'public/src/lib/angular-ui-router/release/angular-ui-router.min.js',
			'public/src/lib/angular-strap/dist/angular-strap.min.js',
			'public/src/lib/angular-strap/dist/angular-strap.tpl.min.js',
			'public/src/lib/ui-utils/ui-utils.min.js',
			'public/src/lib/angular-ui-select/dist/select.min.js',
			'public/src/lib/angular-img-fallback/angular.dcb-img-fallback.min.js',
			'public/src/lib/datejs/build/production/date.min.js',
			'public/src/lib/file-saver.js/FileSaver.min.js',
			'public/src/lib/underscore/underscore-min.js',
			'public/src/lib/Autolinker.js/dist/Autolinker.min.js',
			'public/src/lib/angular-loading-bar/build/loading-bar.min.js',
			'public/src/lib/ng-flow/dist/ng-flow-standalone.min.js'
		],
		LIVERELOAD_PORT = process.env.LIVERELOAD_PORT || 35729,
		commitMessage = grunt.option('cm') || 'A lazy man should be flogged';

	console.log('LIVERELOAD_PORT=' + LIVERELOAD_PORT);

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		shell: {
			commit: {
				command: 'git commit -m \'' + commitMessage + '\''
			}
		},
		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg'],
				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json', 'bower.json', 'public/index.shtml'],
				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: false,
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
				globalReplace: false,
				prereleaseName: 'dev'
			}
		},
		tags: {
			css_app: {
				options: {
					linkTemplate: '<link rel="stylesheet" type="text/css" href="dev/{{ path }}" />',
					openTag: '<!-- start template tags -->',
					closeTag: '<!-- end template tags -->'
				},
				src: [
					'public/src/modules/**/*.css'
				],
				dest: 'public/dev/dev-app.client.css.html'
			},
			css_lib: {
				options: {
					linkTemplate: '<link rel="stylesheet" type="text/css" href="dev/{{ path }}" />',
					openTag: '<!-- start template tags -->',
					closeTag: '<!-- end template tags -->'
				},
				src: cssLibFiles,
				dest: 'public/dev/dev-lib.client.css.html'
			},
			js_app: {
				options: {
					scriptTemplate: '<script src="dev/{{ path }}" type="text/javascript" charset="utf-8"></script>',
					openTag: '<!-- start template tags -->',
					closeTag: '<!-- end template tags -->'
				},
				src: orderedJsAppFiles,
				dest: 'public/dev/dev-app.client.js.html'
			},
			js_lib: {
				options: {
					scriptTemplate: '<script src="dev/{{ path }}" type="text/javascript" charset="utf-8"></script>',
					openTag: '<!-- start template tags -->',
					closeTag: '<!-- end template tags -->'
				},
				src: orderedJsLibFiles,
				dest: 'public/dev/dev-lib.client.js.html'
			}
		},
		'string-replace': {
			index: {
				files: {
					'public/index.shtml': 'public/index.shtml'
				},
				options: {
					replacements: [{
						pattern: new RegExp('\\d*\\.\\d*\\.\\d*(-(dev\\.\\d*(-g.*)?)|(-g.*)?)?', 'ig'),
						replacement: '<%= pkg.version %>'
					}]
				}
			},
			testFiles: {
				files: {
					'karma.conf.js': 'karma.conf.js'
				},
				options: {
					replacements: [{
						pattern: /orderedJsFiles\s=\s\[(.*\n)*\]/,
						replacement: function() {
							var returnString = 'orderedJsFiles = [\n';
							for (var i = 0; i < orderedJsLibFiles.length; i++) {
								returnString += '\t\'' + orderedJsLibFiles[i] + '\',\n';
							}
							returnString += '\t\'public/src/lib/angular-mocks/angular-mocks.js\',\n';
							for (i = 0; i < orderedJsAppFiles.length; i++) {
								returnString += '\t\'' + orderedJsAppFiles[i] + '\',\n';
							}
							returnString += '\t\'test/unit/modules/**/*.js\'\n]';
							return returnString;
						}
					}]
				}
			}
		},
		watch: {
			clientImages: {
				files: watchFiles.clientImages,
				options: {
					livereload: {
						port: LIVERELOAD_PORT
					}
				}
			},
			clientViews: {
				files: watchFiles.clientViews,
				options: {
					livereload: {
						port: LIVERELOAD_PORT
					}
				}
			},
			clientDirectives: {
				files: watchFiles.clientDirectives,
				options: {
					livereload: {
						port: LIVERELOAD_PORT
					}
				}
			},
			clientJS: {
				files: watchFiles.clientJS,
				tasks: ['jshint'],
				options: {
					livereload: {
						port: LIVERELOAD_PORT
					}
				}
			},
			clientCSS: {
				files: watchFiles.clientCSS,
				tasks: ['csslint'],
				options: {
					livereload: {
						port: LIVERELOAD_PORT
					}
				}
			}
		},
		jshint: {
			all: {
				src: watchFiles.clientJS,
				options: {
					jshintrc: true
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: {
				src: watchFiles.clientCSS
			}
		},
		concat: {
			app: {
				options: {
					// Replace all 'use strict' statements in the code with a single one at the top
					banner: '\'use strict\';\n',
					process: function(src, filepath) {
						return '// Source: ' + filepath + '\n' + src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
					},
					stripBanners: true,
					separator: '\n'
				},
				nonull: true,
				files: {
					'public/dist/js/application.js': orderedJsAppFiles
				}
			},
			lib: {
				options: {
					// Wrap each file in a function and remove all comments
					process: function(src) {
						return '(function() {\n' + src.replace(/^(\/\/.*\n?)|(\/\*(.|\n)*?\*\/\n?)/gm, '') + '\n})()';
					},
					separator: ';\n'
				},
				nonull: true,
				files: {
					'public/dist/lib/libraries-<%= pkg.version %>.min.js': orderedJsLibFiles
				}
			}
		},
		uglify: {
			production: {
				options: {
					banner: '/*! <%= pkg.name %> - v<%= pkg.version%> - <%= grunt.template.today("yyyy-mm-dd") %> */',
					mangle: false,
					perserveComments: 'some'
				},
				files: {
					'public/dist/application-<%= pkg.version %>.min.js': 'public/dist/application.annotated.js'
				}
			}
		},
		cssmin: {
			app: {
				files: {
					'public/dist/application-<%= pkg.version %>.min.css': 'public/src/modules/**/*.css'
				}
			},
			lib: {
				files: {
					'public/dist/lib/libraries-<%= pkg.version %>.min.css': cssLibFiles
				}
			}
		},
		ngAnnotate: {
			options: {
				add: true,
				remove: true,
				separator: ';',
				singleQuotes: true
			},
			production: {
				files: {
					'public/dist/application.annotated.js': 'public/dist/js/application.js'
				}
			}
		},
		concurrent: {
			default: ['watch'],
			debug: ['watch'],
			options: {
				logConcurrentOutput: true,
				limit: 10
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}

	});

	// Load NPM tasks
	require('load-grunt-tasks')(grunt);

	// Making grunt default to force in order not to break the project.
	// grunt.option('force', true);

	// Default task(s).
	grunt.registerTask('default', ['lint', 'concurrent:default']);

	// Debug task.
	grunt.registerTask('debug', ['lint', 'concurrent:debug']);

	// Lint task(s).
	grunt.registerTask('lint', ['jshint', 'csslint']);

	// Build task(s).
	grunt.registerTask('build', ['lint', 'concat', 'ngAnnotate', 'uglify', 'cssmin']);

	// Test task.
	grunt.registerTask('test', ['string-replace:testFiles', 'karma:unit']);

	/**************
	 * Bump task. *
	 **************/

	// Prerelease
	grunt.registerTask('bump-pr', [
		'bump-only:prerelease', 'concat:lib', 'cssmin:lib', 'string-replace:index', 'bump-commit'
	]);

	// Patch
	grunt.registerTask('bump-p', [
		'bump-only:patch', 'concat:lib', 'cssmin:lib', 'string-replace:index', 'bump-commit'
	]);

	// Minor
	grunt.registerTask('bump-m', [
		'bump-only:minor', 'concat:lib', 'cssmin:lib', 'string-replace:index', 'bump-commit'
	]);

	// Major
	grunt.registerTask('bump-M', [
		'bump-only:major', 'concat:lib', 'cssmin:lib', 'string-replace:index', 'bump-commit'
	]);

	// Prepatch
	grunt.registerTask('bump-pp', [
		'bump-only:prepatch', 'concat:lib', 'cssmin:lib', 'string-replace:index', 'bump-commit'
	]);

	// Preminor
	grunt.registerTask('bump-pm', [
		'bump-only:preminor', 'concat:lib', 'cssmin:lib', 'string-replace:index', 'bump-commit'
	]);

	// Premajor
	grunt.registerTask('bump-pM', [
		'bump-only:premajor', 'concat:lib', 'cssmin:lib', 'string-replace:index', 'bump-commit'
	]);

	grunt.registerTask('commit', ['shell:commit', 'bump-pr']);
};
