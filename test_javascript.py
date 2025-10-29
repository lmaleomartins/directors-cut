#!/usr/bin/env python3
"""
🔥 TESTE COM JAVASCRIPT - Director's Cut  
Usa JavaScript para contornar problemas de stale elements
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

try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False

class JavaScriptTest:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app", headless=False):
        """Teste usando JavaScript direto"""
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
    
    def type_slowly(self, element, text, delay=0.1):
        """Digitação cinematográfica"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(delay)
    
    def login(self, email, password):
        """Login padrão"""
        print("🔐 Fazendo login...")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            time.sleep(2)
            
            print("   📧 Email...")
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            self.type_slowly(email_field, email, 0.08)
            
            print("   🔑 Senha...")
            password_field = self.driver.find_element(By.ID, "password")
            self.type_slowly(password_field, password, 0.06)
            
            print("   🚀 Entrando...")
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            
            self.wait.until(lambda driver: "/admin" in driver.current_url)
            print("✅ Login OK!")
            return True
            
        except Exception as e:
            print(f"❌ Erro no login: {e}")
            return False
    
    def select_dropdown_with_js(self, dropdown_index, option_text, description):
        """Selecionar dropdown usando JavaScript puro"""
        print(f"   🎯 {description}...")
        
        try:
            # Script JavaScript para selecionar dropdown
            js_script = f"""
            // Função para aguardar elemento
            function waitForElement(selector, timeout = 5000) {{
                return new Promise((resolve, reject) => {{
                    const startTime = Date.now();
                    function check() {{
                        const element = document.querySelector(selector);
                        if (element) {{
                            resolve(element);
                        }} else if (Date.now() - startTime > timeout) {{
                            reject(new Error('Timeout waiting for element'));
                        }} else {{
                            setTimeout(check, 100);
                        }}
                    }}
                    check();
                }});
            }}
            
            // Selecionar dropdown por índice
            try {{
                const dropdowns = document.querySelectorAll('button[role="combobox"]');
                console.log(`Encontrados ${{dropdowns.length}} dropdowns`);
                
                if (dropdowns.length <= {dropdown_index}) {{
                    throw new Error(`Dropdown índice {dropdown_index} não encontrado`);
                }}
                
                const dropdown = dropdowns[{dropdown_index}];
                console.log(`Clicando no dropdown {dropdown_index + 1}`);
                
                // Clicar no dropdown
                dropdown.click();
                
                // Aguardar opções aparecerem
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const options = document.querySelectorAll('div[role="option"]');
                console.log(`Encontradas ${{options.length}} opções`);
                
                if (options.length === 0) {{
                    throw new Error('Nenhuma opção encontrada');
                }}
                
                // Procurar opção específica
                let selectedOption = null;
                const searchText = '{option_text}'.toLowerCase();
                
                for (let option of options) {{
                    if (option.textContent.toLowerCase().includes(searchText)) {{
                        selectedOption = option;
                        break;
                    }}
                }}
                
                // Se não encontrou, usar primeira opção
                if (!selectedOption) {{
                    selectedOption = options[0];
                }}
                
                console.log(`Selecionando: ${{selectedOption.textContent}}`);
                selectedOption.click();
                
                // Aguardar dropdown fechar
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return {{
                    success: true,
                    selected: selectedOption.textContent,
                    totalOptions: options.length
                }};
                
            }} catch (error) {{
                console.error('Erro no JavaScript:', error);
                return {{
                    success: false,
                    error: error.message
                }};
            }}
            """
            
            # Executar JavaScript
            result = self.driver.execute_async_script(f"""
                const callback = arguments[arguments.length - 1];
                (async () => {{
                    {js_script}
                }})().then(callback).catch(err => callback({{success: false, error: err.message}}));
            """)
            
            if result.get('success'):
                print(f"      ✅ {result['selected']} ({result['totalOptions']} opções)")
                return True
            else:
                print(f"      ❌ Erro: {result.get('error', 'Erro desconhecido')}")
                return False
            
        except Exception as e:
            print(f"      ❌ Erro JavaScript: {e}")
            return False
    
    def add_movie_with_js(self):
        """Adicionar filme usando JavaScript para dropdowns"""
        print("\n🎬 Adicionando filme com JavaScript...")
        
        try:
            # Abrir modal
            print("🔘 Abrindo modal...")
            add_button = self.wait.until(EC.element_to_be_clickable((By.ID, "add-movie-button")))
            add_button.click()
            time.sleep(2)
            
            # Aguardar modal
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            time.sleep(1)
            
            # Campos básicos
            print("📝 Preenchendo campos básicos...")
            
            movie_title = "JavaScript Automation"
            print(f"   🎬 Título: {movie_title}")
            self.type_slowly(title_field, movie_title, 0.08)
            
            time.sleep(1)
            
            director_name = "Ada Lovelace" 
            print(f"   🎭 Diretor: {director_name}")
            director_field = self.driver.find_element(By.ID, "director")
            self.type_slowly(director_field, director_name, 0.08)
            
            time.sleep(1.5)
            
            # Dropdowns com JavaScript
            print("🎯 Configurando dropdowns com JavaScript...")
            
            # Ano (índice 0)
            self.select_dropdown_with_js(0, "2023", "Ano")
            time.sleep(1)
            
            # Duração (índice 1) - OBRIGATÓRIO
            success = self.select_dropdown_with_js(1, "90-120", "Duração (OBRIGATÓRIO)")
            if not success:
                print("❌ CRÍTICO: Duração não selecionada!")
                # Tentar qualquer opção
                print("   🔄 Tentando qualquer duração...")
                success = self.select_dropdown_with_js(1, "", "Duração (qualquer opção)")
                if not success:
                    return False
            
            time.sleep(1)
            
            # Gênero (índice 2) 
            self.select_dropdown_with_js(2, "Drama", "Gênero")
            time.sleep(1.5)
            
            # Submeter
            print("💾 Submetendo formulário...")
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()
            
            print("⏳ Aguardando processamento...")
            time.sleep(4)
            
            # Verificar resultado
            try:
                self.driver.find_element(By.ID, "title")
                print("⚠️  Modal ainda aberto - possível erro de validação")
                
                # Verificar erros via JavaScript
                js_check_errors = """
                const errors = [];
                
                // Procurar elementos de erro comuns
                const errorSelectors = [
                    '[role="alert"]',
                    '.error',
                    '[data-state="error"]',
                    '.text-red-500',
                    '.text-destructive'
                ];
                
                errorSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        if (el.textContent.trim()) {
                            errors.push(el.textContent.trim());
                        }
                    });
                });
                
                return errors;
                """
                
                errors = self.driver.execute_script(js_check_errors)
                if errors:
                    print("❌ Erros encontrados:")
                    for error in errors:
                        print(f"   - {error}")
                
                return False
                
            except NoSuchElementException:
                print("✅ SUCESSO! Modal fechou - filme adicionado!")
                print(f"   🎬 {movie_title}")
                print(f"   🎭 {director_name}")
                return True
            
        except Exception as e:
            print(f"❌ Erro geral: {e}")
            return False
    
    def run_js_test(self, email, password):
        """Executar teste JavaScript completo"""
        print("🔥 TESTE JavaScript - DIRECTOR'S CUT")
        print("="*50)
        print("🚀 Usa JavaScript para evitar problemas de elementos")
        print("🎯 Foco em robustez e demonstração visual")
        print("="*50)
        
        start_time = time.time()
        
        try:
            # Login
            if not self.login(email, password):
                return False
            
            time.sleep(3)
            
            # Adicionar filme
            success = self.add_movie_with_js()
            
            # Resultado final
            elapsed = time.time() - start_time
            
            print(f"\n" + "="*50)
            if success:
                print("🎉 TESTE JAVASCRIPT - SUCESSO TOTAL!")
                print("✨ Automação com JavaScript funcionou!")
                print("🎯 Filme adicionado ao catálogo!")
            else:
                print("⚠️  TESTE JAVASCRIPT - SUCESSO PARCIAL")
                print("🔍 Verificar detalhes da validação acima")
            
            print(f"⏱️  Tempo: {elapsed:.1f}s")
            print("🔥 Tecnologia: Selenium + JavaScript")
            print("="*50)
            
            # Aguardar visualização
            time.sleep(8)
            return success
            
        except Exception as e:
            print(f"💥 ERRO: {e}")
            return False
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Finalização"""
        print("\n🧹 Finalizando teste JavaScript...")
        self.driver.quit()
        print("✅ Concluído!")

def main():
    """Principal"""
    print("🔥 DIRECTOR'S CUT - TESTE JAVASCRIPT")
    print("🎯 Solução robusta para demonstrações")
    print("="*50)
    
    EMAIL = "guilherme7072@gmail.com"
    PASSWORD = "124910010"
    HEADLESS = False
    
    print(f"👤 Email: {EMAIL}")
    print(f"🌐 URL: https://preview--directors-cut.lovable.app")
    print(f"💻 Modo: Visual (headless={HEADLESS})")
    print()
    
    test = JavaScriptTest(headless=HEADLESS)
    success = test.run_js_test(EMAIL, PASSWORD)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()