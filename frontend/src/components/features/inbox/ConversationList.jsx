import { MessageSquare, LayoutList, Bot, UserCheck, Package, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_FILTERS = [
  { label: 'Todos', value: null, icon: LayoutList },
  { label: 'Bot', value: 'bot', icon: Bot },
  { label: 'Atención', value: 'needs_human', icon: UserCheck },
  { label: 'Proveedores', value: 'supplier', icon: Package },
  { label: 'Archivadas', value: 'archived', icon: Archive },
];

const STATUS_BADGE = {
  bot: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  needs_human: 'bg-primary/10 text-primary border-primary/20',
  supplier: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  resolved: 'bg-surface-container-high text-secondary border-outline-variant',
  archived: 'bg-zinc-900 text-zinc-600 border-zinc-800',
};

const STATUS_LABEL = {
  bot: 'Bot',
  needs_human: 'Atención',
  supplier: 'Proveedor',
  resolved: 'Resuelto',
  archived: 'Archivada',
};

function ConversationItem({ conversation, isActive, onClick }) {
  const lastMessageAt = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), {
        addSuffix: false,
        locale: es,
      })
    : null;

  const badge = STATUS_BADGE[conversation.status] ?? STATUS_BADGE.resolved;
  const label = STATUS_LABEL[conversation.status] ?? conversation.status;
  const displayName =
    conversation.customer_name || conversation.whatsapp_phone;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-zinc-800/50 cursor-pointer transition-colors ${
        isActive
          ? 'bg-zinc-900 border-r-2 border-r-primary'
          : 'hover:bg-zinc-900/50'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-sm text-on-surface truncate pr-2">
          {displayName}
        </h3>
        {lastMessageAt && (
          <span className="text-[10px] text-zinc-500 flex-shrink-0">
            hace {lastMessageAt}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-400 mb-2 truncate">
        {conversation.whatsapp_phone}
      </p>
      {conversation.last_message_body && (
        <p className="text-xs text-zinc-400 line-clamp-1 italic mb-3">
          "{conversation.last_message_body}"
        </p>
      )}
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge}`}
      >
        {label}
      </span>
    </button>
  );
}

export function ConversationList({
  conversations = [],
  activeId,
  statusFilter,
  onFilterChange,
  onSelectConversation,
}) {
  const filtered =
    statusFilter === null
      ? conversations.filter((c) => c.status !== 'archived')
      : conversations.filter((c) => c.status === statusFilter);

  return (
    <aside className="w-80 border-r border-zinc-800 flex flex-col bg-surface-container-low flex-shrink-0">
      {/* Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-tertiary" />
          <h2 className="text-lg font-bold tracking-tight text-on-surface">
            Inbox
          </h2>
        </div>
        <span className="bg-tertiary-container/30 text-tertiary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
          WhatsApp
        </span>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 border-b border-zinc-800 flex flex-col gap-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2">
          {STATUS_FILTERS.filter((f) => f.value !== 'archived').map((f) => {
            const Icon = f.icon;
            const active = statusFilter === f.value;
            return (
              <button
                key={f.label}
                onClick={() => onFilterChange(f.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant text-on-surface-variant hover:bg-zinc-800 hover:text-on-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
        {(() => {
          const f = STATUS_FILTERS.find((f) => f.value === 'archived');
          const Icon = f.icon;
          const active = statusFilter === f.value;
          return (
            <button
              onClick={() => onFilterChange(f.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors w-full ${
                active
                  ? 'bg-zinc-700 text-zinc-200'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-zinc-800 hover:text-on-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{f.label}</span>
            </button>
          );
        })()}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-secondary text-center">
            Sin conversaciones
          </p>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelectConversation(conv)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
