import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
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
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.firstName || '');
      setLastName(user.user_metadata?.lastName || '');
      setEmail(user.email || '');
      setBio(user.user_metadata?.bio || '');
      setAvatarUrl(user.user_metadata?.avatarUrl || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updates = {
      firstName,
      lastName,
      bio,
      avatarUrl,
    };
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (error) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } else {
      toast.success('Perfil atualizado com sucesso!');
      setEdit(false);
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
          <div className="flex flex-col items-center gap-4 mb-6">
            {/* Foto de perfil */}
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                (firstName?.[0] || '') + (lastName?.[0] || '')
              )}
            </div>
            {/* Nome e e-mail */}
            <div className="text-center">
              <div className="text-xl font-semibold">{firstName} {lastName}</div>
              <div className="text-muted-foreground">{email}</div>
            </div>
          </div>
          {edit ? (
            <form className="space-y-4" onSubmit={handleSave}>
              <Input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Nome" required />
              <Input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sobrenome" required />
              <Input id="email" type="email" value={email} disabled />
              <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Biografia" />
              {/* Futuro: upload de foto, preferências, tema, redes sociais, histórico, excluir conta */}
              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={() => setEdit(false)}>Cancelar</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div><span className="font-medium">Nome:</span> {firstName}</div>
              <div><span className="font-medium">Sobrenome:</span> {lastName}</div>
              <div><span className="font-medium">E-mail:</span> {email}</div>
              <div><span className="font-medium">Biografia:</span> {bio || <span className="text-muted-foreground">(não preenchida)</span>}</div>
              <Button className="mt-4" onClick={() => setEdit(true)}>Editar Perfil</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
