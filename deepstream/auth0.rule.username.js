function (user, context, callback) {
  context.idToken['http://yournamespace/username'] = user.username;
  callback(null, user, context);
}
