const { admin, functions, database } = require('./lib');

exports.onSuggestionWrite = functions.database
  .ref('/suggestions/{id}')
  .onWrite(event => {
    const { params: { id } } = event;
    const eventSnapshot = event.data;
    const data = eventSnapshot.val();
    const { path, targetId, suggestionType } = data;
    const relationPath = `${path}/${targetId}/suggestions/${id}`;
    if (!eventSnapshot.exists()) {
      // on delete
      const updates = {
        [relationPath]: null,
      };
      database.ref().update(updates);
    } else {
      // on create or update
      const updates = {};
      if (!eventSnapshot.previous.exists()) {
        updates[relationPath] = new Date().getTime();
        updates[`/suggestions/${id}/id`] = id;
      }

      if (eventSnapshot.child('likes').changed()) {
        updates[`/suggestions/${id}/likeCount`] = data.likes
          ? Object.keys(data.likes).length
          : 0;
      }

      if (Object.keys(updates).length) {
        database.ref().update(updates);
      }
    }
  });
