
/**
 *  This is hosted by webtask.io to allow authentication via deepstream.
 */
var jwt = require('jsonwebtoken');
var uuid = require('uuid/v4');

module.exports = function(context, req, res) {
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
  var authData = context.data.authData;
  var generatedId = uuid();

  if(authData && authData.token) {

    // check if the token is a server token
    if(authData.token === serverToken) {
      cb(null, {
        username: generatedId,
        clientData: { id: generatedId },
        serverData: { hasAuthority: true }
      });

      return;
    }

    // check if the token is an auth token
    if(verifyToken(authData.token)) {
      cb(null, {
        username: generatedId,
        clientData: { id: generatedId },
        serverData: { }
      });
      return;
    }
  }

  cb(403, { error: 'Invalid Token' });

};
