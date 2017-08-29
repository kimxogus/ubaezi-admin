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
    if (!eventSnapshot.previous.exists()) {
      const updates = {
        [storeRefPath]: true,
        [menuGroupRefPath]: true,
      };
      database.ref().update(updates);
    }
  }
});
