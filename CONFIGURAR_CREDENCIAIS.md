# 🔐 CONFIGURAÇÃO DE CREDENCIAIS - Director's Cut

## ⚠️ IMPORTANTE: Configure suas credenciais reais nos arquivos de teste

### Para o teste simples (`test_simple.py`), linha 97:

```python
EMAIL = "admin@directorscut.com"         # 🔑 SEU EMAIL REAL
PASSWORD = "suasenhareal123"             # 🔑 SUA SENHA REAL
HEADLESS = False                         # True = sem interface
```

### Para o teste avançado (`test_add_movie_advanced.py`), linha 355:

```python
CONFIG = {
    "base_url": "https://preview--directors-cut.lovable.app",
    "headless": False,
    "credentials": {
        "email": "admin@directorscut.com",     # 🔑 SEU EMAIL REAL
        "password": "suasenhareal123"          # 🔑 SUA SENHA REAL
    }
}
```

## 🚀 Como executar após configurar:

1. **Edite suas credenciais** nos arquivos acima
2. **Execute o teste**:
   ```powershell
   python test_simple.py
   ```

## ✅ O que deve acontecer:

1. 🌐 Abre https://preview--directors-cut.lovable.app/auth
2. 🔐 Faz login automaticamente
3. 🎬 Adiciona um filme de teste
4. ✅ Verifica se foi adicionado com sucesso

## 📧 Onde encontrar suas credenciais:

- **Email**: O mesmo que você usa para fazer login no site
- **Senha**: A mesma senha que você usa para fazer login no site

---

**⚠️ NUNCA commite credenciais reais no Git!**
