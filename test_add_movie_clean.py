#!/usr/bin/env python3
"""
Teste automatizado para adição de filmes - Director's Cut
Autor: Leonardo Martins
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class MovieTest:
    def __init__(self, headless=False):
        self.base_url = "https://preview--directors-cut.lovable.app"
        self.wait_timeout = 15
        
        # Configurar Chrome
        options = Options()
        if headless:
            options.add_argument("--headless")
        options.add_argument("--window-size=1400,1000")
        
        # Usar ChromeDriver local se disponível
        try:
            service = Service("chromedriver.exe")
            self.driver = webdriver.Chrome(service=service, options=options)
        except:
            self.driver = webdriver.Chrome(options=options)
        
        self.wait = WebDriverWait(self.driver, self.wait_timeout)
    
    def login(self, email, password):
        """Realiza login no sistema"""
        print("Fazendo login...")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            time.sleep(2)
            
            # Preencher credenciais
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            password_field = self.driver.find_element(By.ID, "password")
            
            email_field.send_keys(email)
            password_field.send_keys(password)
            
            # Fazer login
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            
            # Aguardar redirecionamento
            self.wait.until(lambda driver: "/admin" in driver.current_url)
            print("Login realizado com sucesso")
            return True
            
        except Exception as e:
            print(f"Erro no login: {e}")
            return False
    
    def select_dropdown_option(self, dropdown_index, option_text, field_name):
        """Seleciona opção em dropdown usando JavaScript"""
        print(f"Configurando {field_name}...")
        
        js_script = f"""
        try {{
            const dropdowns = document.querySelectorAll('button[role="combobox"]');
            if (dropdowns.length <= {dropdown_index}) {{
                throw new Error('Dropdown não encontrado');
            }}
            
            const dropdown = dropdowns[{dropdown_index}];
            dropdown.click();
            
            // Aguardar opções aparecerem
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const options = document.querySelectorAll('div[role="option"]');
            if (options.length === 0) {{
                throw new Error('Nenhuma opção encontrada');
            }}
            
            // Procurar opção específica ou usar primeira disponível
            let selectedOption = null;
            const searchText = '{option_text}'.toLowerCase();
            
            for (let option of options) {{
                if (option.textContent.toLowerCase().includes(searchText)) {{
                    selectedOption = option;
                    break;
                }}
            }}
            
            if (!selectedOption) {{
                selectedOption = options[0];
            }}
            
            selectedOption.click();
            
            return {{
                success: true,
                selected: selectedOption.textContent,
                total: options.length
            }};
            
        }} catch (error) {{
            return {{
                success: false,
                error: error.message
            }};
        }}
        """
        
        try:
            result = self.driver.execute_async_script(f"""
                const callback = arguments[arguments.length - 1];
                (async () => {{{js_script}}})().then(callback).catch(err => callback({{success: false, error: err.message}}));
            """)
            
            if result.get('success'):
                print(f"  {field_name}: {result['selected']}")
                return True
            else:
                print(f"  Erro em {field_name}: {result.get('error', 'Desconhecido')}")
                return False
                
        except Exception as e:
            print(f"  Erro JavaScript em {field_name}: {e}")
            return False
    
    def add_movie(self):
        """Adiciona um novo filme ao sistema"""
        print("Adicionando novo filme...")
        
        try:
            # Abrir modal de adição
            add_button = self.wait.until(EC.element_to_be_clickable((By.ID, "add-movie-button")))
            add_button.click()
            time.sleep(2)
            
            # Aguardar modal carregar
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            time.sleep(1)
            
            # Preencher campos básicos
            print("Preenchendo informações básicas...")
            
            movie_title = "Teste Automatizado"
            title_field.send_keys(movie_title)
            
            director_field = self.driver.find_element(By.ID, "director")
            director_field.send_keys("Diretor Teste")
            
            time.sleep(1)
            
            # Configurar dropdowns obrigatórios
            print("Configurando campos obrigatórios...")
            
            # Ano (dropdown 0)
            self.select_dropdown_option(0, "2023", "Ano")
            time.sleep(1)
            
            # Duração (dropdown 1) - obrigatório
            duration_ok = self.select_dropdown_option(1, "90-120", "Duração")
            if not duration_ok:
                print("Tentando qualquer duração disponível...")
                duration_ok = self.select_dropdown_option(1, "", "Duração")
                if not duration_ok:
                    print("ERRO: Não foi possível selecionar duração")
                    return False
            
            time.sleep(1)
            
            # Gênero (dropdown 2)
            self.select_dropdown_option(2, "Drama", "Gênero")
            time.sleep(1)
            
            # Submeter formulário
            print("Salvando filme...")
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()
            
            # Aguardar processamento
            time.sleep(3)
            
            # Verificar se o modal fechou (indicativo de sucesso)
            try:
                self.driver.find_element(By.ID, "title")
                print("Modal ainda aberto - possível erro de validação")
                return False
            except NoSuchElementException:
                print(f"Sucesso! Filme '{movie_title}' adicionado ao catálogo")
                return True
            
        except Exception as e:
            print(f"Erro ao adicionar filme: {e}")
            return False
    
    def run_test(self, email, password):
        """Executa o teste completo"""
        print("=== Teste Automatizado - Director's Cut ===")
        print(f"Site: {self.base_url}")
        print(f"Email: {email}")
        print()
        
        start_time = time.time()
        
        try:
            # Fazer login
            if not self.login(email, password):
                return False
            
            time.sleep(2)
            
            # Adicionar filme
            success = self.add_movie()
            
            # Resultado
            elapsed = time.time() - start_time
            print()
            print("=== Resultado ===")
            if success:
                print("Status: SUCESSO")
                print("Filme adicionado com êxito")
            else:
                print("Status: FALHA")
                print("Verificar logs acima")
            
            print(f"Tempo total: {elapsed:.1f}s")
            
            # Aguardar um pouco para visualização
            time.sleep(3)
            return success
            
        except Exception as e:
            print(f"Erro geral: {e}")
            return False
        
        finally:
            print("Encerrando teste...")
            self.driver.quit()

def main():
    """Função principal"""
    # Configurações
    EMAIL = "guilherme7072@gmail.com"
    PASSWORD = "124910010"
    HEADLESS = False
    
    # Executar teste
    test = MovieTest(headless=HEADLESS)
    success = test.run_test(EMAIL, PASSWORD)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()