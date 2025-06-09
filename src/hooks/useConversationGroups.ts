import { useMemo } from 'react';
import type { ConversationGroup } from '../types';
import type { IConversation } from '../lib/db';

// Helper function to group conversations by time periods
const groupConversationsByTime = (
  conversations: IConversation[]
): ConversationGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const pinned = conversations.filter((c) => c.pinned);
  const unpinned = conversations.filter((c) => !c.pinned);

  const todayConversations = unpinned.filter((c) => c.updatedAt >= today);
  const yesterdayConversations = unpinned.filter(
    (c) => c.updatedAt >= yesterday && c.updatedAt < today
  );
  const lastWeekConversations = unpinned.filter(
    (c) => c.updatedAt >= lastWeek && c.updatedAt < yesterday
  );
  const olderConversations = unpinned.filter((c) => c.updatedAt < lastWeek);

  const groups: ConversationGroup[] = [];

  if (pinned.length > 0) {
    groups.push({
      label: "Favourites",
      conversations: pinned.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (todayConversations.length > 0) {
    groups.push({
      label: "Today",
      conversations: todayConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (yesterdayConversations.length > 0) {
    groups.push({
      label: "Yesterday",
      conversations: yesterdayConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (lastWeekConversations.length > 0) {
    groups.push({
      label: "Last 7 Days",
      conversations: lastWeekConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (olderConversations.length > 0) {
    groups.push({
      label: "Older",
      conversations: olderConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  return groups;
};

export const useConversationGroups = (
  conversations: IConversation[] | null,
  searchQuery: string = ''
) => {
  const filteredGroups = useMemo(() => {
    if (!conversations) return [];

    const grouped = groupConversationsByTime(conversations);

    if (!searchQuery) return grouped;

    return grouped
      .map((group) => ({
        ...group,
        conversations: group.conversations.filter((conversation) =>
          conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.conversations.length > 0);
  }, [conversations, searchQuery]);

  return { filteredGroups };
}; 