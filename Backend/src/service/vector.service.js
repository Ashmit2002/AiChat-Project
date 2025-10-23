// Import the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const chatGptIndex = pc.Index(
  process.env.PINECONE_INDEX_NAME || "chatgpt-project"
);

async function createMemory({ vectors, metadata, messageId }) {
  await chatGptIndex.upsert([
    {
      id: messageId,
      values: vectors, // The vector data
      metadata, // Optional metadata associated with the vector
    },
  ]);
}

async function queryMemory({
  queryVector,
  limit = 10,
  metadata,
  excludeChat = null,
}) {
  const filter = metadata ? { ...metadata } : {};

  // Optionally exclude current chat to get cross-chat memories
  if (excludeChat) {
    filter.chat = { $ne: excludeChat };
  }

  const data = await chatGptIndex.query({
    vector: queryVector, // float array
    topK: limit,
    filter: Object.keys(filter).length > 0 ? filter : undefined, // flat object
    includeMetadata: true,
    includeValues: false, // Don't include vector values in response
  });
  return data.matches;
}

async function queryCrossChatMemory({
  queryVector,
  limit = 5,
  userId,
  currentChatId,
}) {
  const data = await chatGptIndex.query({
    vector: queryVector,
    topK: limit,
    filter: {
      user: userId,
      chat: { $ne: currentChatId }, // Exclude current chat
    },
    includeMetadata: true,
    includeValues: false,
  });
  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory,
  queryCrossChatMemory,
};
