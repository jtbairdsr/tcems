/*
 * @Author: Jonathan Baird
 * @Date:   2015-04-21 09:32:21
 * @Last Modified by:   Jonathan Baird
 * @Last Modified time: 2015-05-01 10:35:43
 */

'use strict';
module.exports = function(grunt) {
	// Unified Watch Object
	var watchFiles = {
			indexViews: ['public/index.shtml'],
			clientViews: ['public/src/modules/**/views/**/*.html', 'public/dev/*.html'],
			clientImages: ['public/src/modules/**/img/*'],
			clientJS: ['public/src/modules/**/*.js'],
			clientCSS: ['public/src/modules/**/*.css']
		},
		LIVERELOAD_PORT = process.env.LIVERELOAD_PORT || 35729,
		orderedJsFiles = [
			'public/src/modules/config.js',
			'public/src/modules/application.js',
			'public/src/modules/core/*.js',
			'public/src/modules/core/config/*.js',
			'public/src/modules/core/services/*.js',
			'public/src/modules/core/factories/**/*.js',
			'public/src/modules/core/directives/*.js',
			'public/src/modules/core/controllers/*.js',
			'public/src/modules/employees/*.js',
			'public/src/modules/employees/config/*.js',
			'public/src/modules/employees/services/*.js',
			'public/src/modules/employees/factories/**/*.js',
			'public/src/modules/employees/directives/*.js',
			'public/src/modules/employees/controllers/*.js',
			'public/src/modules/professors/*.js',
			'public/src/modules/professors/config/*.js',
			'public/src/modules/professors/services/*.js',
			'public/src/modules/professors/factories/**/*.js',
			'public/src/modules/professors/directives/*.js',
			'public/src/modules/professors/controllers/*.js',
			'public/src/modules/messages/*.js',
			'public/src/modules/messages/config/*.js',
			'public/src/modules/messages/services/*.js',
			'public/src/modules/messages/factories/**/*.js',
			'public/src/modules/messages/directives/*.js',
			'public/src/modules/messages/controllers/*.js',
			'public/src/modules/saras/*.js',
			'public/src/modules/saras/config/*.js',
			'public/src/modules/saras/services/*.js',
			'public/src/modules/saras/factories/**/*.js',
			'public/src/modules/saras/directives/*.js',
			'public/src/modules/saras/controllers/*.js',
			'public/src/modules/semesters/*.js',
			'public/src/modules/semesters/config/*.js',
			'public/src/modules/semesters/services/*.js',
			'public/src/modules/semesters/factories/**/*.js',
			'public/src/modules/semesters/directives/*.js',
			'public/src/modules/semesters/controllers/*.js',
			'public/src/modules/shifts/*.js',
			'public/src/modules/shifts/config/*.js',
			'public/src/modules/shifts/services/*.js',
			'public/src/modules/shifts/factories/**/*.js',
			'public/src/modules/shifts/directives/*.js',
			'public/src/modules/shifts/controllers/*.js',
			'public/src/modules/user/*.js',
			'public/src/modules/user/config/*.js',
			'public/src/modules/user/services/*.js',
			'public/src/modules/user/factories/**/*.js',
			'public/src/modules/user/directives/*.js',
			'public/src/modules/user/controllers/*.js',
			'public/src/modules/utilities/*.js',
			'public/src/modules/utilities/config/*.js',
			'public/src/modules/utilities/services/*.js',
			'public/src/modules/utilities/factories/**/*.js',
			'public/src/modules/utilities/directives/*.js',
			'public/src/modules/utilities/controllers/*.js'
		];

	console.log('LIVERELOAD_PORT=' + LIVERELOAD_PORT);

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg'],
				commit: false,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json', 'bower.json'],
				createTag: false,
				push: false,
				globalReplace: false,
				prereleaseName: 'dev'
			}
		},
		tags: {
			css: {
				options: {
					linkTemplate: '<link rel="stylesheet" type="text/css" href="dev/{{ path }}" />',
					openTag: '<!-- start template tags -->',
					closeTag: '<!-- end template tags -->'
				},
				src: [
					'public/src/modules/**/*.css'
				],
				dest: 'public/dev/dev.client.css.html'
			},
			js: {
				options: {
					scriptTemplate: '<script src="dev/{{ path }}" type="text/javascript" charset="utf-8"></script>',
					openTag: '<!-- start template tags -->',
					closeTag: '<!-- end template tags -->'
				},
				src: orderedJsFiles,
				dest: 'public/dev/dev.client.js.html'
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
			css: {
				files: {
					'public/dev/dev.client.css.html': 'public/index.shtml'
				},
				options: {
					replacements: []
				}
			}
		},
		watch: {
			indexViews: {
				files: watchFiles.indexViews,
				options: {
					livereload: {
						port: LIVERELOAD_PORT
					}
				}
			},
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
					'public/dist/js/application.js': orderedJsFiles
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
					'public/dist/lib/libraries-<%= pkg.version %>.min.js': [
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
						'public/src/lib/angular-strap/dist/angular-strap.min.tpl.js',
						'public/src/lib/ui-utils/ui-utils.min.js',
						'public/src/lib/angular-ui-select/dist/select.min.js',
						'public/src/lib/angular-img-fallback/angular.dcb-img-fallback.min.js',
						'public/src/lib/datejs/build/datejs.min.js',
						'public/src/lib/file-saver.js/FileSaver.min.js',
						'public/src/lib/underscore/underscore-min.js',
						'public/src/lib/Autolinker.js/dist/Autolinker.min.js',
						'public/src/lib/angular-loading-bar/build/loading-bar.min.js'
					]
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
					'public/dist/lib/libraries-<%= pkg.version %>.min.css': [
						'public/src/lib/bootstrap/dist/css/bootstrap.min.css',
						'public/src/lib/angular-ui-select/dist/select.min.css',
						'public/src/lib/angular-motion/dist/angular-motion.min.css',
						'public/src/lib/bootstrap-additions/dist/bootstrap-additions.min.css',
						'public/src/lib/angular-loading-bar/build/loading-bar.min.css'
					]
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
	grunt.registerTask('test', ['karma:unit']);

	/**************
	 * Bump task. *
	 **************/

	// Prerelease
	grunt.registerTask('bump-pr', ['bump-only:prerelease', 'concat:lib', 'cssmin:lib', 'string-replace', 'bump-commit']);

	// Patch
	grunt.registerTask('bump-p', ['bump-only:patch', 'concat:lib', 'cssmin:lib', 'string-replace', 'bump-commit']);

	// Minor
	grunt.registerTask('bump-m', ['bump-only:minor', 'concat:lib', 'cssmin:lib', 'string-replace', 'bump-commit']);

	// Major
	grunt.registerTask('bump-M', ['bump-only:major', 'concat:lib', 'cssmin:lib', 'string-replace', 'bump-commit']);

	// Prepatch
	grunt.registerTask('bump-pp', ['bump-only:prepatch', 'concat:lib', 'cssmin:lib', 'string-replace', 'bump-commit']);

	// Preminor
	grunt.registerTask('bump-pm', ['bump-only:preminor', 'concat:lib', 'cssmin:lib', 'string-replace', 'bump-commit']);

	// Premajor
	grunt.registerTask('bump-pM', ['bump-only:premajor', 'concat:lib', 'cssmin:lib', 'string-replace', 'bump-commit']);
};
