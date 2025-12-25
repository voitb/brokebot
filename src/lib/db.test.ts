import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dexie from 'dexie';

describe('Database Operations', () => {
  let testDb: Dexie;
  let dbCounter = 0;

  beforeEach(async () => {
    // Create a unique database for each test
    dbCounter++;
    testDb = new Dexie(`TestDB_${dbCounter}`);
    testDb.version(1).stores({
      conversations: 'id, title, pinned, createdAt',
      documents: '++id, filename, createdAt',
      userConfig: 'id',
    });
    await testDb.open();
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.delete();
    }
  });

  describe('Conversations', () => {
    it('should create a new conversation', async () => {
      const newConversation = {
        id: 'test-123',
        title: 'Test Conversation',
        messages: [],
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.table('conversations').add(newConversation);
      const conversation = await testDb.table('conversations').get('test-123');

      expect(conversation).toBeDefined();
      expect(conversation?.title).toBe('Test Conversation');
    });

    it('should update conversation title', async () => {
      const newConversation = {
        id: 'test-456',
        title: 'Original Title',
        messages: [],
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.table('conversations').add(newConversation);
      await testDb.table('conversations').update('test-456', { title: 'Updated Title' });
      const conversation = await testDb.table('conversations').get('test-456');

      expect(conversation?.title).toBe('Updated Title');
    });

    it('should toggle pin status', async () => {
      const newConversation = {
        id: 'test-789',
        title: 'Pinnable Conversation',
        messages: [],
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.table('conversations').add(newConversation);
      await testDb.table('conversations').update('test-789', { pinned: true });
      const conversation = await testDb.table('conversations').get('test-789');

      expect(conversation?.pinned).toBe(true);
    });

    it('should delete a conversation', async () => {
      const newConversation = {
        id: 'test-delete',
        title: 'Delete Me',
        messages: [],
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.table('conversations').add(newConversation);
      await testDb.table('conversations').delete('test-delete');
      const conversation = await testDb.table('conversations').get('test-delete');

      expect(conversation).toBeUndefined();
    });

    it('should list all conversations', async () => {
      const conversations = [
        { id: 'c1', title: 'First', messages: [], pinned: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'c2', title: 'Second', messages: [], pinned: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      await testDb.table('conversations').bulkAdd(conversations);
      const all = await testDb.table('conversations').toArray();

      expect(all.length).toBe(2);
    });

    it('should filter pinned conversations', async () => {
      const conversations = [
        { id: 'c1', title: 'Unpinned', messages: [], pinned: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'c2', title: 'Pinned', messages: [], pinned: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      await testDb.table('conversations').bulkAdd(conversations);
      const all = await testDb.table('conversations').toArray();
      const pinned = all.filter(c => c.pinned === true);

      expect(pinned.length).toBe(1);
      expect(pinned[0].title).toBe('Pinned');
    });
  });

  describe('Documents', () => {
    it('should add a document', async () => {
      const doc = {
        filename: 'test.txt',
        content: 'Hello World',
        createdAt: new Date(),
        fileType: 'txt',
      };

      const id = await testDb.table('documents').add(doc);
      const document = await testDb.table('documents').get(id);

      expect(document).toBeDefined();
      expect(document?.filename).toBe('test.txt');
      expect(document?.content).toBe('Hello World');
    });

    it('should delete a document', async () => {
      const doc = {
        filename: 'delete-me.txt',
        content: 'Bye',
        createdAt: new Date(),
        fileType: 'txt',
      };

      const id = await testDb.table('documents').add(doc);
      await testDb.table('documents').delete(id);
      const document = await testDb.table('documents').get(id);

      expect(document).toBeUndefined();
    });
  });
});
