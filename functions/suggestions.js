const { admin, functions, database } = require('./lib');

exports.onSuggestionWrite = functions.database
  .ref('/suggestions/{id}')
  .onWrite(event => {
    const { params: { id } } = event;
    const eventSnapshot = event.data;
    const data = eventSnapshot.val();
    const { path, id: targetID, suggestionType } = data;
    const relationPath = `/${path}/${targetID}/suggestions/${id}`;
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
      }

      if (Object.keys(updates).length) {
        database.ref().update(updates);
      }
    }
  });
