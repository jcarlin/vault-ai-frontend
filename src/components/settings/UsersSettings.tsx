'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { listUsers, createUser, updateUser, deactivateUser } from '@/lib/api/admin';
import { LdapSettings } from './LdapSettings';
import { formatLastActive } from '@/mocks/settings';
import type { UserResponse, UserCreate, UserUpdate } from '@/types/api';

type UserRole = 'admin' | 'user' | 'viewer';

interface UsersSettingsProps {
  onSave: () => void;
}

function getRoleBadgeStyles(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/20 text-purple-400';
    case 'user':
      return 'bg-[var(--green-500)]/20 text-[var(--green-400)]';
    default:
      return 'bg-zinc-500/20 text-zinc-400';
  }
}

function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: UserResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium capitalize',
            getRoleBadgeStyles(user.role)
          )}
        >
          {user.role}
        </span>
        <span className="text-xs text-zinc-600">
          {user.last_active ? formatLastActive(user.last_active) : 'Never'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
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
  password: string;
  confirmPassword: string;
}

function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  isEditing,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: UserFormData;
  title: string;
  isEditing?: boolean;
}) {
  const [formData, setFormData] = useState<UserFormData>(
    initialData || { name: '', email: '', role: 'user', password: '', confirmPassword: '' }
  );
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      if (formData.password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
    }
    setPasswordError(null);
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
          {!isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setPasswordError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setPasswordError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-[var(--green-500)]"
                  required
                  minLength={8}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-400">{passwordError}</p>
              )}
            </>
          )}
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
              {isEditing ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UsersSettings({ onSave }: UsersSettingsProps) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  const { data: users = [] } = useQuery<UserResponse[]>({
    queryKey: ['users'],
    queryFn: ({ signal }) => listUsers(signal),
  });

  const createMutation = useMutation({
    mutationFn: (data: UserCreate) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSave();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSave();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSave();
    },
  });

  const handleAddUser = (data: UserFormData) => {
    createMutation.mutate({
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
      auth_source: 'local',
    });
  };

  const handleEditUser = (data: UserFormData) => {
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      data: { name: data.name, email: data.email, role: data.role },
    });
    setEditingUser(null);
  };

  const handleDeleteUser = (user: UserResponse) => {
    setDeletingUser(user);
  };

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    deactivateMutation.mutate(deletingUser.id);
    setDeletingUser(null);
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
          <Plus className="h-4 w-4" />
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
            onDelete={() => handleDeleteUser(user)}
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
          <p>
            <span className="text-purple-400 font-medium">Admin:</span> Full system access, user
            management, settings
          </p>
          <p>
            <span className="text-[var(--green-400)] font-medium">User:</span> Run queries, upload
            data, train models
          </p>
          <p>
            <span className="text-zinc-400 font-medium">Viewer:</span> View-only access, no
            modifications
          </p>
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
        isEditing
        initialData={
          editingUser
            ? {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role as UserRole,
                password: '',
                confirmPassword: '',
              }
            : undefined
        }
        title="Edit User"
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Deactivate User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Are you sure you want to deactivate <span className="text-zinc-100 font-medium">{deletingUser?.name}</span>? They will no longer be able to log in.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeletingUser(null)}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteUser}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
            >
              Deactivate
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* LDAP Settings */}
      <div className="border-t border-zinc-800 pt-6">
        <LdapSettings />
      </div>
    </div>
  );
}
