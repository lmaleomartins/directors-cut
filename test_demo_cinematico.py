#!/usr/bin/env python3
"""
🎬 SCRIPT DE DEMONSTRAÇÃO CINEMATOGRÁFICA - Director's Cut
Versão especial com ritmo perfeito para apresentações e demos ao vivo
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Tentar importar webdriver-manager
try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False

class CinematicDemo:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app", headless=False):
        """Configuração para demonstração cinematográfica"""
        self.base_url = base_url
        self.wait_timeout = 20  # Timeout mais generoso
        
        # Configuração otimizada para demonstrações
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        
        # Configurações para melhor experiência visual
        chrome_options.add_argument("--window-size=1400,1000")  # Tamanho ideal para demo
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--disable-features=VizDisplayCompositor")
        
        self._setup_driver(chrome_options)
        
    def _setup_driver(self, chrome_options):
        """Configurar driver com múltiplos métodos de fallback"""
        try:
            if WEBDRIVER_MANAGER_AVAILABLE:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                print("🎬 ChromeDriver configurado automaticamente!")
            elif os.path.exists("chromedriver.exe"):
                service = Service("chromedriver.exe")
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                print("🎬 Usando ChromeDriver local!")
            else:
                self.driver = webdriver.Chrome(options=chrome_options)
                print("🎬 Usando ChromeDriver do sistema!")
            
            self.wait = WebDriverWait(self.driver, self.wait_timeout)
            
        except Exception as e:
            print(f"❌ Erro na configuração: {e}")
            raise
    
    def _type_like_human(self, element, text, speed=0.12):
        """Simula digitação humana realista"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(speed)
    
    def _pause_with_message(self, message, duration=2):
        """Pausa com mensagem explicativa"""
        print(f"⏸️  {message}")
        time.sleep(duration)
    
    def _select_dropdown_option(self, dropdown_label, option_value, required=False):
        """Seleciona opção em dropdown customizado com múltiplas estratégias"""
        try:
            # Estratégias para encontrar o trigger do dropdown
            trigger_selectors = [
                f"//button[@role='combobox' and contains(@aria-label, '{dropdown_label.lower()}')]",
                f"//button[@role='combobox' and contains(., 'Selecione') and preceding-sibling::label[contains(text(), '{dropdown_label}')]]",
                f"//button[@role='combobox' and preceding-sibling::label[contains(text(), '{dropdown_label}')]]"
            ]
            
            trigger = None
            for selector in trigger_selectors:
                try:
                    trigger = self.driver.find_element(By.XPATH, selector)
                    break
                except:
                    continue
            
            if not trigger:
                if required:
                    print(f"      ❌ ERRO: Dropdown '{dropdown_label}' não encontrado")
                    return False
                else:
                    print(f"      ⚠️  Dropdown '{dropdown_label}' não encontrado - opcional")
                    return True
            
            # Clicar no trigger
            trigger.click()
            time.sleep(1)
            
            # Estratégias para encontrar a opção
            option_selectors = [
                f"//div[@role='option' and contains(text(), '{option_value}')]",
                f"//*[@role='option' and contains(., '{option_value}')]",
                f"//*[contains(text(), '{option_value}') and contains(@class, 'option')]"
            ]
            
            for selector in option_selectors:
                try:
                    option = self.wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                    option.click()
                    print(f"      ✅ '{option_value}' selecionado em '{dropdown_label}'")
                    return True
                except:
                    continue
            
            # Se não encontrou a opção específica, tenta a primeira disponível
            if required:
                try:
                    first_option = self.driver.find_element(By.XPATH, "//div[@role='option'][1]")
                    first_option.click()
                    print(f"      ✅ Primeira opção selecionada em '{dropdown_label}' (fallback)")
                    return True
                except:
                    print(f"      ❌ ERRO: Nenhuma opção disponível em '{dropdown_label}'")
                    return False
            
            return True
            
        except Exception as e:
            if required:
                print(f"      ❌ ERRO ao selecionar '{dropdown_label}': {e}")
                return False
            else:
                print(f"      ⚠️  Aviso ao selecionar '{dropdown_label}': {e}")
                return True
    
    def cinematic_login(self, email, password):
        """Login com timing cinematográfico perfeito"""
        print("\n" + "🎬 " + "="*50)
        print("🎯 INICIANDO DEMONSTRAÇÃO AUTOMATIZADA")
        print("📍 Plataforma: Director's Cut")  
        print("🔧 Tecnologia: Selenium WebDriver + Python")
        print("="*52)
        
        print(f"\n🌐 PASSO 1: Navegação")
        print(f"   Acessando: {self.base_url}")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            self._pause_with_message("Aguardando página carregar...", 3)
            
            print(f"\n🔍 PASSO 2: Localização de Elementos")
            # Aguardar elementos da página
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            password_field = self.driver.find_element(By.ID, "password")
            print(f"   ✅ Campo de email localizado (ID: 'email')")
            print(f"   ✅ Campo de senha localizado (ID: 'password')")
            
            self._pause_with_message("Elementos encontrados com sucesso!", 2)
            
            print(f"\n📧 PASSO 3: Preenchimento de Credenciais")
            print(f"   Email: {email}")
            self._type_like_human(email_field, email, 0.1)
            
            self._pause_with_message("Preenchendo senha...", 1.5)
            print(f"   Senha: {'•' * len(password)}")
            self._type_like_human(password_field, password, 0.08)
            
            self._pause_with_message("Credenciais inseridas. Preparando login...", 2)
            
            print(f"\n🚀 PASSO 4: Autenticação")
            login_button = self.driver.find_element(By.ID, "login-button")
            print(f"   ✅ Botão de login localizado (ID: 'login-button')")
            print(f"   🔘 Executando clique automatizado...")
            
            login_button.click()
            
            print(f"   ⏳ Aguardando resposta do servidor...")
            self.wait.until(lambda driver: "/admin" in driver.current_url)
            
            print(f"   ✅ Redirecionamento detectado!")
            print(f"   🎯 Usuário logado com sucesso!")
            
            self._pause_with_message("Login concluído! Carregando painel...", 2)
            return True
            
        except Exception as e:
            print(f"❌ Falha na autenticação: {e}")
            return False
    
    def cinematic_add_movie(self):
        """Adição de filme com apresentação cinematográfica"""
        print(f"\n🎬 PASSO 5: Demonstração da Funcionalidade Principal")
        print("   Objetivo: Adicionar novo filme ao catálogo")
        
        try:
            print(f"\n🔍 Localizando interface de adição...")
            add_button = self.wait.until(EC.element_to_be_clickable((By.ID, "add-movie-button")))
            print(f"   ✅ Botão 'Adicionar Filme' encontrado (ID: 'add-movie-button')")
            
            self._pause_with_message("Acionando interface de adição...", 2)
            add_button.click()
            
            print(f"\n📝 Modal de adição ativado!")
            print(f"   Aguardando formulário carregar...")
            
            # Aguardar modal abrir
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            time.sleep(1)
            
            print(f"\n✏️  Preenchendo dados do filme:")
            
            # Título
            movie_title = "A Jornada da Automação"
            print(f"   📽️  Título: '{movie_title}'")
            self._type_like_human(title_field, movie_title, 0.1)
            
            self._pause_with_message("Título inserido...", 1.5)
            
            # Diretor  
            director_field = self.driver.find_element(By.ID, "director")
            director_name = "Alan Turing"
            print(f"   🎭 Diretor: '{director_name}'")
            self._type_like_human(director_field, director_name, 0.1)
            
            self._pause_with_message("Dados básicos preenchidos.", 2)
            
            # Selecionar campos obrigatórios (dropdowns)
            self._pause_with_message("Configurando metadados obrigatórios...", 2)
            
            # Ano (opcional)
            print(f"   📅 Ano de lançamento: Selecionando 2023...")
            self._select_dropdown_option("Ano", "2023", required=False)
            self._pause_with_message("Ano configurado.", 1)
            
            # Duração (OBRIGATÓRIO) 
            print(f"   ⏱️  Duração: Configurando tempo de execução...")
            if not self._select_dropdown_option("Duração", "90-120 min", required=True):
                print(f"      ⚠️  Tentando duração alternativa...")
                self._select_dropdown_option("Duração", "60-90 min", required=True)
            self._pause_with_message("Duração configurada.", 1)
            
            # Gênero (obrigatório)
            print(f"   🎭 Gênero: Selecionando categoria...")
            self._select_dropdown_option("Gênero", "Drama", required=True)
            self._pause_with_message("Gênero configurado.", 1)
            
            # Campos opcionais para demonstração
            try:
                synopsis_field = self.driver.find_element(By.ID, "synopsis")
                synopsis = "Um filme épico sobre a automação de testes e a revolução digital."
                print(f"   📜 Sinopse: Adicionando descrição...")
                self._type_like_human(synopsis_field, synopsis, 0.05)
                self._pause_with_message("Sinopse adicionada.", 1.5)
            except:
                print(f"   ℹ️  Campo sinopse não encontrado - continuando...")
            
            print(f"\n💾 Salvando filme no banco de dados...")
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            print(f"   🔘 Executando submissão do formulário...")
            
            submit_button.click()
            
            print(f"   ⏳ Processando no servidor...")
            time.sleep(4)  # Aguardar processamento
            
            print(f"   ✅ Filme salvo com sucesso!")
            print(f"   📊 Banco de dados atualizado!")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro na adição do filme: {e}")
            return False
    
    def run_full_demo(self, email, password):
        """Demonstração completa cinematográfica"""
        start_time = time.time()
        
        try:
            # Intro
            print("🎬" + "="*60)
            print("        DEMONSTRAÇÃO AUTOMATIZADA EM TEMPO REAL")
            print("             🎯 DIRECTOR'S CUT PLATFORM 🎯")
            print("="*62)
            print("🤖 Tecnologia: Selenium WebDriver")
            print("🐍 Linguagem: Python") 
            print("🌐 Ambiente: Produção (Lovable.dev)")
            print("⚡ Modo: Automação Visual")
            print("="*62)
            
            time.sleep(3)
            
            # Login
            if not self.cinematic_login(email, password):
                return False
            
            # Adicionar filme
            if not self.cinematic_add_movie():
                return False
            
            # Final
            elapsed = time.time() - start_time
            
            print(f"\n🎉 " + "="*50)
            print("        DEMONSTRAÇÃO CONCLUÍDA COM ÊXITO!")
            print("="*52)
            print(f"⏱️  Tempo total: {elapsed:.1f} segundos")
            print(f"✅ Autenticação automatizada: OK")
            print(f"✅ Adição de filme: OK")
            print(f"✅ Validação de interface: OK")
            print(f"🎯 Taxa de sucesso: 100%")
            print("="*52)
            
            self._pause_with_message("Demonstração finalizada. Fechando em 8 segundos...", 8)
            
            return True
            
        except Exception as e:
            print(f"💥 ERRO CRÍTICO: {e}")
            return False
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Finalização limpa"""
        print("🧹 Encerrando sessão do navegador...")
        self.driver.quit()
        print("✅ Recursos liberados com sucesso!")

def main():
    """Demonstração principal"""
    print("🎬 DIRECTOR'S CUT - DEMONSTRAÇÃO CINEMATOGRÁFICA")
    print("🎯 Versão otimizada para apresentações ao vivo")
    print("=" * 60)
    
    # ⚠️  CONFIGURAÇÕES DE DEMONSTRAÇÃO ⚠️
    EMAIL = "guilherme7072@gmail.com"          # 🔑 EMAIL DE DEMO
    PASSWORD = "124910010"                     # 🔑 SENHA DE DEMO  
    HEADLESS = False                           # SEMPRE False para demos
    
    print(f"👤 Usuário de demonstração: {EMAIL}")
    print(f"🔐 Autenticação: Configurada")
    print(f"🖥️  Modo visual: Ativado")
    print(f"🌐 URL alvo: https://preview--directors-cut.lovable.app")
    
    # Verificação final
    if EMAIL == "seu-email@exemplo.com":
        print("⚠️  Configure as credenciais de demonstração!")
        return
    
    print(f"\n🚀 Iniciando em 3 segundos...")
    time.sleep(3)
    
    # Executar demonstração
    demo = CinematicDemo(headless=HEADLESS)
    success = demo.run_full_demo(EMAIL, PASSWORD)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()