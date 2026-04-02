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
      return data;
    },
  });

export const useMessages = (conversationId) =>
  useQuery({
    queryKey: inboxKeys.messages(conversationId),
    queryFn: async () => {
      const { data } = await messagesAPI.getByConversation(conversationId);
      return data;
    },
    enabled: !!conversationId,
  });

export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => conversationsAPI.updateStatus(id, status),
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
