const { admin, database, functions } = require('./lib');

exports.onUserJoin = functions.auth.user().onCreate(event => {
  const { uid, displayName, email, emailVerified } = event.data;

  database.ref(`/users/${uid}`).set({
    uid,
    username: displayName,
    emails: email ? { [email]: true } : {},
    unistar: email ? email.endsWith('@unist.ac.kr') : null,
    emailVerified,
    favorites: {
      stores: {},
      storeCount: 0,
      menus: {},
      menuCount: 0,
      menuGroups: {},
      menuGroupCount: 0,
    },
  });
});

exports.onFavoriteStores = functions.database
  .ref('/users/{userId}/favorites/stores')
  .onWrite(event => {
    const { params: { userId } } = event;
    const eventSnapshot = event.data;

    const count = Object.keys(eventSnapshot.val()).length;
    if (count !== Object.keys(eventSnapshot.previous.val())) {
      database.ref(`/users/${userId}/favorites/storeCount`).set(count);
    }
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
        [`/stores/${storeId}/favoriteUsers/${userId}`]: new Date().getTime(),
      };

      database.ref().update(updates);
    }
  });

exports.onFavoriteMenuGroups = functions.database
  .ref('/users/{userId}/favorites/menuGroups')
  .onWrite(event => {
    const { params: { userId } } = event;
    const eventSnapshot = event.data;

    const count = Object.keys(eventSnapshot.val()).length;
    if (count !== Object.keys(eventSnapshot.previous.val())) {
      database.ref(`/users/${userId}/favorites/menuGroupsCount`).set(count);
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
        [`/menuGroups/${menuGroupId}/favoriteUsers/${userId}`]: new Date().getTime(),
      };

      database.ref().update(updates);
    }
  });

exports.onFavoriteMenus = functions.database
  .ref('/users/{userId}/favorites/menus')
  .onWrite(event => {
    const { params: { userId } } = event;
    const eventSnapshot = event.data;

    const count = Object.keys(eventSnapshot.val()).length;
    if (count !== Object.keys(eventSnapshot.previous.val())) {
      database.ref(`/users/${userId}/favorites/menusCount`).set(count);
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
        [`/menus/${menuId}/favoriteUsers/${userId}`]: new Date().getTime(),
      };

      database.ref().update(updates);
    }
  });

exports.onUserDelete = functions.auth.user().onDelete(event => {
  const { uid } = event.data;

  database.ref(`/users/${uid}`).once('value', userData => {
    const favorites = userData.child('favorites');

    const stores = favorites.child('stores').val();
    const storesUpdates = Object.keys(stores).reduce((a, b) => {
      a[`/stores/${b.id}/favoriteUsers/${uid}`] = null;
      return a;
    }, {});

    const menus = favorites.child('menus').val();
    const menusUpdates = Object.keys(menus).reduce((a, b) => {
      a[`/menus/${b.id}/favoriteUsers/${uid}`] = null;
      return a;
    }, {});

    const menuGroups = favorites.child('menuGroups').val();
    const menuGroupsUpdates = Object.keys(menuGroups).reduce((a, b) => {
      a[`/menuGroups/${b.id}/favoriteUsers/${uid}`] = null;
      return a;
    }, {});

    database.ref().update(
      Object.assign(
        {
          [`/users/${uid}`]: null,
        },
        storesUpdates,
        menusUpdates,
        menuGroupsUpdates
      )
    );
  });
});
