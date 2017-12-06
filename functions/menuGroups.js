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

      const menuUpdates = previous.menus
        ? Object.keys(previous.menus).reduce((a, b) => {
            a[`/menus/${b}`] = null;
            return a;
          }, {})
        : {};

      database
        .ref()
        .update(Object.assign({ [storeRefPath]: null }, menuUpdates));
    } else {
      // on create or update
      const updates = {};

      if (!eventSnapshot.previous.exists()) {
        updates[storeRefPath] = new Date().getTime();
      }

      if (eventSnapshot.child('likes').changed()) {
        updates[`/menuGroups/${id}/likeCount`] = data.likes
          ? Object.keys(data.likes).length
          : 0;
      }

      if (eventSnapshot.child('suggestions').changed()) {
        updates[`/menuGroups/${id}/suggestionCount`] = data.suggestions
          ? Object.keys(data.suggestions).length
          : 0;
      }

      if (eventSnapshot.child('menus').changed()) {
        updates[`/menuGroups/${id}/menuCount`] = data.menus
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
