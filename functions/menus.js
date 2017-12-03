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

    if (eventSnapshot.child('suggestions').changed()) {
      updates[`/menus/${id}/suggestionCount`] = data.suggestions
        ? Object.keys(data.suggestions).length
        : 0;
    }

    if (eventSnapshot.child('favoriteUsers').changed()) {
      updates[`/menus/${id}/favoriteUserCount`] = data.favoriteUsers
        ? Object.keys(data.favoriteUsers).length
        : 0;
    }

    if (Object.keys(updates).length) {
      database.ref().update(updates);
    }
  }
});
