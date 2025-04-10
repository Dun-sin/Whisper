const { 
    NEW_EVENT_ADD_REACTION, 
    NEW_EVENT_REMOVE_REACTION 
  } = require('../../constants.json');
  const { getActiveUser, addReaction, removeReaction } = require('../utils/lib');
  
  module.exports = (socket) => {
    // Handle adding a reaction
    socket.on(
      NEW_EVENT_ADD_REACTION,
      async ({ messageId, chatId, emoji }, reactionAddedSuccessfully) => {
        try {
          const user = getActiveUser({
            socketId: socket.id,
          });
  
          if (!user || !messageId || !chatId || !emoji) {
            reactionAddedSuccessfully(false);
            return;
          }
  
          const reactionAdded = await addReaction(chatId, messageId, emoji, user.id);
  
          if (reactionAdded) {
            // Broadcast the reaction to all users in the chat
            socket.broadcast.to(chatId).emit(NEW_EVENT_ADD_REACTION, {
              messageId,
              chatId,
              emoji,
              userId: user.id
            });
          }
  
          reactionAddedSuccessfully(reactionAdded);
        } catch (error) {
          console.error('Error adding reaction:', error);
          reactionAddedSuccessfully(false);
        }
      }
    );
  
    // Handle removing a reaction
    socket.on(
      NEW_EVENT_REMOVE_REACTION,
      async ({ messageId, chatId, emoji }, reactionRemovedSuccessfully) => {
        try {
          const user = getActiveUser({
            socketId: socket.id,
          });
  
          if (!user || !messageId || !chatId || !emoji) {
            reactionRemovedSuccessfully(false);
            return;
          }
  
          const reactionRemoved = await removeReaction(chatId, messageId, emoji, user.id);
  
          if (reactionRemoved) {
            // Broadcast the reaction removal to all users in the chat
            socket.broadcast.to(chatId).emit(NEW_EVENT_REMOVE_REACTION, {
              messageId,
              chatId,
              emoji,
              userId: user.id
            });
          }
  
          reactionRemovedSuccessfully(reactionRemoved);
        } catch (error) {
          console.error('Error removing reaction:', error);
          reactionRemovedSuccessfully(false);
        }
      }
    );
  };
  