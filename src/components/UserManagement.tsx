import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mapToUserError } from '@/lib/errorUtils';

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  created_by: string | null;
  profiles?: {
    first_name?: string;
    last_name?: string;
  } | null;
}

export const UserManagement = () => {
  const { canManageUsers } = useUserRole();
  const [users, setUsers] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserRoleData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (canManageUsers()) {
      fetchUsers();
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      // Primeiro busca os roles dos usuários
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        toast({
          title: 'Erro',
          description: mapToUserError(rolesError),
          variant: 'destructive'
        });
        return;
      }

      // Depois busca os perfis correspondentes
      const userIds = userRoles?.map(ur => ur.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combina os dados
      const usersWithProfiles = userRoles?.map(userRole => ({
        ...userRole,
        profiles: profiles?.find(p => p.user_id === userRole.user_id) || null
      })) || [];

      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: 'Erro',
          description: mapToUserError(error),
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sucesso',
          description: `Perfil atualizado para ${getRoleLabel(newRole)}.`
        });
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro',
        description: mapToUserError(error),
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) {
        toast({
          title: 'Erro',
          description: mapToUserError(error),
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Usuário excluído com sucesso.'
        });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erro',
        description: mapToUserError(error),
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'master': return 'destructive';
      case 'admin': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'master': return 'Master';
      case 'admin': return 'Admin';
      case 'user': return 'Usuário';
      default: return role;
    }
  };

  const getUserDisplayName = (user: UserRoleData) => {
    if (user.profiles?.first_name && user.profiles?.last_name) {
      return `${user.profiles.first_name} ${user.profiles.last_name}`;
    }
    return user.user_id;
  };

  if (!canManageUsers()) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Carregando usuários...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{getUserDisplayName(user)}</span>
                  {user.profiles?.first_name && (
                    <span className="text-xs text-muted-foreground">{user.user_id}</span>
                  )}
                </div>
                {user.role === 'master' ? (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">Master</span>
                ) : (
                  <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {user.role !== 'master' && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Perfil do Usuário</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">ID do Usuário:</p>
                            <p className="text-sm font-mono">{user.user_id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Novo Perfil:</p>
                            <Select 
                              defaultValue={user.role}
                              onValueChange={(value: UserRole) => updateUserRole(user.user_id, value)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">Usuário</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};