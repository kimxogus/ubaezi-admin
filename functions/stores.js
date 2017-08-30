const { admin, functions, database } = require('./lib');

exports.onStoreWrite = functions.database.ref('/stores/{id}').onWrite(event => {
  const { params: { id } } = event;
  const eventSnapshot = event.data;
  const data = eventSnapshot.val();
  if (!eventSnapshot.exists()) {
    // on delete
    const previous = eventSnapshot.previous.val();

    let updates = {};
    if (previous.menuGroups) {
      const menuGroupUpdates = Object.keys(
        previous.menuGroups
      ).reduce((a, b) => {
        a[`/menuGroups/${b}`] = null;
        return a;
      }, {});
      updates = Object.assign(updates, menuGroupUpdates);
    }

    if (previous.menus) {
      const menuUpdates = Object.keys(previous.menus).reduce((a, b) => {
        a[`/menus/${b}`] = null;
        return a;
      }, {});
      updates = Object.assign(updates, menuUpdates);
    }

    if (Object.keys(updates).length) {
      database.ref().update(updates);
    }
  } else {
    // on create or update
    const updates = {};

    if (eventSnapshot.child('menuGroups').changed()) {
      updates[`/stores/${id}/menuGroupCount`] = data.menuGroups
        ? Object.keys(data.menuGroups).length
        : 0;
    }

    if (eventSnapshot.child('menus').changed()) {
      updates[`/stores/${id}/menuCount`] = data.menus
        ? Object.keys(data.menus).length
        : 0;
    }

    if (eventSnapshot.child('favoriteUsers').changed()) {
      updates[`/stores/${id}/favoriteUserCount`] = data.favoriteUsers
        ? Object.keys(data.favoriteUsers).length
        : 0;
    }

    if (Object.keys(updates).length) {
      database.ref().update(updates);
    }
  }
});
