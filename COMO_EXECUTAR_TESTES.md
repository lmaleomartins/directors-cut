# 🚀 COMO EXECUTAR OS TESTES - Director's Cut

## ✅ Status das dependências:

- ✅ **Selenium**: Já instalado
- ⚠️ **ChromeDriver**: Precisa ser baixado

## 📥 Download do ChromeDriver

### Opção 1: Download Automático (Windows)

Execute este comando no PowerShell:

```powershell
# Baixar ChromeDriver automaticamente
Invoke-WebRequest -Uri "https://storage.googleapis.com/chrome-for-testing-public/130.0.6723.69/win64/chromedriver-win64.zip" -OutFile "chromedriver.zip"
Expand-Archive -Path "chromedriver.zip" -DestinationPath "." -Force
Move-Item "chromedriver-win64\chromedriver.exe" "chromedriver.exe"
Remove-Item "chromedriver.zip", "chromedriver-win64" -Recurse -Force
```

### Opção 2: Download Manual

1. Acesse: https://googlechromelabs.github.io/chrome-for-testing/
2. Baixe a versão "Stable" do ChromeDriver para Windows
3. Extraia o `chromedriver.exe` na pasta do projeto

## 🎯 Executar os testes

### Teste Simples (RECOMENDADO para começar):

```powershell
# Edite suas credenciais no arquivo primeiro!
python test_simple.py
```

### Teste Avançado:

```powershell
python test_add_movie_advanced.py
```

## ⚙️ Configurar credenciais

### No arquivo `test_simple.py`, linha 97:

```python
EMAIL = "seu-email-real@exemplo.com"     # 🔑 SEU EMAIL REAL
PASSWORD = "suasenha123"                 # 🔑 SUA SENHA REAL
```

### No arquivo `test_add_movie_advanced.py`, linha 355:

```python
"credentials": {
    "email": "seu-email-real@exemplo.com",
    "password": "suasenha123"
}
```

## 🌐 URL de teste

Todos os scripts estão configurados para testar:
**https://preview--directors-cut.lovable.app**

## ✅ Sequência completa:

1. **Baixar ChromeDriver** (comandos acima)
2. **Editar credenciais** nos arquivos Python
3. **Executar teste**:
   ```powershell
   python test_simple.py
   ```

## 🐛 Solução de problemas

### "ChromeDriver não encontrado":

- Execute os comandos de download do ChromeDriver acima
- Ou baixe manualmente e coloque `chromedriver.exe` na pasta

### "Credenciais inválidas":

- Verifique email e senha no Supabase
- Teste login manual no site primeiro

### "Elemento não encontrado":

- Use `HEADLESS = False` para ver o que acontece
- Verifique se o site está funcionando

## 📋 O que o teste faz:

1. 🌐 **Abre** https://preview--directors-cut.lovable.app/auth
2. 🔐 **Faz login** com suas credenciais
3. 🎬 **Clica** no botão "Adicionar Filme" (ID: `add-movie-button`)
4. 📝 **Preenche** formulário com dados de teste
5. ✅ **Verifica** se o filme foi adicionado

---

**Happy Testing! 🎬✨**
