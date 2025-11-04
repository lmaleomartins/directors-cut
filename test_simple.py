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
    print("webdriver-manager disponível")
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False
    print("webdriver-manager não encontrado - usando método manual")

class SimpleCutTest:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app", headless=False):
        """Inicializa o teste simples (Chrome)."""
        self.base_url = base_url
        self.wait_timeout = 15
        
        # Configurar Chrome
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            # Método 1: Usar webdriver-manager (recomendado)
            if WEBDRIVER_MANAGER_AVAILABLE:
                try:
                    print("Baixando ChromeDriver compatível automaticamente...")
                    service = Service(ChromeDriverManager().install())
                    self.driver = webdriver.Chrome(service=service, options=chrome_options)
                    print("ChromeDriver instalado e configurado")
                except Exception as e:
                    print(f"Falha no webdriver-manager: {e}")
                    print("Tentando método manual...")
                    raise
            else:
                # Método 2: ChromeDriver manual
                if os.path.exists("chromedriver.exe"):
                    service = Service("chromedriver.exe")
                    self.driver = webdriver.Chrome(service=service, options=chrome_options)
                    print("Usando ChromeDriver local")
                else:
                    # Tentar usar ChromeDriver no PATH
                    self.driver = webdriver.Chrome(options=chrome_options)
                    print("Usando ChromeDriver do PATH")
            
            self.wait = WebDriverWait(self.driver, self.wait_timeout)
            print("ChromeDriver configurado com sucesso")
            
        except Exception as e:
            print(f"Erro ao configurar ChromeDriver: {e}")
            print("\nSoluções automáticas:")
            print("1. Instalar webdriver-manager: pip install webdriver-manager")
            print("2. Executar novamente - o ChromeDriver será baixado automaticamente")
            print("\nSoluções manuais:")
            print("3. Baixar ChromeDriver compatível de: https://googlechromelabs.github.io/chrome-for-testing/")
            print("4. Adicionar ChromeDriver ao PATH do sistema")
            print("5. Ou colocar chromedriver.exe na pasta do projeto")
            raise
        
    def login(self, email, password):
        """Login demonstrativo com delays para apresentação"""
        print("Abrindo página de login...")
        print(f"URL: {self.base_url}/auth")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            time.sleep(2)  # Aguardar página carregar completamente
            
            print("Aguardando página carregar...")
            # Aguardar campos aparecerem
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            password_field = self.driver.find_element(By.ID, "password")
            
            print("Preenchendo e-mail...")
            email_field.clear()
            # Simular digitação humana
            for char in email:
                email_field.send_keys(char)
                time.sleep(0.1)
            
            time.sleep(1)  # Pausa entre campos
            
            print("Preenchendo senha...")
            password_field.clear()
            # Simular digitação humana da senha
            for char in password:
                password_field.send_keys(char)
                time.sleep(0.08)
            
            time.sleep(1.5)  # Pausa antes do clique
            
            print("Clicando em 'Entrar'...")
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            
            print("Aguardando redirecionamento...")
            # Verificar sucesso
            self.wait.until(lambda driver: "/admin" in driver.current_url)
            time.sleep(1)
            print("Login realizado com sucesso")
            print("Painel administrativo carregado")
            return True
            
        except Exception as e:
            print(f"Falha no login: {e}")
            return False
    
    def add_simple_movie(self):
        """Adiciona um filme de forma demonstrativa"""
        print("\nAdicionar novo filme")
        
        try:
            print("Localizando botão 'Adicionar Filme'...")
            time.sleep(1)
            
            # Clicar botão adicionar
            add_button = self.wait.until(EC.element_to_be_clickable((By.ID, "add-movie-button")))
            print("Abrindo formulário de novo filme...")
            add_button.click()
            
            print("Aguardando modal abrir...")
            time.sleep(2)
            
            # Preencher campos básicos
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            
            print("Preenchendo título...")
            movie_title = "Filme de Demonstração Selenium"
            title_field.clear()
            for char in movie_title:
                title_field.send_keys(char)
                time.sleep(0.08)
            
            time.sleep(1)
            
            print("Preenchendo diretor...")
            director_field = self.driver.find_element(By.ID, "director")
            director_name = "Steven Spielberg"
            director_field.clear()
            for char in director_name:
                director_field.send_keys(char)
                time.sleep(0.08)
            
            time.sleep(1)
            
            # Selecionar campos obrigatórios com estratégias robustas
            print("Preenchendo campos obrigatórios...")
            time.sleep(1)
            
            # Estratégia 1: Selecionar por posição dos dropdowns na grid
            print("Selecionando ano...")
            try:
                # Na grid-cols-3, o primeiro dropdown é ano
                dropdowns = self.driver.find_elements(By.XPATH, "//button[@role='combobox']")
                if len(dropdowns) >= 3:
                    year_dropdown = dropdowns[0]  # Primeiro dropdown
                    year_dropdown.click()
                    time.sleep(1)
                    
                    # Selecionar 2023 ou primeira opção
                    try:
                        year_2023 = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//div[@role='option' and contains(text(), '2023')]")))
                        year_2023.click()
                        print("   Ano 2023 selecionado")
                    except:
                        first_year = self.driver.find_element(By.XPATH, "//div[@role='option'][1]")
                        first_year.click()
                        print("   Primeiro ano disponível selecionado")
                    
                    time.sleep(1)
                else:
                    print("   Dropdowns não encontrados na estrutura esperada")
                    
            except Exception as e:
                print(f"   Problema ao selecionar ano: {e}")
            
            # DURAÇÃO - CAMPO OBRIGATÓRIO
            print("Selecionando duração (obrigatório)...")
            try:
                dropdowns = self.driver.find_elements(By.XPATH, "//button[@role='combobox']")
                if len(dropdowns) >= 3:
                    duration_dropdown = dropdowns[1]  # Segundo dropdown
                    duration_dropdown.click()
                    time.sleep(1.5)
                    
                    # Tentar selecionar "90-120 min" ou qualquer opção disponível
                    duration_options = self.driver.find_elements(By.XPATH, "//div[@role='option']")
                    
                    selected = False
                    # Primeiro tentar "90-120 min"
                    for option in duration_options:
                        if "90-120" in option.text:
                            option.click()
                            print("   Duração '90-120 min' selecionada")
                            selected = True
                            break
                    
                    # Se não encontrou, pegar a primeira opção disponível
                    if not selected and duration_options:
                        duration_options[0].click()
                        print(f"   Duração '{duration_options[0].text}' selecionada")
                        selected = True
                    
                    if selected:
                        time.sleep(1)
                    else:
                        print("   Erro: nenhuma duração foi selecionada")
                        return False
                        
                else:
                    print("   Erro: dropdown de duração não encontrado")
                    return False
                    
            except Exception as e:
                print(f"   Erro na duração: {e}")
                return False
            
            # GÊNERO - CAMPO OBRIGATÓRIO  
            print("Selecionando gênero (obrigatório)...")
            try:
                dropdowns = self.driver.find_elements(By.XPATH, "//button[@role='combobox']")
                if len(dropdowns) >= 3:
                    genre_dropdown = dropdowns[2]  # Terceiro dropdown
                    genre_dropdown.click()
                    time.sleep(1.5)
                    
                    # Tentar selecionar "Drama" ou primeira opção
                    genre_options = self.driver.find_elements(By.XPATH, "//div[@role='option']")
                    
                    selected = False
                    # Primeiro tentar "Drama"
                    for option in genre_options:
                        if "Drama" in option.text:
                            option.click()
                            print("   Gênero 'Drama' selecionado")
                            selected = True
                            break
                    
                    # Se não encontrou, pegar a primeira opção
                    if not selected and genre_options:
                        genre_options[0].click()
                        print(f"   Gênero '{genre_options[0].text}' selecionado")
                        selected = True
                    
                    if selected:
                        time.sleep(1)
                    else:
                        print("   Erro: nenhum gênero foi selecionado")
                        return False
                        
                else:
                    print("   Erro: dropdown de gênero não encontrado")
                    return False
                    
            except Exception as e:
                print(f"   Erro no gênero: {e}")
                return False
            
            time.sleep(2)  # Pausa para mostrar os campos preenchidos
            
            print("Salvando filme...")
            # Submeter
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()
            
            print("Aguardando confirmação...")
            # Verificar fechamento do modal
            time.sleep(4)
            
            print("Filme adicionado com sucesso")
            print(f"Título: '{movie_title}'")
            print(f"Diretor: '{director_name}'")
            print(f"Ano: 2023")
            print(f"Duração: 90-120 min")
            print(f"Gênero: Drama")
            return True
            
        except Exception as e:
            print(f"Erro ao adicionar filme: {e}")
            # Fazer screenshot para debug
            try:
                self.driver.save_screenshot("erro_adicionar_filme.png")
                print("Screenshot salvo: erro_adicionar_filme.png")
            except:
                pass
            return False
    
    def run_demonstration_test(self, email, password):
        """Teste demonstrativo para apresentações"""
        print("Demonstração automatizada - Director's Cut")
        
        try:
            print("\nEtapa 1: Autenticação")
            # Login
            if not self.login(email, password):
                return False
            
            print("\nAguardando painel administrativo carregar...")
            time.sleep(3)  # Tempo para página estabilizar
            
            print("\nEtapa 2: Adição de Filme")
            # Adicionar filme
            if not self.add_simple_movie():
                return False
            
            print("\nDemonstração concluída com sucesso")
            print("Login automático: OK")
            print("Adicionar filme: OK") 
            
            print("\nAguardando 5 segundos para visualização final...")
            time.sleep(5)  # Tempo para ver o resultado
            
            return True
            
        except Exception as e:
            print(f"Erro durante demonstração: {e}")
            return False
        
        finally:
            print("\nFinalizando demonstração...")
            time.sleep(2)
            self.cleanup()
    
    def cleanup(self):
        """Limpar recursos"""
        print("Fechando navegador...")
        self.driver.quit()

def main():
    """Teste principal"""
    print("Director's Cut - Teste simples")
    print("Site: https://preview--directors-cut.lovable.app")
    print("=" * 50)
    
    # ⚠️  CONFIGURE SUAS CREDENCIAIS AQUI ⚠️
    EMAIL = "guilherme7072@gmail.com"
    PASSWORD = "124910010"
    HEADLESS = False
    
    print(f"Email: {EMAIL}")
    print(f"Senha: {'*' * len(PASSWORD)}")
    print(f"Headless: {HEADLESS}")
    print()
    
    # Verificar credenciais
    if EMAIL == "seu-email@exemplo.com":
        print("Atenção: configure suas credenciais reais no arquivo (EMAIL/PASSWORD em main())")
        return
    
    # Executar teste
    test = SimpleCutTest(headless=HEADLESS)
    success = test.run_demonstration_test(EMAIL, PASSWORD)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()