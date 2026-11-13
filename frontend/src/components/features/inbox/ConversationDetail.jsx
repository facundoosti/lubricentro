import { useEffect, useRef, useState } from 'react';
import { User, Bot, Send, Paperclip, Smile, UserCheck, Archive, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMessages, useSendMessage, useUpdateConversationStatus } from '@services/inboxService';
import { showError } from '@services/notificationService';

const STATUS_BADGE = {
  bot: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  needs_human: 'bg-primary/10 text-primary border-primary/20',
  supplier: 'bg-surface-container-high text-on-surface-variant border-outline',
  archived: 'bg-surface-container-high text-secondary border-outline-variant',
};

const STATUS_LABEL = {
  bot: 'Bot',
  needs_human: 'Atención',
  supplier: 'Proveedor',
  archived: 'Archivada',
};

function MessageBubble({ message }) {
  const isOutbound = message.direction === 'outbound';
  const isBot = message.sender_type === 'bot';
  const isAgent = message.sender_type === 'agent';

  const time = message.received_at || message.created_at
    ? format(new Date(message.received_at || message.created_at), 'HH:mm', { locale: es })
    : '';

  // Outbound: agent or bot → right side
  if (isOutbound || isBot) {
    const isAgentMsg = isOutbound && isAgent;
    return (
      <div className="flex flex-col max-w-[70%] self-end items-end">
        <div className={`p-4 rounded-xl rounded-tr-none border shadow-lg ${
          isAgentMsg
            ? 'bg-primary-container border-primary-container shadow-primary/5'
            : 'bg-tertiary/10 border-tertiary/20 shadow-tertiary/5'
        }`}>
          <p className={`text-sm font-medium leading-relaxed ${
            isAgentMsg ? 'text-on-primary' : 'text-tertiary italic'
          }`}>
            {message.body}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1 mr-1">
          {isBot && <Bot className="w-3 h-3 text-tertiary" />}
          <span className="text-[10px] text-secondary">
            {time} · {isAgentMsg ? 'Agente (Vos)' : 'Bot Automático'}
          </span>
        </div>
      </div>
    );
  }

  // inbound / customer → left side
  return (
    <div className="flex flex-col max-w-[70%]">
      <div className="bg-surface-container-high p-4 rounded-xl rounded-tl-none border border-outline">
        <p className="text-sm text-on-surface leading-relaxed">{message.body}</p>
      </div>
      <span className="text-[10px] text-secondary mt-1 ml-1">
        {time} · Cliente
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-secondary">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
        <User className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium text-secondary">
        Seleccioná una conversación
      </p>
    </div>
  );
}

export function ConversationDetail({ conversation }) {
  const [text, setText] = useState('');
  const threadRef = useRef(null);

  const { data: messages = [], isLoading } = useMessages(conversation?.id);
  const sendMessage = useSendMessage(conversation?.id);
  const updateStatus = useUpdateConversationStatus();

  // scroll to bottom when messages load or update
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) return <EmptyState />;

  const displayName = conversation.customer_name || conversation.whatsapp_phone;
  const badge = STATUS_BADGE[conversation.status] ?? STATUS_BADGE.archived;
  const label = STATUS_LABEL[conversation.status] ?? conversation.status;
  const canSend = conversation.status !== 'archived';

  const handleSend = async () => {
    const body = text.trim();
    if (!body || sendMessage.isPending) return;
    setText('');
    try {
      await sendMessage.mutateAsync(body);
    } catch {
      showError('No se pudo enviar el mensaje');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDerivate = () => {
    updateStatus.mutate({ id: conversation.id, status: 'needs_human' });
  };

  const handleArchive = () => {
    updateStatus.mutate({ id: conversation.id, status: 'archived' });
  };

  const handleMarkAsSupplier = () => {
    updateStatus.mutate({ id: conversation.id, status: 'supplier' });
  };

  return (
    <section className="flex-1 flex flex-col bg-surface-container-lowest min-w-0">
      {/* Chat Header */}
      <header className="p-4 border-b border-outline-variant flex items-center justify-between bg-background/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-on-surface">{displayName}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge}`}>
                {label}
              </span>
            </div>
            <p className="text-xs text-secondary">{conversation.whatsapp_phone}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {conversation.status !== 'supplier' && conversation.status !== 'archived' && (
            <button
              onClick={handleMarkAsSupplier}
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-outline rounded-lg hover:bg-surface-container-high transition-all disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              Marcar proveedor
            </button>
          )}
          {conversation.status !== 'needs_human' && conversation.status !== 'archived' && (
            <button
              onClick={handleDerivate}
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-outline rounded-lg hover:bg-surface-container-high transition-all disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              Derivar a humano
            </button>
          )}
          {conversation.status !== 'archived' && (
            <button
              onClick={handleArchive}
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-outline rounded-lg hover:bg-surface-container-high transition-all disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              Archivar
            </button>
          )}
        </div>
      </header>

      {/* Thread */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col"
      >
        {isLoading ? (
          <p className="text-sm text-secondary text-center mt-8">Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-secondary text-center mt-8">Sin mensajes aún</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      {/* Input */}
      <footer className="p-4 border-t border-outline-variant bg-surface-container-lowest flex-shrink-0">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={canSend ? 'Respondé como agente...' : 'Conversación archivada'}
              disabled={!canSend}
              rows={1}
              className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 pr-20 text-sm text-on-surface resize-none h-12 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-secondary"
            />
            <div className="absolute right-3 top-2.5 flex items-center gap-2">
              <button className="text-secondary hover:text-on-surface-variant" disabled={!canSend}>
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="text-secondary hover:text-on-surface-variant" disabled={!canSend}>
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!canSend || !text.trim() || sendMessage.isPending}
            className="bg-primary-container text-on-primary h-12 w-12 rounded-xl flex items-center justify-center hover:scale-[0.98] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center">
          <p className="text-[10px] text-secondary">
            {canSend
              ? `${displayName} verá este mensaje en su WhatsApp`
              : 'Esta conversación está archivada'}
          </p>
        </div>
      </footer>
    </section>
  );
}
