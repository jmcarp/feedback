# feedback

**feedback** allows users to submit comments on web applications via GitHub issues. Users may authenticate via GitHub to submit issues using their own accounts, or may submit issues anonymously through a GitHub bot. **feedback** consists of two components: a server-side application that submits issues to GitHub, and a client-side widget that allows users to authenticate and submit issues from your application.

## Set up GitHub

* Create a GitHub developer application at https://github.com/settings/developers
* Create a personal access token using the GitHub account that will be used to post anonymous issues at https://github.com/settings/tokens; the access token should have the `repo` scope

## Set up environment variables

* `GITHUB_USER`: GitHub user who owns the target repo
* `GITHUB_REPO`: GitHub repo to submit issues to
* `GITHUB_TOKEN`: Personal access token used for anonymous submissions
* `GITHUB_CLIENT_ID`: Client ID from GitHub developer application
* `GITHUB_CLIENT_SECRET`: Client secret from GitHub developer application
* `BASE_URL`: Base URL of feedback application
* `ORIGIN`: Base URL of submitting application

## Set up feedback widget

* Create an HTML form representing the feedback widget; see [example.html](example.html) for expected markup
* Create a toggle button that will be used to open and close the feedback widget
* Include [widget.js](widget.js) in your page
* Initialize the feedback widget, passing it DOM nodes for the feedback widget, the toggle element, and the URL of the application
