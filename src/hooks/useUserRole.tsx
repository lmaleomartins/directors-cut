import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'master' | 'admin' | 'user';

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  created_by: string | null;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } else {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  const isMaster = () => userRole === 'master';
  const isAdmin = () => userRole === 'admin';
  const isAdminOrMaster = () => userRole === 'admin' || userRole === 'master';
  const isUser = () => userRole === 'user';

  const canManageAllMovies = () => isAdminOrMaster();
  const canManageUsers = () => isMaster();

  return {
    userRole,
    loading,
    isMaster,
    isAdmin,
    isAdminOrMaster,
    isUser,
    canManageAllMovies,
    canManageUsers,
    refetch: fetchUserRole
  };
};