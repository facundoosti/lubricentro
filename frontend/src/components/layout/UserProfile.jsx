import { ChevronDown } from 'lucide-react';

export default function UserProfile() {
  return (
    <div className="-mx-2 mt-auto">
      <a
        href="#"
        className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-300 hover:bg-secondary-800 hover:text-white rounded-md"
      >
        {/* Reemplazar con imagen real */}
        <img
          className="h-8 w-8 rounded-full bg-gray-50"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="Avatar del usuario"
        />
        <span className="sr-only">Tu perfil</span>
        <span aria-hidden="true">Tom Cook</span>
        <ChevronDown className="ml-auto h-5 w-5 text-gray-400" />
      </a>
    </div>
  );
} 