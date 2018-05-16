# my-passport-idcs
(draft) IDCS samples using Node.js and Passport.js

Integrating a custom Node.js application with Oracle Identity Cloud Service (IDCS) using Passport.js, a flexible and modular authentication middleware.

In this integration:

Identity Cloud Service acts as OAuth 2.0 and OpenID Connect authorization server, providing Single Sign-On for the Node.js application.

The Node.js application acts as OAuth client.

The Node.js application is built using the following packages:
  https, express, and ejs: Provides a middleware framework (express), view (ejs), and transport encryption (https) for the application.
  passport: Provides an authentication middleware for Node.js on top of the Express web framework, facilitating the access control for the application. Passport.js supports multiple ways of authenticating your applications through modular strategies.
  passport-oauth-oidcs: This Passport.js strategy, created by Oracle, provides the ability to integrate Node.js middleware authentication with Oracle Identity Cloud Service via OAuth2 and OpenID Connect. The strategy works based on your identity cloud service settings and insulates you from the OpenID and OAuth2 authentication process.
  express-session, cookie-parser, and body-parser: Provides supporting services for the passportjs middleware. This includes the ability to keep user sessions on the node server (express-session), provide cookies to logged users (cookie-parser), and get information from the http body (body-parser).

LAB content: Artur Alves, Oracle EMEA Cloud Pursuit Team.
Contributor(s): Indranil Jha/Todd Elwood/Junyi He/Frederico Hakamine, Oracle.
Template(s): Oracle Help Center.