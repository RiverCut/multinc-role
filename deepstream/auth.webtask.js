
/**
 *  This is hosted by webtask.io to allow authentication via deepstream.
 */
var jwt = require('jsonwebtoken');
var uuid = require('uuid').v4;

module.exports = function(context, cb) {
  if(!context.data) return;

  function verifyToken(token) {
    try {
      jwt.verify(token, context.secrets.AUTH0_SECRET, { algorithms: ['HS256'] });
      return true;
    } catch(e) {
      return false;
    }
  }

  var serverToken = context.secrets.SERVER_TOKEN;
  var authData = context.body.authData;
  var generatedId = uuid();

  if(authData && authData.token) {

    // check if the token is a server token
    if(authData.token === serverToken) {
      cb(null, {
        username: 'server-' + generatedId,
        clientData: { id: 'server-' + generatedId },
        serverData: { hasAuthority: true }
      });

      return;
    }

    // check if the token is an auth token
    if(verifyToken(authData.token)) {

      var decodedToken = jwt.decode(authData.token);
      var username = decodedToken['http://multinc/username'];

      cb(null, {
        username: username,
        clientData: { id: username },
        serverData: { }
      });
      return;
    }
  }

  cb(403, { error: 'Invalid Token' });

};
