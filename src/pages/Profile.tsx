import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.firstName || '');
      setLastName(user.user_metadata?.lastName || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updates = {
      firstName,
      lastName,
    };
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (error) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } else {
      toast.success('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border shadow-cinema relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Meu Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar ao site
          </Button>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-foreground">Nome</label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-foreground">Sobrenome</label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
