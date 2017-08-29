const { admin, database, functions } = require('./lib');

exports.onUserJoin = functions.auth.user().onCreate(event => {
  const { uid } = event.data;

  database.ref(`/users/${uid}`).set({
    uid,
    favorites: {
      stores: {},
      menus: {},
      menuGroups: {},
    },
  });
});

exports.onUserDelete = functions.auth.user().onDelete(event => {
  const { uid } = event.data;

  database.ref(`/users/${uid}`).remove();
});
