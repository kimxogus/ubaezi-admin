const { admin, functions, database } = require('./lib');

exports.onSuggestionWrite = functions.database
  .ref('/suggestions/{id}')
  .onWrite(event => {
    const { params: { id } } = event;
    const eventSnapshot = event.data;
    if (!eventSnapshot.exists()) {
      // on delete
      const data = eventSnapshot.previous.val();
      const { path, targetId, likes } = data;
      const relationPath = `${path}/${targetId}/suggestions/${id}`;

      if (likes && Object.keys(likes).length) {
        Object.keys(likes).forEach(likeId => {
          updates[`/likes/${likeId}`] = null;
        });
      }

      const updates = {
        [relationPath]: null,
      };
      database.ref().update(updates);
    } else {
      // on create or update
      const data = eventSnapshot.val();
      const { path, targetId, field, value } = data;
      const relationPath = `${path}/${targetId}/suggestions/${id}`;

      const updates = {};
      let shouldApplySuggestion = false;
      if (!eventSnapshot.previous.exists()) {
        updates[relationPath] = new Date().getTime();
        updates[`/suggestions/${id}/id`] = id;
      }

      if (eventSnapshot.child('likes').changed()) {
        const likeCount = data.likes ? Object.keys(data.likes).length : 0;
        if (likeCount >= 3) {
          updates[`${path}/${targetId}/${field}`] = value;
          shouldApplySuggestion = true;
        } else {
          updates[`/suggestions/${id}/likeCount`] = likeCount;
        }
      }

      if (Object.keys(updates).length) {
        database.ref().update(updates);
        if (shouldApplySuggestion) {
          database
            .ref('/suggestions')
            .orderByChild('targetId')
            .equalTo(targetId)
            .ref.remove();
        }
      }
    }
  });
