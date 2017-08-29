const { admin, functions, database } = require('./lib');

exports.onStoreWrite = functions.database.ref('/stores/{id}').onWrite(event => {
  const { params: { id } } = event;
  const eventSnapshot = event.data;
  const data = eventSnapshot.val();
  if (!eventSnapshot.exists()) {
    // on delete
    const previous = eventSnapshot.previous.val();

    const menuGroupUpdates = Object.keys(previous.menuGroups).reduce((a, b) => {
      a[`/menuGroups/${b}`] = null;
      return a;
    }, {});

    const menuUpdates = Object.keys(previous.menus).reduce((a, b) => {
      a[`/menus/${b}`] = null;
      return a;
    }, {});

    database.ref().update(Object.assign({}, menuGroupUpdates, menuUpdates));
  } else {
    // on create or update
    const updates = {};

    if (!eventSnapshot.previous.exists()) {
      updates[`/stores/${id}/menuGroups`] = data.menuGroups =
        data.menuGroups || {};
      updates[`/stores/${id}/menus`] = data.menus = data.menus || {};
      updates[`/stores/${id}/favoriteUsers`] = data.favoriteUsers =
        data.favoriteUsers || {};
    }

    if (
      eventSnapshot.child('menuGroups').changed() ||
      updates[`/stores/${id}/menuGroups`]
    ) {
      updates[`/stores/${id}/menuGroupCount`] = Object.keys(
        data.menuGroups
      ).length;
    }

    if (
      eventSnapshot.child('menus').changed() ||
      updates[`/stores/${id}/menus`]
    ) {
      updates[`/stores/${id}/menuCount`] = Object.keys(data.menus).length;
    }

    if (
      eventSnapshot.child('favoriteUsers').changed() ||
      updates[`/stores/${id}/favoriteUsers`]
    ) {
      updates[`/stores/${id}/favoriteUserCount`] = Object.keys(
        data.favoriteUsers
      ).length;
    }

    if (Object.keys(updates).length) {
      database.ref().update(updates);
    }
  }
});
