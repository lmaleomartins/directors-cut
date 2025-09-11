import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  created_by: string | null;
}

export const UserManagement = () => {
  const { canManageUsers } = useUserRole();
  const [users, setUsers] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('admin');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (canManageUsers()) {
      fetchUsers();
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar usuários.',
          variant: 'destructive'
        });
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewAdmin = async () => {
    if (!newUserEmail || !newUserRole) return;

    setIsCreating(true);
    try {
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: 'temp123!', // Temporary password - user should reset
        email_confirm: true
      });

      if (authError) {
        toast({
          title: 'Erro',
          description: `Erro ao criar usuário: ${authError.message}`,
          variant: 'destructive'
        });
        return;
      }

      // Then update their role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: newUserRole })
        .eq('user_id', authData.user.id);

      if (roleError) {
        toast({
          title: 'Erro',
          description: 'Erro ao atribuir role ao usuário.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sucesso',
          description: `${newUserRole === 'admin' ? 'Admin' : 'Usuário'} criado com sucesso! Senha temporária: temp123!`,
          duration: 5000
        });
        setNewUserEmail('');
        setNewUserRole('admin');
        setIsDialogOpen(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar usuário.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao excluir usuário.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sucesso',
          description: 'Usuário excluído com sucesso.'
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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

  if (!canManageUsers()) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Carregando usuários...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Usuários</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={createNewAdmin} 
                disabled={isCreating || !newUserEmail}
                className="w-full"
              >
                {isCreating ? 'Criando...' : 'Criar Usuario'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{user.user_id}</span>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              {user.role !== 'master' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(user.user_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};