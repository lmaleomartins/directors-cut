#!/usr/bin/env python3
"""
🔧 SCRIPT DE DEBUG - Director's Cut
Versão para inspecionar dropdowns e entender a estrutura da página
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

class DebugTest:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app"):
        """Configuração para debug"""
        self.base_url = base_url
        self.wait_timeout = 15
        
        chrome_options = Options()
        chrome_options.add_argument("--window-size=1400,1000")
        chrome_options.add_argument("--start-maximized")
        
        # Usar ChromeDriver local se disponível
        if os.path.exists("chromedriver.exe"):
            service = Service("chromedriver.exe")
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            self.driver = webdriver.Chrome(options=chrome_options)
        
        self.wait = WebDriverWait(self.driver, self.wait_timeout)
        print("🔧 Modo DEBUG ativado!")
        
    def login_and_open_modal(self, email, password):
        """Login e abrir modal para inspeção"""
        print("🔐 Fazendo login...")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            time.sleep(2)
            
            # Login básico
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            password_field = self.driver.find_element(By.ID, "password")
            
            email_field.send_keys(email)
            password_field.send_keys(password)
            
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            
            self.wait.until(lambda driver: "/admin" in driver.current_url)
            print("✅ Login OK")
            
            time.sleep(3)
            
            # Abrir modal
            print("🎬 Abrindo modal...")
            add_button = self.wait.until(EC.element_to_be_clickable((By.ID, "add-movie-button")))
            add_button.click()
            
            time.sleep(2)
            print("✅ Modal aberto!")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro: {e}")
            return False
    
    def inspect_dropdowns(self):
        """Inspecionar estrutura dos dropdowns"""
        print("\n🔍 INSPECIONANDO DROPDOWNS...")
        print("="*50)
        
        try:
            # Aguardar modal carregar
            self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            
            # Encontrar todos os elementos que podem ser dropdowns
            potential_dropdowns = [
                "//button[@role='combobox']",
                "//div[contains(@class, 'select')]//button", 
                "//*[contains(@class, 'SelectTrigger')]",
                "//button[contains(@class, 'SelectTrigger')]"
            ]
            
            all_dropdowns = []
            
            for selector in potential_dropdowns:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    all_dropdowns.extend(elements)
                except:
                    continue
            
            # Remover duplicatas
            unique_dropdowns = []
            for dropdown in all_dropdowns:
                if dropdown not in unique_dropdowns:
                    unique_dropdowns.append(dropdown)
            
            print(f"📊 Encontrados {len(unique_dropdowns)} dropdowns")
            
            # Inspecionar cada dropdown
            for i, dropdown in enumerate(unique_dropdowns):
                print(f"\n🔍 DROPDOWN {i+1}:")
                try:
                    # Informações do elemento
                    tag_name = dropdown.tag_name
                    class_attr = dropdown.get_attribute("class") or "N/A"
                    role_attr = dropdown.get_attribute("role") or "N/A"
                    aria_label = dropdown.get_attribute("aria-label") or "N/A"
                    text_content = dropdown.text or "N/A"
                    
                    print(f"   Tag: {tag_name}")
                    print(f"   Classes: {class_attr}")
                    print(f"   Role: {role_attr}")
                    print(f"   Aria-label: {aria_label}")
                    print(f"   Texto: '{text_content}'")
                    
                    # Tentar encontrar label anterior
                    try:
                        parent = dropdown.find_element(By.XPATH, "./..")
                        label = parent.find_element(By.XPATH, ".//label")
                        print(f"   Label: '{label.text}'")
                    except:
                        print(f"   Label: N/A")
                    
                    # Teste de clique (apenas no primeiro para não bagunçar)
                    if i == 0:
                        print(f"   🧪 Testando clique...")
                        try:
                            dropdown.click()
                            time.sleep(1)
                            
                            # Procurar opções que aparecem
                            options = self.driver.find_elements(By.XPATH, "//div[@role='option']")
                            print(f"   📋 Opções encontradas: {len(options)}")
                            
                            for j, option in enumerate(options[:5]):  # Mostrar só as 5 primeiras
                                print(f"      {j+1}. '{option.text}'")
                            
                            if options:
                                print(f"      ... (total: {len(options)} opções)")
                            
                            # Clicar fora para fechar
                            self.driver.find_element(By.TAG_NAME, "body").click()
                            time.sleep(1)
                            
                        except Exception as e:
                            print(f"   ❌ Erro ao testar: {e}")
                    
                except Exception as e:
                    print(f"   ❌ Erro ao inspecionar dropdown {i+1}: {e}")
            
            print(f"\n" + "="*50)
            print("🔍 INSPEÇÃO COMPLETA!")
            
            # Aguardar para o usuário ver
            print("\n⏳ Aguardando 30 segundos para inspeção manual...")
            print("   Use este tempo para inspecionar elementos no DevTools")
            time.sleep(30)
            
        except Exception as e:
            print(f"❌ Erro na inspeção: {e}")
            
    def test_specific_selectors(self):
        """Testar seletores específicos"""
        print("\n🎯 TESTANDO SELETORES ESPECÍFICOS...")
        
        selectors_to_test = [
            # Para o campo Ano
            ("Ano - Label", "//label[contains(text(), 'Ano')]"),
            ("Ano - Combobox por label", "//label[contains(text(), 'Ano')]/following-sibling::*//button[@role='combobox']"),
            ("Ano - SelectTrigger", "//label[contains(text(), 'Ano')]/..//button[contains(@class, 'SelectTrigger')]"),
            
            # Para Duração  
            ("Duração - Label", "//label[contains(text(), 'Duração')]"),
            ("Duração - Combobox por label", "//label[contains(text(), 'Duração')]/following-sibling::*//button[@role='combobox']"),
            ("Duração - SelectTrigger", "//label[contains(text(), 'Duração')]/..//button[contains(@class, 'SelectTrigger')]"),
            
            # Para Gênero
            ("Gênero - Label", "//label[contains(text(), 'Gênero')]"),
            ("Gênero - Combobox por label", "//label[contains(text(), 'Gênero')]/following-sibling::*//button[@role='combobox']"),
            ("Gênero - SelectTrigger", "//label[contains(text(), 'Gênero')]/..//button[contains(@class, 'SelectTrigger')]"),
            
            # Seletores genéricos
            ("Todos combobox", "//button[@role='combobox']"),
            ("Grid cols-3", "//div[contains(@class, 'grid-cols-3')]"),
        ]
        
        for name, selector in selectors_to_test:
            try:
                elements = self.driver.find_elements(By.XPATH, selector)
                print(f"✅ {name}: {len(elements)} elemento(s) encontrado(s)")
                
                if elements:
                    element = elements[0]
                    print(f"   Texto: '{element.text}'")
                    print(f"   Classes: {element.get_attribute('class')}")
                    
            except Exception as e:
                print(f"❌ {name}: Erro - {e}")
    
    def run_debug(self, email, password):
        """Executar debug completo"""
        try:
            print("🔧 INICIANDO DEBUG DO FORMULÁRIO")
            print("="*50)
            
            if not self.login_and_open_modal(email, password):
                return False
            
            self.inspect_dropdowns()
            self.test_specific_selectors()
            
            print("\n✅ DEBUG CONCLUÍDO!")
            return True
            
        except Exception as e:
            print(f"💥 ERRO NO DEBUG: {e}")
            return False
        
        finally:
            print("\n🧹 Fechando em 10 segundos...")
            time.sleep(10)
            self.cleanup()
    
    def cleanup(self):
        """Limpar recursos"""
        self.driver.quit()

def main():
    """Debug principal"""
    print("🔧 DIRECTOR'S CUT - DEBUG DE DROPDOWNS")
    print("="*50)
    
    EMAIL = "guilherme7072@gmail.com"  
    PASSWORD = "124910010"
    
    debug = DebugTest()
    debug.run_debug(EMAIL, PASSWORD)

if __name__ == "__main__":
    main()