const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const database = admin.database();

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
      updates[`/stores/${id}/menuGroups`] = data.menuGroups || {};
      updates[`/stores/${id}/menus`] = data.menus || {};
    }

    if (eventSnapshot.child('menuGroups').changed()) {
      updates[`/stores/${id}/menuGroupCount`] = Object.keys(
        data.menuGroups
      ).length;
    }
    if (eventSnapshot.child('menus').changed()) {
      updates[`/stores/${id}/menuCount`] = Object.keys(data.menus).length;
    }

    if (Object.keys(updates).length) {
      database.ref().update(updates);
    }
  }
});

// exports.countMenusOnMenuWrite = functions.database
//   .ref('/menus/{menuId}')
//   .onWrite(event => {});
