import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockUsers, formatLastActive, type User, type UserRole } from '@/mocks/settings';

interface UsersSettingsProps {
  onSave: () => void;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function getRoleBadgeStyles(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/20 text-purple-400';
    case 'user':
      return 'bg-[var(--green-500)]/20 text-[var(--green-400)]';
    case 'viewer':
      return 'bg-zinc-500/20 text-zinc-400';
  }
}

function UserRow({ user, onEdit, onDelete }: { user: User; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-100">{user.name}</p>
          <p className="text-xs text-zinc-500">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium capitalize",
          getRoleBadgeStyles(user.role)
        )}>
          {user.role}
        </span>
        <span className="text-xs text-zinc-600">
          {formatLastActive(user.lastActive)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <EditIcon />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
}

function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: UserFormData;
  title: string;
}) {
  const [formData, setFormData] = useState<UserFormData>(
    initialData || { name: '', email: '', role: 'user' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors"
            >
              {initialData ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UsersSettings({ onSave }: UsersSettingsProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddUser = (data: UserFormData) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    onSave();
  };

  const handleEditUser = (data: UserFormData) => {
    if (!editingUser) return;
    setUsers(users.map(u =>
      u.id === editingUser.id ? { ...u, ...data } : u
    ));
    setEditingUser(null);
    onSave();
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    onSave();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Users & Permissions</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Manage who has access to your Vault AI Systems cluster
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--green-600)] text-white text-sm font-medium hover:bg-[var(--green-500)] transition-colors"
        >
          <PlusIcon />
          Add User
        </button>
      </div>

      {/* Users list */}
      <div className="rounded-lg bg-zinc-800/50 p-4">
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={() => setEditingUser(user)}
            onDelete={() => handleDeleteUser(user.id)}
          />
        ))}
        {users.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-4">No users configured</p>
        )}
      </div>

      {/* Role descriptions */}
      <div className="rounded-lg bg-zinc-800/30 p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Role Permissions</h3>
        <div className="space-y-2 text-xs text-zinc-500">
          <p><span className="text-purple-400 font-medium">Admin:</span> Full system access, user management, settings</p>
          <p><span className="text-[var(--green-400)] font-medium">User:</span> Run queries, upload data, train models</p>
          <p><span className="text-zinc-400 font-medium">Viewer:</span> View-only access, no modifications</p>
        </div>
      </div>

      {/* Add user dialog */}
      <UserFormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddUser}
        title="Add New User"
      />

      {/* Edit user dialog */}
      <UserFormDialog
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditUser}
        initialData={editingUser ? {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        } : undefined}
        title="Edit User"
      />
    </div>
  );
}
