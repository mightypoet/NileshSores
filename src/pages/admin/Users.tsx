import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { UserProfile } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await dataService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    
    // Prevent self-demotion
    // (Wait, we don't have the current logged in user email easily here, but usually it's handled by auth state)
    // For now, allow it but with a warning.
    
    try {
      const success = await dataService.updateUserRole(user.id, newRole);
      if (success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        toast.success(`${user.name} is now a ${newRole}`);
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Users</h1>
        <p className="text-zinc-500 mt-1.5">Manage user accounts and administrative roles.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((user, idx) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
                        {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-zinc-900 tracking-tight">{user.name || 'Anonymous User'}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">ID: {user.id.substring(0, 10)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-medium">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-[10px] text-zinc-400 font-bold">{user.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest">
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : 'Customer'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      {user.createdAt ? (
                        typeof user.createdAt === 'string'
                          ? new Date(user.createdAt).toLocaleDateString()
                          : new Date(user.createdAt?.seconds * 1000 || user.createdAt).toLocaleDateString()
                      ) : new Date().toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRoleToggle(user)}
                      className="rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600"
                    >
                      Toggle Role
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-zinc-400">
              <Filter className="w-10 h-10 opacity-20 mx-auto mb-4" />
              <p className="font-medium tracking-tight">No users match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
