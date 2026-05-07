import React, { useEffect, useState } from 'react';
import { Search, Shield, ShieldOff, Trash2, ChevronDown } from 'lucide-react';
import { userService } from '../../services/api';
import { formatDate, getInitials } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await userService.getAllUsers({ search, role: roleFilter, page, limit: 20 });
      setUsers(data.users);
      setPagination({ total: data.total, pages: data.pages, currentPage: data.currentPage });
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (user) => {
    const reason = user.isBanned ? undefined : prompt('Reason for banning:');
    if (!user.isBanned && !reason) return;
    try {
      await userService.toggleBanUser(user._id, reason);
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isBanned: !u.isBanned } : u));
      toast.success(user.isBanned ? 'User unbanned' : 'User banned');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userService.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">User Management</h1>
        <span className="text-sm text-muted-foreground">{pagination.total} total users</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-9"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar?.url ? (
                          <img src={u.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                            {getInitials(u.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-xs border border-border rounded px-2 py-1 bg-background"
                        disabled={u.role === 'admin'}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleBan(u)}
                            className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
                            title={u.isBanned ? 'Unban' : 'Ban'}>
                            {u.isBanned ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-border">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => loadUsers(page)}
                  className={`w-8 h-8 rounded text-sm ${page === pagination.currentPage ? 'bg-brand-600 text-white' : 'border border-border hover:bg-muted'}`}>
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
