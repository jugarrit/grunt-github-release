'user strict';

var request = require('superagent');
var Q = require('q');
var _ = require('underscore');

grunt.registerTask('githubRelease', function() {
    var done = this.async();

    var GITHUB_ACCESS_TOKEN = grunt.option('GITHUB_ACCESS_TOKEN') || process.env.GITHUB_ACCESS_TOKEN;
    var GITHUB_REPO = grunt.option('GITHUB_REPO') || process.env.GITHUB_REPO;
    var RELEASE_VERSION = grunt.option('RELEASE_VERSION');
    var RELEASE_NOTES = grunt.option('RELEASE_NOTES');

    // If the tag doesn't exist release creation will fail with unexpected error.
    // This task will retry fetching the tags in the case where tag was uploaded directly before running this task
    function verifyTagExists() {
        var deferred = Q.defer();
        var attempts = 0;

        function doRequest() {
            attempts++;

            request
                .get('https://api.github.com/repos/' + GITHUB_REPO + '/tags')
                .auth(GITHUB_ACCESS_TOKEN, '')
                .end(function(err, res) {
                    if (res && res.statusCode === 200) {
                        for (var i = 0; i < res.body.length; i++) {
                            if (res.body[i].name === grunt.option('RELEASE_VERSION')) {
                                deferred.resolve();
                                return;
                            }
                        }
                    }

                    if (attempts > 3) {
                        deferred.reject();
                    } else {
                        grunt.log.writeln('Tag not found... Retrying.');
                        setTimeout(doRequest, 1000);
                    }
                });
        }

        doRequest();

        return deferred.promise;
    }

    verifyTagExists().then(function() {
        var data = {
            tag_name: RELEASE_VERSION
        };

        // If release notes are supplied, send with release creation
        if (RELEASE_NOTES) {
            _.extend(data, {
                body: RELEASE_NOTES
            });
        }

        request
            .post('https://api.github.com/repos/' + GITHUB_REPO + '/releases')
            .auth(GITHUB_ACCESS_TOKEN, '')
            .send(data)
            .end(function(err, res) {
                if (res && res.statusCode === 201) {
                    grunt.log.ok('Github release successful');
                    done();
                } else {
                    grunt.log.error(err);
                    grunt.fail.fatal('Github release failed.');
                }
            });
    }).fail(function() {
        grunt.log.error('Error creating github release. Tag not found.');
        grunt.fail.fatal('Github release failed.');
    });
});
