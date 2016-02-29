var Feedback = module.exports = function(container, toggle, url) {
  this.container = container;
  this.url = url;

  this.elms = {
    form: this.container.querySelector('form'),
    close: this.container.querySelector('#feedback-close'),
    login: this.container.querySelector('#feedback-login'),
    logout: this.container.querySelector('#feedback-logout'),
    submit: this.container.querySelector('#feedback-submit'),
    message: this.container.querySelector('#feedback-message')
  };

  toggle.addEventListener('click', this.toggle.bind(this));
  this.elms.close.addEventListener('click', this.hide.bind(this));
  this.elms.login.addEventListener('click', this.login.bind(this));
  this.elms.logout.addEventListener('click', this.logout.bind(this));
  this.elms.submit.addEventListener('click', this.submit.bind(this));

  this.hide();
  this.clearUser();
};

Feedback.prototype.show = function() {
  if (!this.pinged) {
    this.ping();
    this.pinged = true;
  }
  this.container.style.display = '';
  this.container.setAttribute('aria-hidden', 'false');
};

Feedback.prototype.hide = function() {
  this.container.style.display = 'none';
  this.container.setAttribute('aria-hidden', 'true');
};

Feedback.prototype.toggle = function() {
  if (this.container.style.display === 'none') {
    this.show();
  } else {
    this.hide();
  }
};

Feedback.prototype.ping = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('get', this.url + '/');
  xhr.onload = function() {
    var user = JSON.parse(xhr.responseText);
    if (Object.keys(user).length) {
      this.setUser(user);
    }
  }.bind(this);
  xhr.withCredentials = true;
  xhr.send();
};

Feedback.prototype.login = function() {
  if (this.popup) {
    this.popup.close();
  }
  this.popup = window.open(this.url + '/auth', 'Login', 'resizeable=true, width=1050, height=500');
  if (window.focus) {
    this.popup.focus();
  }
  var timer = window.setInterval(
    function() {
      if (!this.popup || this.popup.closed) {
        window.clearInterval(timer);
        this.ping();
      }
    }.bind(this),
    100
  );
};

Feedback.prototype.logout = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('get', this.url + '/logout');
  xhr.onload = function() {
    this.clearUser();
  }.bind(this);
  xhr.withCredentials = true;
  xhr.send();
};

Feedback.prototype.setUser = function(user) {
  this.user = user;
  hide(this.elms.login);
  show(this.elms.logout);
  this.elms.submit.textContent = 'Submit as ' + this.user.username;
};

Feedback.prototype.clearUser = function() {
  this.user = null;
  show(this.elms.login);
  hide(this.elms.logout);
  this.elms.submit.textContent = 'Submit';
};

Feedback.prototype.submit = function(e) {
  e.preventDefault();
  var data = {
    title: this.getTitle(),
    body: this.getBody()
  };
  var xhr = new XMLHttpRequest();
  xhr.open('post', this.url + '/issue');
  xhr.onload = function() {
    var issue = JSON.parse(xhr.responseText);
    this.elms.message.innerHTML =
      'Feedback submitted at ' +
      '<a href="' + issue.html_url + '" target="_blank">' + issue.html_url + '</a>';
    this.elms.form.reset();
  }.bind(this);
  xhr.withCredentials = true;
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.send(JSON.stringify(data));
};

Feedback.prototype.getTitle = function() {
  return 'User feedback on ' + window.location.href;
};

Feedback.prototype.getBody = function() {
  var fields = this.elms.form.querySelectorAll('textarea[name]');
  var body = Array.prototype.map.call(fields, function(elm) {
    return '## ' + elm.name + '\n' + elm.value + '\n';
  }).join('\n');
  body += '\n' +
    '* URL: ' + window.location.href + '\n' +
    '* User agent: ' + window.navigator.userAgent;
  return body;
};

function hide(elm) {
  elm.style.display = 'none';
  elm.setAttribute('aria-hidden', 'true');
}

function show(elm) {
  elm.style.display = '';
  elm.setAttribute('aria-hidden', 'false');
}
