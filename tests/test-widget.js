var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var Widget = require('../widget');

function expectHidden(elm) {
  expect(window.getComputedStyle(elm).display).to.equal('none');
  expect(elm.getAttribute('aria-hidden')).to.equal('true');
}

function expectVisible(elm) {
  expect(window.getComputedStyle(elm).display).to.not.equal('none');
  expect(elm.getAttribute('aria-hidden')).to.equal('false');
}

describe('widget', function() {
  before(function() {
    this.server = sinon.fakeServer.create();
  });

  beforeEach(function() {
    document.body.innerHTML =
      '<div id="feedback-toggle"></div>' +
      '<div id="feedback">' +
        '<div id="feedback-close"></div>' +
        '<form>' +
          '<textarea name="Feedback"></textarea>' +
          '<div id="feedback-login"></div>' +
          '<div id="feedback-logout"></div>' +
          '<div id="feedback-submit"></div>' +
        '</form>' +
        '<div id="feedback-message"></div>' +
      '</div>';
    this.widget = new Widget(
      document.querySelector('#feedback'),
      document.querySelector('#feedback-toggle'),
      'https://github-feedback-demo.herokuapp.com'
    );
  });

  describe('constructor', function() {
    it('locates elements', function() {
      expect(this.widget.elms.close).to.equal(document.querySelector('#feedback-close'));
      expect(this.widget.elms.login).to.equal(document.querySelector('#feedback-login'));
    });
  });

  describe('toggle', function() {
    it('hides', function() {
      this.widget.hide();
      expectHidden(this.widget.container);
    });

    it('shows', function() {
      this.widget.show();
      expectVisible(this.widget.container);
    });

    it('toggles', function() {
      this.widget.hide();
      this.widget.toggle();
      expectVisible(this.widget.container);
      this.widget.toggle();
      expectHidden(this.widget.container);
    });
  });

  describe('auth', function() {
    it('sets user', function() {
      this.widget.setUser({username: 'jmcarp'});
      expectVisible(this.widget.elms.logout);
      expectHidden(this.widget.elms.login);
    });

    it('clears user', function() {
      this.widget.clearUser();
      expectHidden(this.widget.elms.logout);
      expectVisible(this.widget.elms.login);
    });

    it('logs in', function(done) {
      sinon.spy(Widget.prototype, 'ping');
      this.server.respondWith(
        'get',
        'https://github-feedback-demo.herokuapp.com/',
        [
          200,
          {'Content-Type': 'application/json'},
          '{}'
        ]
      );
      this.widget.login();
      this.server.respond();
      expect(this.widget.popup).to.be.ok;
      this.widget.popup = null;
      window.setTimeout(
        function() {
          expect(Widget.prototype.ping).to.have.been.called;
          done();
        },
        100
      );
    });

    it('logs out', function() {
      this.server.respondWith(
        'get',
        'https://github-feedback-demo.herokuapp.com/logout',
        [
          200,
          {'Content-Type': 'application/json'},
          '{}'
        ]
      );
      this.widget.user = {username: 'jmcarp'};
      this.widget.logout();
      this.server.respond();
      expect(this.widget.user).to.be.null;
    });
  });

  describe('submit', function() {
    it('gets issue title', function() {
      expect(this.widget.getTitle()).to.include(window.location.href);
    });

    it('gets issue body', function() {
      this.widget.container.querySelector('textarea').value = 'im lovin it';
      expect(this.widget.getBody()).to.include('im lovin it');
    });

    it('submits feedback', function() {
      this.server.respondWith(
        'post',
        'https://github-feedback-demo.herokuapp.com/issue',
        [
          200,
          {'Content-Type': 'application/json'},
          '{"html_url": "https://github.com/jmcarp/feedback/issue/1"}'
        ]
      );
      this.widget.submit({preventDefault: function() {}});
      this.server.respond();
      var requests = this.server.requests;
      var request = JSON.parse(requests[requests.length - 1].requestBody);
      expect(request.title).to.equal(this.widget.getTitle());
      expect(request.body).to.equal(this.widget.getBody());
      var link = this.widget.elms.message.querySelector('a');
      expect(link).to.be.ok;
      expect(link.href).to.equal('https://github.com/jmcarp/feedback/issue/1');
    });
  });
});
