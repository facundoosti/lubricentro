import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ConversationList } from '@components/features/inbox/ConversationList';
import { ConversationDetail } from '@components/features/inbox/ConversationDetail';
import { useConversations, inboxKeys } from '@services/inboxService';
import { useInboxCable } from '@hooks/useInboxCable';

export default function Inbox() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useConversations();

  // Real-time updates via ActionCable
  useInboxCable((data) => {
    // Refresh conversation list on any inbox event
    queryClient.invalidateQueries({ queryKey: inboxKeys.conversations() });

    // If a new message arrived in the active conversation, refresh messages too
    if (
      data.conversation_id &&
      activeConversation?.id === data.conversation_id
    ) {
      queryClient.invalidateQueries({
        queryKey: inboxKeys.messages(data.conversation_id),
      });

      // Sync active conversation status if it changed
      if (data.status && activeConversation.status !== data.status) {
        setActiveConversation((prev) =>
          prev ? { ...prev, status: data.status } : prev
        );
      }
    }
  });

  return (
    // Break out of Layout's p-6/p-8 padding and fill the remaining viewport height
    <div id="tour-inbox" className="-m-6 md:-m-8 flex h-[calc(100vh-64px)] overflow-hidden">
      <ConversationList
        conversations={isLoading ? [] : conversations}
        activeId={activeConversation?.id}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onSelectConversation={setActiveConversation}
      />
      <ConversationDetail conversation={activeConversation} />
    </div>
  );
}
