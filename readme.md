# grunt-github-release

```shell
npm install juliangarritano/grunt-github-release --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-release');
```

## Using grunt-release

For grunt-github-release to work correctly you need the following previously set as grunt options or environment variables:
    
`GITHUB_ACCESS_TOKEN`
`GITHUB_REPO`
`RELEASE_VERSION`

And, optionally:

`RELEASE_NOTES`

A release will be created with body RELEASE_NOTES in github

`grunt githubRelease`