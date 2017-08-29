const { admin, functions, database } = require('./lib');

exports.onMenuGroupWrite = functions.database
  .ref('/menuGroups/{id}')
  .onWrite(event => {
    const { params: { id } } = event;
    const eventSnapshot = event.data;
    const data = eventSnapshot.val();
    const storeRefPath = `/stores/${data.storeId}/menuGroups/${id}`;
    if (!eventSnapshot.exists()) {
      // on delete
      const previous = eventSnapshot.previous.val();

      const menuUpdates = Object.keys(previous.menus).reduce((a, b) => {
        a[`/menus/${b}`] = null;
        return a;
      }, {});

      database
        .ref()
        .update(Object.assign({ [storeRefPath]: null }, menuUpdates));
    } else {
      // on create or update
      const updates = {};

      if (!eventSnapshot.previous.exists()) {
        updates[`/menuGroups/${id}/menus`] = data.menus || {};
      }

      if (!eventSnapshot.previous.exists()) {
        updates[storeRefPath] = true;
      }

      if (eventSnapshot.child('menus').changed()) {
        updates[`/menuGroups/${id}/menuCount`] = Object.keys(data.menus).length;
      }

      if (Object.keys(updates).length) {
        database.ref().update(updates);
      }
    }
  });
