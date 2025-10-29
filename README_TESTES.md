# 🧪 Testes Automatizados - Director's Cut

Este diretório contém scripts de teste automatizado para validar as funcionalidades do Director's Cut usando Selenium WebDriver.

## 📋 Pré-requisitos

### 1. Python 3.7+

```powershell
# Verificar versão do Python
python --version
```

### 2. Instalar dependências

```powershell
# Instalar dependências do teste
pip install -r requirements-test.txt
```

### 3. Chrome Browser

- Tenha o Google Chrome instalado no sistema
- O script usa `webdriver-manager` para baixar automaticamente o ChromeDriver

## 🚀 Como usar

### Script Básico (`test_add_movie.py`)

Script simples para teste básico da funcionalidade:

```powershell
# Editar credenciais no arquivo primeiro
python test_add_movie.py
```

### Script Avançado (`test_add_movie_advanced.py`) - **RECOMENDADO**

Script mais robusto com melhor tratamento de erros:

```powershell
# Editar credenciais no arquivo primeiro
python test_add_movie_advanced.py
```

## ⚙️ Configuração

### 1. Ajustar credenciais

Edite as credenciais no final do arquivo de teste:

```python
"credentials": {
    "email": "seu-email@exemplo.com",     # 🔑 SEU EMAIL AQUI
    "password": "suasenha123"             # 🔑 SUA SENHA AQUI
}
```

### 2. Ajustar URL (se necessário)

```python
"base_url": "https://preview--directors-cut.lovable.app",  # URL da aplicação
```

### 3. Modo de execução

```python
"headless": False,  # True = sem interface, False = mostra navegador
```

## 🎯 O que o teste faz

1. **🔐 Login Automatizado**

   - Navega para `/auth`
   - Preenche email e senha
   - Clica no botão de login (ID: `login-button`)
   - Verifica redirecionamento para `/admin`

2. **🎬 Adicionar Filme**

   - Clica no botão "Adicionar Filme" (ID: `add-movie-button`)
   - Preenche formulário com dados de teste
   - Submete o formulário
   - Verifica se o modal fecha (sucesso)

3. **✅ Verificação**
   - Procura o filme na lista de filmes
   - Confirma que foi adicionado corretamente

## 📊 Resultados

O script fornece output detalhado:

- ✅ Sucesso em cada etapa
- ❌ Falhas com descrição do erro
- 📸 Screenshots automáticos em caso de erro
- 📈 Estatísticas finais

## 🐛 Debug

### Screenshots automáticos

O script salva screenshots em caso de erro:

- `login_failed.png` - Falha no login
- `admin_page_failed.png` - Falha ao carregar admin
- `movie_X_add_failed.png` - Falha ao adicionar filme X
- `final_state.png` - Estado final da aplicação

### Logs detalhados

Todos os passos são logados no console com emojis para facilitar identificação.

## 🔧 Troubleshooting

### Erro: "ChromeDriver not found"

- O `webdriver-manager` deve baixar automaticamente
- Se falhar, baixe manualmente do [ChromeDriver](https://chromedriver.chromium.org/)

### Erro: "Element not found"

- Verifique se a aplicação está rodando na URL correta
- Confirme que os IDs dos elementos não mudaram
- Use modo não-headless para visualizar o que acontece

### Erro de login

- Verifique suas credenciais
- Confirme que o usuário existe no Supabase
- Teste login manual primeiro

### Timeout erros

- Aumente `self.wait_timeout` no construtor da classe
- Verifique se a aplicação não está lenta
- Use uma conexão de internet estável

## 🎨 Customização

### Adicionar mais filmes de teste

Edite o array `test_movies` no método `run_complete_test()`:

```python
test_movies = [
    {
        "title": "Meu Filme Teste",
        "director": "Diretor Teste",
        "year": "2023",
        "duration": "90-120 min",
        "genres": ["Drama", "Comédia"],
        "thumbnail": "https://exemplo.com/imagem.jpg",
        "video_url": "https://exemplo.com/video.mp4",
        "synopsis": "Sinopse do filme de teste..."
    },
    # Adicionar mais filmes aqui...
]
```

### Testar outras funcionalidades

Use os IDs e seletores existentes para criar novos testes:

- Editar filme
- Deletar filme
- Gerenciar usuários
- Etc.

## 📝 Notas importantes

1. **⚠️ Dados de teste**: Os filmes adicionados pelos testes ficam no seu banco de dados real
2. **🔒 Credenciais**: Nunca commite credenciais reais no código
3. **🌐 Ambiente**: Teste primeiro em ambiente de desenvolvimento
4. **🔄 Limpeza**: Considere limpar dados de teste após execução

## 🤝 Contribuindo

Para melhorar os testes:

1. Adicione mais validações
2. Teste casos de erro (dados inválidos, etc.)
3. Adicione testes para outras funcionalidades
4. Melhore os seletores CSS/XPath
5. Adicione testes de performance

---

**Happy Testing! 🎬✨**
