#!/usr/bin/env python3
"""
Script de teste automatizado para a funcionalidade de adicionar filme no Director's Cut
Usa Selenium WebDriver para simular interações do usuário
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class DirectorsCutTest:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app", headless=False):
        """
        Inicializa o teste
        
        Args:
            base_url (str): URL base da aplicação (padrão: Vite dev server)
            headless (bool): Executar em modo headless (sem interface gráfica)
        """
        self.base_url = base_url
        self.wait_timeout = 10
        
        # Configurar opções do Chrome
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        # Inicializar o driver
        # Nota: Certifique-se de ter o ChromeDriver instalado ou use webdriver-manager
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, self.wait_timeout)
        
    def login(self, email="test@example.com", password="testpassword"):
        """
        Realiza o login na aplicação
        
        Args:
            email (str): Email para login
            password (str): Senha para login
        """
        print("🔐 Iniciando processo de login...")
        
        # Navegar para a página de autenticação
        self.driver.get(f"{self.base_url}/auth")
        
        # Aguardar a página carregar
        self.wait.until(EC.presence_of_element_located((By.ID, "email")))
        
        # Preencher campos de login
        email_field = self.driver.find_element(By.ID, "email")
        password_field = self.driver.find_element(By.ID, "password")
        
        email_field.clear()
        email_field.send_keys(email)
        
        password_field.clear()
        password_field.send_keys(password)
        
        # Clicar no botão de login usando o ID que adicionamos
        login_button = self.wait.until(
            EC.element_to_be_clickable((By.ID, "login-button"))
        )
        login_button.click()
        
        # Aguardar redirecionamento para o painel admin
        try:
            self.wait.until(EC.url_contains("/admin"))
            print("✅ Login realizado com sucesso!")
            return True
        except TimeoutException:
            print("❌ Falha no login - verifique as credenciais")
            return False
    
    def add_movie(self, movie_data):
        """
        Adiciona um novo filme
        
        Args:
            movie_data (dict): Dados do filme a ser adicionado
        """
        print("🎬 Iniciando processo de adicionar filme...")
        
        # Aguardar e clicar no botão "Adicionar Filme"
        add_movie_button = self.wait.until(
            EC.element_to_be_clickable((By.ID, "add-movie-button"))
        )
        add_movie_button.click()
        
        # Aguardar o modal abrir
        self.wait.until(EC.presence_of_element_located((By.ID, "title")))
        
        # Preencher título
        title_field = self.driver.find_element(By.ID, "title")
        title_field.clear()
        title_field.send_keys(movie_data.get("title", "Filme de Teste"))
        
        # Preencher diretor
        director_field = self.driver.find_element(By.ID, "director")
        director_field.clear()
        director_field.send_keys(movie_data.get("director", "Diretor de Teste"))
        
        # Selecionar ano (se fornecido)
        if movie_data.get("year"):
            year_dropdown = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='year-select']")
            year_dropdown.click()
            
            # Aguardar opções aparecerem e selecionar o ano
            year_option = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, f"//div[@role='option'][contains(text(), '{movie_data['year']}')]"))
            )
            year_option.click()
        
        # Selecionar duração (se fornecido)
        if movie_data.get("duration"):
            duration_dropdown = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='duration-select']")
            duration_dropdown.click()
            
            # Aguardar e selecionar duração
            duration_option = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, f"//div[@role='option'][contains(text(), '{movie_data['duration']}')]"))
            )
            duration_option.click()
        
        # Preencher URL da imagem (se fornecido)
        if movie_data.get("thumbnail"):
            thumbnail_field = self.driver.find_element(By.ID, "thumbnail")
            thumbnail_field.clear()
            thumbnail_field.send_keys(movie_data["thumbnail"])
        
        # Preencher URL do vídeo (se fornecido)
        if movie_data.get("video_url"):
            video_field = self.driver.find_element(By.ID, "videoUrl")
            video_field.clear()
            video_field.send_keys(movie_data["video_url"])
        
        # Preencher sinopse (se fornecido)
        if movie_data.get("synopsis"):
            synopsis_field = self.driver.find_element(By.ID, "synopsis")
            synopsis_field.clear()
            synopsis_field.send_keys(movie_data["synopsis"])
        
        # Submeter o formulário
        submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit'][contains(text(), 'Adicionar Filme')]")
        submit_button.click()
        
        # Aguardar o modal fechar (indicativo de sucesso)
        try:
            self.wait.until(EC.invisibility_of_element_located((By.ID, "title")))
            print("✅ Filme adicionado com sucesso!")
            return True
        except TimeoutException:
            print("❌ Falha ao adicionar filme - verifique os dados")
            return False
    
    def verify_movie_added(self, movie_title):
        """
        Verifica se o filme foi realmente adicionado à lista
        
        Args:
            movie_title (str): Título do filme para verificar
        """
        try:
            # Aguardar um pouco para a lista atualizar
            time.sleep(2)
            
            # Procurar pelo título do filme na página
            movie_card = self.driver.find_element(
                By.XPATH, f"//h3[contains(text(), '{movie_title}')]"
            )
            print(f"✅ Filme '{movie_title}' encontrado na lista!")
            return True
        except NoSuchElementException:
            print(f"❌ Filme '{movie_title}' não encontrado na lista!")
            return False
    
    def run_test(self):
        """
        Executa o teste completo
        """
        try:
            print("🚀 Iniciando teste de adicionar filme...")
            
            # Dados do filme de teste
            test_movie = {
                "title": "Filme de Teste Selenium",
                "director": "Diretor Selenium",
                "year": "2023",
                "duration": "90-120 min",
                "thumbnail": "https://via.placeholder.com/300x450?text=Teste",
                "video_url": "https://www.example.com/video.mp4",
                "synopsis": "Este é um filme de teste criado automaticamente pelo Selenium."
            }
            
            # Executar login
            if not self.login():
                return False
            
            # Aguardar um momento para garantir que a página carregou
            time.sleep(2)
            
            # Adicionar filme
            if not self.add_movie(test_movie):
                return False
            
            # Verificar se o filme foi adicionado
            if not self.verify_movie_added(test_movie["title"]):
                return False
            
            print("🎉 Teste concluído com sucesso!")
            return True
            
        except Exception as e:
            print(f"💥 Erro durante o teste: {str(e)}")
            return False
        
        finally:
            # Aguardar um momento para visualizar o resultado
            time.sleep(3)
            self.cleanup()
    
    def cleanup(self):
        """
        Limpa recursos e fecha o navegador
        """
        print("🧹 Limpando recursos...")
        self.driver.quit()

def main():
    """
    Função principal para executar o teste
    """
    # Configurações do teste
    BASE_URL = "https://preview--directors-cut.lovable.app"  # URL do site hospedado
    HEADLESS = False  # Defina como True para executar sem interface gráfica
    
    # Credenciais de teste - AJUSTE CONFORME SUAS CREDENCIAIS
    EMAIL = "admin@directorscut.com"
    PASSWORD = "suasenha123"
    
    print("=" * 50)
    print("TESTE AUTOMATIZADO - DIRECTOR'S CUT")
    print("Funcionalidade: Adicionar Filme")
    print("=" * 50)
    
    # Executar teste
    test = DirectorsCutTest(base_url=BASE_URL, headless=HEADLESS)
    
    # Sobrescrever credenciais se necessário
    success = test.run_test()
    
    if success:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        exit(0)
    else:
        print("\n❌ ALGUNS TESTES FALHARAM!")
        exit(1)

if __name__ == "__main__":
    main()