const { admin, functions, database } = require('./lib');

exports.onMenuWrite = functions.database.ref('/menus/{id}').onWrite(event => {
  const { params: { id } } = event;
  const eventSnapshot = event.data;
  const data = eventSnapshot.val();
  const storeRefPath = `/stores/${data.storeId}/menus/${id}`;
  const menuGroupRefPath = `/menuGroups/${data.menuGroupId}/menus/${id}`;
  if (!eventSnapshot.exists()) {
    // on delete
    const updates = {
      [storeRefPath]: null,
      [menuGroupRefPath]: null,
    };
    database.ref().update(updates);
  } else {
    // on create or update
    const updates = {};
    if (!eventSnapshot.previous.exists()) {
      updates[storeRefPath] = new Date().getTime();
      updates[menuGroupRefPath] = new Date().getTime();
    }

    if (
      eventSnapshot.child('favoriteUsers').changed() ||
      updates[`/menus/${id}/favoriteUsers`]
    ) {
      updates[`/menus/${id}/favoriteUserCount`] = Object.keys(
        data.favoriteUsers
      ).length;
    }

    if (Object.keys(updates).length) {
      database.ref().update(updates);
    }
  }
});
