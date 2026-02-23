'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getLdapConfig,
  updateLdapConfig,
  testLdapConnection,
  syncLdapUsers,
  getLdapMappings,
  createLdapMapping,
  updateLdapMapping,
  deleteLdapMapping,
} from '@/lib/api/auth';
import type {
  LdapConfig,
  LdapConfigUpdate,
  LdapTestResult,
  LdapSyncResult,
  LdapGroupMapping,
  LdapGroupMappingCreate,
} from '@/types/api';

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        checked ? 'bg-emerald-600' : 'bg-zinc-600'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function LdapConnectionCard() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery<LdapConfig>({
    queryKey: ['ldap-config'],
    queryFn: ({ signal }) => getLdapConfig(signal),
  });

  const [form, setForm] = useState<LdapConfigUpdate>({});
  const [dirty, setDirty] = useState(false);

  // Sync form state when config loads
  const currentConfig = { ...config, ...form };

  const updateField = <K extends keyof LdapConfigUpdate>(key: K, value: LdapConfigUpdate[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: LdapConfigUpdate) => updateLdapConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ldap-config'] });
      setForm({});
      setDirty(false);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-6">
        <p className="text-sm text-zinc-500">Loading LDAP configuration...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-zinc-100">LDAP Connection</h3>
        <Toggle
          checked={currentConfig.enabled ?? false}
          onChange={(v) => updateField('enabled', v)}
          label="Enable LDAP"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Server URL</label>
          <input
            type="text"
            value={currentConfig.url ?? ''}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="ldap://ldap.example.com:389"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Bind DN</label>
          <input
            type="text"
            value={currentConfig.bind_dn ?? ''}
            onChange={(e) => updateField('bind_dn', e.target.value)}
            placeholder="cn=admin,dc=example,dc=com"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Bind Password</label>
          <input
            type="password"
            value={currentConfig.bind_password ?? ''}
            onChange={(e) => updateField('bind_password', e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">User Search Base</label>
          <input
            type="text"
            value={currentConfig.user_search_base ?? ''}
            onChange={(e) => updateField('user_search_base', e.target.value)}
            placeholder="ou=users,dc=example,dc=com"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Group Search Base</label>
          <input
            type="text"
            value={currentConfig.group_search_base ?? ''}
            onChange={(e) => updateField('group_search_base', e.target.value)}
            placeholder="ou=groups,dc=example,dc=com"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">User Search Filter</label>
          <input
            type="text"
            value={currentConfig.user_search_filter ?? ''}
            onChange={(e) => updateField('user_search_filter', e.target.value)}
            placeholder="(uid={username})"
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Default Role</label>
          <select
            value={currentConfig.default_role ?? 'user'}
            onChange={(e) => updateField('default_role', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Toggle
            checked={currentConfig.use_ssl ?? false}
            onChange={(v) => updateField('use_ssl', v)}
            label="Use SSL/TLS"
          />
          <span className="text-sm text-zinc-400">Use SSL/TLS</span>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={!dirty || saveMutation.isPending}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
      {saveMutation.isError && (
        <p className="text-sm text-red-400">
          Failed to save: {saveMutation.error instanceof Error ? saveMutation.error.message : 'Unknown error'}
        </p>
      )}
      {saveMutation.isSuccess && (
        <p className="text-sm text-emerald-400">Configuration saved.</p>
      )}
    </div>
  );
}

function LdapActionsCard() {
  const [testResult, setTestResult] = useState<LdapTestResult | null>(null);
  const [syncResult, setSyncResult] = useState<LdapSyncResult | null>(null);

  const testMutation = useMutation({
    mutationFn: () => testLdapConnection(),
    onSuccess: (data) => setTestResult(data),
  });

  const syncMutation = useMutation({
    mutationFn: () => syncLdapUsers(),
    onSuccess: (data) => setSyncResult(data),
  });

  return (
    <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-6 space-y-4">
      <h3 className="text-base font-medium text-zinc-100">LDAP Actions</h3>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setTestResult(null);
            testMutation.mutate();
          }}
          disabled={testMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {testMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Test Connection
        </button>

        <button
          onClick={() => {
            setSyncResult(null);
            syncMutation.mutate();
          }}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {syncMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Sync Users
        </button>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-lg p-3 text-sm',
            testResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}
        >
          {testResult.success ? (
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <div>
            <p>{testResult.message}</p>
            {testResult.success && (
              <p className="text-xs mt-1 text-zinc-400">
                {testResult.users_found} users, {testResult.groups_found} groups found
              </p>
            )}
          </div>
        </div>
      )}
      {testMutation.isError && (
        <p className="text-sm text-red-400">
          Test failed: {testMutation.error instanceof Error ? testMutation.error.message : 'Unknown error'}
        </p>
      )}

      {/* Sync result */}
      {syncResult && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-lg p-3 text-sm',
            syncResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}
        >
          {syncResult.success ? (
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <div>
            <p>
              {syncResult.users_created} created, {syncResult.users_updated} updated,{' '}
              {syncResult.users_deactivated} deactivated
            </p>
            {syncResult.errors.length > 0 && (
              <ul className="mt-1 text-xs text-red-400 list-disc list-inside">
                {syncResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {syncMutation.isError && (
        <p className="text-sm text-red-400">
          Sync failed: {syncMutation.error instanceof Error ? syncMutation.error.message : 'Unknown error'}
        </p>
      )}
    </div>
  );
}

function GroupMappingsCard() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMapping, setNewMapping] = useState<LdapGroupMappingCreate>({
    ldap_group_dn: '',
    vault_role: 'user',
    priority: 0,
  });

  const { data: mappings = [] } = useQuery<LdapGroupMapping[]>({
    queryKey: ['ldap-mappings'],
    queryFn: ({ signal }) => getLdapMappings(signal),
  });

  const createMut = useMutation({
    mutationFn: (data: LdapGroupMappingCreate) => createLdapMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ldap-mappings'] });
      setShowAddForm(false);
      setNewMapping({ ldap_group_dn: '', vault_role: 'user', priority: 0 });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { vault_role?: string; priority?: number } }) =>
      updateLdapMapping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ldap-mappings'] });
      setEditingId(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteLdapMapping(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ldap-mappings'] }),
  });

  return (
    <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-zinc-100">Group Mappings</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Mapping
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Map LDAP groups to Vault roles. Higher priority mappings take precedence.
      </p>

      {/* Add form */}
      {showAddForm && (
        <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">LDAP Group DN</label>
            <input
              type="text"
              value={newMapping.ldap_group_dn}
              onChange={(e) => setNewMapping({ ...newMapping, ldap_group_dn: e.target.value })}
              placeholder="cn=admins,ou=groups,dc=example,dc=com"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Vault Role</label>
              <select
                value={newMapping.vault_role}
                onChange={(e) => setNewMapping({ ...newMapping, vault_role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Priority</label>
              <input
                type="number"
                value={newMapping.priority ?? 0}
                onChange={(e) => setNewMapping({ ...newMapping, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => createMut.mutate(newMapping)}
              disabled={!newMapping.ldap_group_dn || createMut.isPending}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {createMut.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Mappings table */}
      {mappings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-700/50">
                <th className="pb-2 font-medium">LDAP Group DN</th>
                <th className="pb-2 font-medium">Vault Role</th>
                <th className="pb-2 font-medium">Priority</th>
                <th className="pb-2 font-medium w-20" />
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <MappingRow
                  key={m.id}
                  mapping={m}
                  editing={editingId === m.id}
                  onEdit={() => setEditingId(m.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(data) => updateMut.mutate({ id: m.id, data })}
                  onDelete={() => deleteMut.mutate(m.id)}
                  saving={updateMut.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-zinc-500 text-center py-3">No group mappings configured</p>
      )}
    </div>
  );
}

function MappingRow({
  mapping,
  editing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  saving,
}: {
  mapping: LdapGroupMapping;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: { vault_role?: string; priority?: number }) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [role, setRole] = useState(mapping.vault_role);
  const [priority, setPriority] = useState(mapping.priority);

  if (editing) {
    return (
      <tr className="border-b border-zinc-800/50">
        <td className="py-2.5 pr-3 text-zinc-300 font-mono text-xs">{mapping.ldap_group_dn}</td>
        <td className="py-2.5 pr-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="viewer">Viewer</option>
          </select>
        </td>
        <td className="py-2.5 pr-3">
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
          />
        </td>
        <td className="py-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSave({ vault_role: role, priority })}
              disabled={saving}
              className="px-2 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="px-2 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-zinc-800/50">
      <td className="py-2.5 pr-3 text-zinc-300 font-mono text-xs">{mapping.ldap_group_dn}</td>
      <td className="py-2.5 pr-3">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium capitalize',
            mapping.vault_role === 'admin'
              ? 'bg-purple-500/20 text-purple-400'
              : mapping.vault_role === 'user'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-zinc-500/20 text-zinc-400'
          )}
        >
          {mapping.vault_role}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-zinc-400">{mapping.priority}</td>
      <td className="py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function LdapSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">LDAP / SSO</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Configure LDAP directory integration for centralized user authentication
        </p>
      </div>
      <LdapConnectionCard />
      <LdapActionsCard />
      <GroupMappingsCard />
    </div>
  );
}
