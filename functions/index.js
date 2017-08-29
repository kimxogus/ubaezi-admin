const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const database = admin.database();

exports.onMenuWrite = functions.database.ref('/menus/{id}').onWrite(event => {
  const { params: { id } } = event;
  const data = event.data.val();
  const storeRefPath = `/stores/${data.storeId}/menus/${id}`;
  const menuGroupRefPath = `/menuGroups/${data.menuGroupId}/menus/${id}`;
  if (!event.data.exists()) {
    // on delete
    const updates = {
      [storeRefPath]: null,
      [menuGroupRefPath]: null,
    };
    database.ref().update(updates);
  } else {
    // on create or update
    const updates = {
      [storeRefPath]: true,
      [menuGroupRefPath]: true,
    };
    database.ref().update(updates);
  }
});

exports.onMenuGroupWrite = functions.database
  .ref('/menuGroups/{id}')
  .onWrite(event => {
    const { params: { id } } = event;
    const data = event.data.val();
    const storeRefPath = `/stores/${data.storeId}/menuGroups/${id}`;
    if (!event.data.exists()) {
      // on delete
      const previous = event.data.previous.val();

      const menuUpdates = Object.keys(previous.menus).reduce((a, b) => {
        a[`/menus/${b}`] = null;
        return a;
      }, {});

      database
        .ref()
        .update(Object.assign({ [storeRefPath]: null }, menuUpdates));
    } else {
      // on create or update
      const updates = {
        [storeRefPath]: true,
        [`/menuGroups/${id}/menuCount`]: Object.keys(data.menus).length,
      };
      database.ref().update(updates);
    }
  });

exports.onStoreWrite = functions.database.ref('/stores/{id}').onWrite(event => {
  const { params: { id } } = event;
  const data = event.data.val();
  if (!event.data.exists()) {
    // on delete
    const previous = event.data.previous.val();

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
    const updates = {
      [`/stores/${id}/menuCount`]: Object.keys(data.menus).length,
      [`/stores/${id}/menuGroupCount`]: Object.keys(data.menuGroups).length,
    };
    database.ref().update(updates);
  }
});

// exports.countMenusOnMenuWrite = functions.database
//   .ref('/menus/{menuId}')
//   .onWrite(event => {});
