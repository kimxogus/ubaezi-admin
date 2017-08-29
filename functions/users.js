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

exports.onFavoriteStore = functions.database
  .ref('/users/{userId}/favorites/stores/{storeId}')
  .onWrite(event => {
    const { params: { userId, storeId } } = event;
    const eventSnapshot = event.data;

    if (!eventSnapshot.exists()) {
      //on delete
      const updates = {
        [`/stores/${storeId}/favoriteUsers/${userId}`]: null,
      };

      database.ref().update(updates);
    } else if (!eventSnapshot.previous.exists()) {
      // on create
      const updates = {
        [`/stores/${storeId}/favoriteUsers/${userId}`]: true,
      };

      database.ref().update(updates);
    }
  });

exports.onFavoriteMenuGroup = functions.database
  .ref('/users/{userId}/favorites/menuGroups/{menuGroupId}')
  .onWrite(event => {
    const { params: { userId, menuGroupId } } = event;
    const eventSnapshot = event.data;

    if (!eventSnapshot.exists()) {
      //on delete
      const updates = {
        [`/menuGroups/${menuGroupId}/favoriteUsers/${userId}`]: null,
      };

      database.ref().update(updates);
    } else if (!eventSnapshot.previous.exists()) {
      // on create
      const updates = {
        [`/menuGroups/${menuGroupId}/favoriteUsers/${userId}`]: true,
      };

      database.ref().update(updates);
    }
  });

exports.onFavoriteMenu = functions.database
  .ref('/users/{userId}/favorites/menus/{menuId}')
  .onWrite(event => {
    const { params: { userId, menuId } } = event;
    const eventSnapshot = event.data;

    if (!eventSnapshot.exists()) {
      //on delete
      const updates = {
        [`/menus/${menuId}/favoriteUsers/${userId}`]: null,
      };

      database.ref().update(updates);
    } else if (!eventSnapshot.previous.exists()) {
      // on create
      const updates = {
        [`/menus/${menuId}/favoriteUsers/${userId}`]: true,
      };

      database.ref().update(updates);
    }
  });

exports.onUserDelete = functions.auth.user().onDelete(event => {
  const { uid } = event.data;

  database.ref(`/users/${uid}`).remove();
});
