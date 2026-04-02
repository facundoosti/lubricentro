import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsAPI, messagesAPI } from '@services/api';

export const inboxKeys = {
  all: ['inbox'],
  conversations: () => [...inboxKeys.all, 'conversations'],
  conversation: (id) => [...inboxKeys.all, 'conversation', id],
  messages: (conversationId) => [...inboxKeys.all, 'messages', conversationId],
};

export const useConversations = (filters = {}) =>
  useQuery({
    queryKey: inboxKeys.conversations(),
    queryFn: async () => {
      const { data } = await conversationsAPI.getAll(filters);
      return data?.data?.conversations ?? [];
    },
  });

export const useMessages = (conversationId) =>
  useQuery({
    queryKey: inboxKeys.messages(conversationId),
    queryFn: async () => {
      const { data } = await conversationsAPI.getById(conversationId);
      return data?.data?.conversation?.messages ?? [];
    },
    enabled: !!conversationId,
  });

export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => {
      if (status === 'resolved') return conversationsAPI.resolve(id);
      if (status === 'needs_human') return conversationsAPI.assignHuman(id);
      throw new Error(`Unknown status: ${status}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.conversations() });
    },
  });
};

export const useSendMessage = (conversationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      messagesAPI.create(conversationId, {
        body,
        direction: 'outbound',
        sender_type: 'agent',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboxKeys.messages(conversationId),
      });
    },
  });
};
