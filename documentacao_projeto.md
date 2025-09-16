# Documentação do Projeto: Director's Cut

## 1. Objetivo do Projeto

Plataforma web para gestão, exibição e cadastro de filmes, com perfis de usuário diferenciados (Master, Admin, Usuário), integração com banco de dados e interface moderna. A princípio, uma solução pensada para grupos acadêmicos, para estudantes de cinema e afins terem onde compartilhar seus trabalhos em uma plataforma integrada.

## 2. Público Alvo

- Estudantes 
- Cineastas independentes
- Administradores de acervos
- Usuários interessados em publicar e gerenciar seus próprios filmes

## 3. Requisitos Funcionais

- Cadastro e autenticação de usuários
- Perfis: Master (gestão total), Admin (gestão de filmes), Usuário (gestão dos próprios filmes)
- Cadastro, edição, exclusão e exibição de filmes
- Filtros por gênero, ano, duração
- Upload de imagens e vídeos
- Painel administrativo com gestão de usuários e permissões
- Tela de perfil com edição de dados, foto, senha, preferências
- Notificações e feedback visual

## 4. Requisitos Não Funcionais

- Interface responsiva e acessível
- Segurança: Row Level Security no Supabase
- Armazenamento de arquivos em Supabase Storage
- Deploy em ambiente cloud

## 5. Regras de Negócio

- Usuário Master pode promover/demover outros usuários
- Usuário Admin pode gerenciar todos os filmes, mas não usuários
- Usuário comum só pode editar/excluir seus próprios filmes
- Filmes podem ser destacados (featured) por Admin/Master
- Upload de avatar só permitido para usuários autenticados

## 6. Arquitetura Técnica

- Frontend: React + Vite + TypeScript
- UI: Tailwind CSS, shadcn-ui
- Backend: Supabase (auth, database, storage)
- Estrutura de pastas:
  - src/pages: páginas principais
  - src/components: componentes reutilizáveis
  - src/hooks: hooks customizados
  - src/integrations/supabase: integração cloud
  - supabase/migrations: scripts de banco

## 7. Fluxos Principais

- Cadastro/Login
- Gestão de filmes (CRUD)
- Gestão de usuários (Master/Admin)
- Edição de perfil
- Upload de avatar
- Filtros e busca no catálogo

## 8. Instalação e Execução

```bash
npm install
npm run dev
```

Configurar Supabase conforme documentação do projeto.

## 9. Referências

- [Supabase](https://supabase.com/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---