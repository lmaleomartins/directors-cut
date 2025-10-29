#!/usr/bin/env python3
"""
🎬 TESTE MINIMALISTA - Director's Cut
Foca apenas nos campos obrigatórios básicos
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

class MinimalTest:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app", headless=False):
        """Teste minimalista"""
        self.base_url = base_url
        self.wait_timeout = 15
        
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--window-size=1400,1000")
        
        try:
            if WEBDRIVER_MANAGER_AVAILABLE:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            elif os.path.exists("chromedriver.exe"):
                service = Service("chromedriver.exe")
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            else:
                self.driver = webdriver.Chrome(options=chrome_options)
            
            self.wait = WebDriverWait(self.driver, self.wait_timeout)
            print("✅ WebDriver configurado!")
            
        except Exception as e:
            print(f"❌ Erro: {e}")
            raise
    
    def login(self, email, password):
        """Login básico"""
        print("🔐 Fazendo login...")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            time.sleep(3)
            
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            password_field = self.driver.find_element(By.ID, "password")
            
            email_field.send_keys(email)
            password_field.send_keys(password)
            
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            
            self.wait.until(lambda driver: "/admin" in driver.current_url)
            print("✅ Login OK!")
            return True
            
        except Exception as e:
            print(f"❌ Erro no login: {e}")
            return False
    
    def add_minimal_movie(self):
        """Tenta adicionar filme apenas com campos básicos"""
        print("🎬 Tentando adicionar filme...")
        
        try:
            # Abrir modal
            add_button = self.wait.until(EC.element_to_be_clickable((By.ID, "add-movie-button")))
            add_button.click()
            time.sleep(2)
            
            # Preencher apenas título e diretor
            print("📝 Preenchendo campos básicos...")
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            title_field.send_keys("Teste Mínimo")
            
            director_field = self.driver.find_element(By.ID, "director")
            director_field.send_keys("Diretor Teste")
            
            time.sleep(2)
            
            print("🔧 Investigando dropdowns...")
            # Listar todos os elementos select/combobox
            selects = self.driver.find_elements(By.XPATH, "//*[@role='combobox' or @role='button' or contains(@class, 'select')]")
            print(f"   Encontrados {len(selects)} elementos de seleção")
            
            # Tentar descobrir qual é qual pelos labels próximos
            for i, select_elem in enumerate(selects):
                try:
                    # Procurar label próximo
                    parent = select_elem.find_element(By.XPATH, "./..")
                    label = parent.find_element(By.TAG_NAME, "label")
                    label_text = label.text.lower()
                    
                    print(f"   Dropdown {i+1}: Label '{label.text}'")
                    
                    if "duração" in label_text or "duration" in label_text:
                        print(f"      -> Identificado como DURAÇÃO (obrigatório)")
                        
                        # Tentar clicar e selecionar primeira opção
                        try:
                            select_elem.click()
                            time.sleep(1.5)
                            
                            # Procurar opções disponíveis
                            options = self.driver.find_elements(By.XPATH, "//div[@role='option'] | //*[contains(@class, 'option')]")
                            print(f"         Opções disponíveis: {len(options)}")
                            
                            if options:
                                # Tentar encontrar uma opção com "min" ou pegar a primeira
                                selected = False
                                for option in options:
                                    if "min" in option.text.lower():
                                        option.click()
                                        print(f"         ✅ Selecionado: '{option.text}'")
                                        selected = True
                                        break
                                
                                if not selected:
                                    options[0].click()
                                    print(f"         ✅ Primeira opção: '{options[0].text}'")
                                
                                time.sleep(1)
                            else:
                                print("         ❌ Nenhuma opção encontrada")
                                
                        except Exception as e:
                            print(f"         ❌ Erro ao selecionar: {e}")
                    
                    elif "gênero" in label_text or "genre" in label_text:
                        print(f"      -> Identificado como GÊNERO")
                        
                        try:
                            select_elem.click()
                            time.sleep(1)
                            
                            options = self.driver.find_elements(By.XPATH, "//div[@role='option']")
                            if options:
                                options[0].click()  # Primeira opção
                                print(f"         ✅ Selecionado: '{options[0].text}'")
                            
                            time.sleep(1)
                        except Exception as e:
                            print(f"         ❌ Erro: {e}")
                    
                    else:
                        print(f"      -> Outros: '{label.text}'")
                
                except Exception as e:
                    print(f"   Dropdown {i+1}: Sem label identificável")
            
            time.sleep(2)
            
            print("💾 Tentando salvar...")
            # Tentar submeter
            submit_buttons = self.driver.find_elements(By.XPATH, "//button[@type='submit' or contains(., 'Adicionar') or contains(., 'Salvar')]")
            
            if submit_buttons:
                submit_buttons[0].click()
                print("🔘 Formulário submetido!")
                
                time.sleep(4)
                
                # Verificar se modal fechou (indicativo de sucesso)
                try:
                    title_field = self.driver.find_element(By.ID, "title")
                    print("⚠️  Modal ainda aberto - possível erro")
                    
                    # Verificar se há mensagens de erro
                    error_messages = self.driver.find_elements(By.XPATH, "//*[contains(@class, 'error') or contains(@role, 'alert')]")
                    if error_messages:
                        for msg in error_messages:
                            if msg.text:
                                print(f"❌ Erro: {msg.text}")
                    
                    return False
                    
                except NoSuchElementException:
                    print("✅ Modal fechou - filme adicionado!")
                    return True
                
            else:
                print("❌ Botão de submit não encontrado")
                return False
            
        except Exception as e:
            print(f"❌ Erro geral: {e}")
            return False
    
    def run_minimal_test(self, email, password):
        """Teste mínimo"""
        print("🧪 TESTE MINIMALISTA - DIRECTOR'S CUT")
        print("="*50)
        
        try:
            if not self.login(email, password):
                return False
            
            time.sleep(3)
            
            success = self.add_minimal_movie()
            
            if success:
                print("\n✅ TESTE PASSOU!")
            else:
                print("\n❌ TESTE FALHOU!")
            
            time.sleep(5)
            return success
            
        except Exception as e:
            print(f"💥 ERRO: {e}")
            return False
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Limpeza"""
        print("🧹 Fechando...")
        self.driver.quit()

def main():
    """Principal"""
    print("🧪 DIRECTOR'S CUT - TESTE MINIMALISTA")
    print("🎯 Foca apenas no essencial")
    print("="*50)
    
    EMAIL = "guilherme7072@gmail.com"
    PASSWORD = "124910010"
    HEADLESS = False
    
    test = MinimalTest(headless=HEADLESS)
    success = test.run_minimal_test(EMAIL, PASSWORD)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()