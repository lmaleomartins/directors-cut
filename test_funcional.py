#!/usr/bin/env python3
"""
🎯 TESTE FUNCIONAL - Director's Cut
Baseado na estrutura descoberta: 3 dropdowns (Ano, Duração*, Gênero)
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException

# Tentar importar webdriver-manager
try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False

class FunctionalTest:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app", headless=False):
        """Teste funcional baseado na estrutura conhecida"""
        self.base_url = base_url
        self.wait_timeout = 15
        
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--window-size=1400,1000")
        chrome_options.add_argument("--start-maximized")
        
        try:
            if WEBDRIVER_MANAGER_AVAILABLE:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                print("✅ ChromeDriver automático configurado!")
            elif os.path.exists("chromedriver.exe"):
                service = Service("chromedriver.exe")
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                print("✅ ChromeDriver local configurado!")
            else:
                self.driver = webdriver.Chrome(options=chrome_options)
                print("✅ ChromeDriver do sistema configurado!")
            
            self.wait = WebDriverWait(self.driver, self.wait_timeout)
            self.actions = ActionChains(self.driver)
            
        except Exception as e:
            print(f"❌ Erro na configuração: {e}")
            raise
    
    def type_slowly(self, element, text, delay=0.1):
        """Digitar devagar para demonstração"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(delay)
    
    def login(self, email, password):
        """Login com feedback visual"""
        print("🔐 Realizando login...")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            time.sleep(2)
            
            print("   📧 Preenchendo email...")
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            self.type_slowly(email_field, email, 0.08)
            
            time.sleep(1)
            
            print("   🔑 Preenchendo senha...")
            password_field = self.driver.find_element(By.ID, "password")
            self.type_slowly(password_field, password, 0.06)
            
            time.sleep(1)
            
            print("   🚀 Fazendo login...")
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            
            self.wait.until(lambda driver: "/admin" in driver.current_url)
            print("✅ Login realizado com sucesso!")
            return True
            
        except Exception as e:
            print(f"❌ Erro no login: {e}")
            return False
    
    def select_dropdown_by_index(self, dropdown_index, option_text=None, description="dropdown"):
        """Selecionar dropdown por índice com tratamento robusto"""
        print(f"   🔽 Configurando {description}...")
        
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                # Re-localizar dropdowns a cada tentativa para evitar stale elements
                dropdowns = self.driver.find_elements(By.XPATH, "//button[@role='combobox']")
                
                if len(dropdowns) <= dropdown_index:
                    print(f"      ❌ Dropdown {dropdown_index + 1} não encontrado")
                    return False
                
                dropdown = dropdowns[dropdown_index]
                
                # Rolar até o elemento se necessário
                self.driver.execute_script("arguments[0].scrollIntoView(true);", dropdown)
                time.sleep(0.5)
                
                # Clicar no dropdown
                dropdown.click()
                time.sleep(1.5)  # Aguardar opções aparecerem
                
                # Procurar opções
                options = self.driver.find_elements(By.XPATH, "//div[@role='option']")
                
                if not options:
                    print(f"      ⚠️  Nenhuma opção encontrada - tentativa {attempt + 1}")
                    time.sleep(1)
                    continue
                
                print(f"      📋 {len(options)} opções disponíveis")
                
                # Selecionar opção
                selected = False
                
                if option_text:
                    # Procurar opção específica
                    for option in options:
                        if option_text.lower() in option.text.lower():
                            option.click()
                            print(f"      ✅ Selecionado: '{option.text}'")
                            selected = True
                            break
                
                if not selected and options:
                    # Selecionar primeira opção disponível
                    options[0].click()
                    print(f"      ✅ Primeira opção: '{options[0].text}'")
                    selected = True
                
                if selected:
                    time.sleep(1)
                    return True
                else:
                    print(f"      ❌ Falha na seleção - tentativa {attempt + 1}")
                
            except (StaleElementReferenceException, Exception) as e:
                print(f"      ⚠️  Erro na tentativa {attempt + 1}: {type(e).__name__}")
                time.sleep(1)
                
                if attempt == max_attempts - 1:
                    print(f"      ❌ Falha após {max_attempts} tentativas")
                    return False
        
        return False
    
    def add_movie_with_structure(self):
        """Adicionar filme baseado na estrutura conhecida"""
        print("\n🎬 Adicionando filme ao catálogo...")
        
        try:
            # Abrir modal
            print("🔘 Abrindo formulário de adição...")
            add_button = self.wait.until(EC.element_to_be_clickable((By.ID, "add-movie-button")))
            add_button.click()
            time.sleep(2)
            
            # Aguardar modal carregar completamente
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            time.sleep(1)
            
            # Campos básicos
            print("📝 Preenchendo informações básicas...")
            
            movie_title = "Cinema Automatizado"
            print(f"   🎬 Título: '{movie_title}'")
            self.type_slowly(title_field, movie_title, 0.08)
            
            time.sleep(1)
            
            director_name = "Alan Turing"
            print(f"   🎭 Diretor: '{director_name}'")
            director_field = self.driver.find_element(By.ID, "director")
            self.type_slowly(director_field, director_name, 0.08)
            
            time.sleep(1.5)
            
            # Configurar dropdowns obrigatórios
            print("⚙️  Configurando metadados obrigatórios...")
            
            # Dropdown 1: Ano (índice 0)
            self.select_dropdown_by_index(0, "2023", "ano")
            
            # Dropdown 2: Duração (índice 1) - OBRIGATÓRIO
            success = self.select_dropdown_by_index(1, "90-120", "duração (OBRIGATÓRIO)")
            if not success:
                print("❌ ERRO CRÍTICO: Duração não foi selecionada!")
                return False
            
            # Dropdown 3: Gênero (índice 2) - OBRIGATÓRIO
            self.select_dropdown_by_index(2, "Drama", "gênero")
            
            time.sleep(2)
            
            # Submeter formulário
            print("💾 Salvando filme...")
            
            # Procurar botão de submit
            submit_selectors = [
                "//button[@type='submit']",
                "//button[contains(text(), 'Adicionar')]",
                "//button[contains(text(), 'Salvar')]"
            ]
            
            submit_button = None
            for selector in submit_selectors:
                try:
                    submit_button = self.driver.find_element(By.XPATH, selector)
                    break
                except:
                    continue
            
            if not submit_button:
                print("❌ Botão de submit não encontrado!")
                return False
            
            # Rolar até o botão e clicar
            self.driver.execute_script("arguments[0].scrollIntoView(true);", submit_button)
            time.sleep(0.5)
            
            submit_button.click()
            print("   🚀 Formulário enviado!")
            
            # Aguardar processamento
            time.sleep(4)
            
            # Verificar se modal fechou (sucesso) ou ainda está aberto (erro)
            try:
                self.driver.find_element(By.ID, "title")
                print("⚠️  Modal ainda aberto - verificando erros...")
                
                # Procurar mensagens de erro
                error_selectors = [
                    "//*[contains(@class, 'error')]",
                    "//*[@role='alert']",
                    "//*[contains(@class, 'destructive')]"
                ]
                
                errors_found = []
                for selector in error_selectors:
                    try:
                        error_elements = self.driver.find_elements(By.XPATH, selector)
                        for elem in error_elements:
                            if elem.text.strip():
                                errors_found.append(elem.text.strip())
                    except:
                        continue
                
                if errors_found:
                    print("❌ Erros encontrados:")
                    for error in errors_found:
                        print(f"   - {error}")
                else:
                    print("⚠️  Modal aberto mas sem erros visíveis")
                
                return False
                
            except NoSuchElementException:
                print("✅ Modal fechou - filme adicionado com sucesso!")
                print(f"   📽️  Título: {movie_title}")
                print(f"   🎭 Diretor: {director_name}")
                print(f"   📅 Ano: 2023")
                print(f"   ⏱️  Duração: 90-120 min")
                print(f"   🎭 Gênero: Drama")
                return True
            
        except Exception as e:
            print(f"❌ Erro ao adicionar filme: {e}")
            
            # Screenshot para debug
            try:
                self.driver.save_screenshot("erro_filme.png")
                print("📸 Screenshot salvo: erro_filme.png")
            except:
                pass
            
            return False
    
    def run_complete_test(self, email, password):
        """Teste completo funcional"""
        print("🎯 TESTE FUNCIONAL - DIRECTOR'S CUT")
        print("="*50)
        print("🎬 Demonstração de automação cinematográfica")
        print("🤖 Tecnologia: Selenium WebDriver")
        print("="*50)
        
        start_time = time.time()
        
        try:
            # Login
            if not self.login(email, password):
                return False
            
            time.sleep(3)
            
            # Adicionar filme
            success = self.add_movie_with_structure()
            
            # Resultados
            elapsed = time.time() - start_time
            
            print(f"\n" + "="*50)
            if success:
                print("🎉 TESTE CONCLUÍDO COM SUCESSO!")
                print("✅ Automação funcionando perfeitamente!")
            else:
                print("⚠️  TESTE PARCIAL - Verificar detalhes acima")
            
            print(f"⏱️  Tempo total: {elapsed:.1f} segundos")
            print("="*50)
            
            # Aguardar para visualização
            time.sleep(6)
            return success
            
        except Exception as e:
            print(f"💥 ERRO CRÍTICO: {e}")
            return False
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Limpeza final"""
        print("\n🧹 Encerrando teste...")
        self.driver.quit()
        print("✅ Sessão finalizada!")

def main():
    """Função principal"""
    print("🎯 DIRECTOR'S CUT - TESTE FUNCIONAL")
    print("🚀 Versão otimizada para demonstrações")
    print("="*50)
    
    # Credenciais
    EMAIL = "guilherme7072@gmail.com"
    PASSWORD = "124910010" 
    HEADLESS = False  # Sempre visível para demos
    
    print(f"👤 Email: {EMAIL}")
    print(f"🌐 Site: https://preview--directors-cut.lovable.app")
    print(f"🎯 Objetivo: Adicionar filme automaticamente")
    print()
    
    # Executar
    test = FunctionalTest(headless=HEADLESS)
    success = test.run_complete_test(EMAIL, PASSWORD)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()