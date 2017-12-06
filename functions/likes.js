const { admin, functions, database } = require('./lib');

exports.onLikeWrite = functions.database.ref('/likes/{id}').onWrite(event => {
  const { params: { id } } = event;
  const eventSnapshot = event.data;
  const data = eventSnapshot.val();
  const { path, targetId, suggestionType } = data;
  const relationPath = `${path}/${targetId}/likes/${id}`;
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
      updates[relationPath] = data.uid;
      updates[`/likes/${id}/id`] = id;
    }

    if (Object.keys(updates).length) {
      database.ref().update(updates);
    }
  }
});
