#!/usr/bin/env python3
"""
Script de teste automatizado MELHORADO para Director's Cut
Usa webdriver-manager para configuração automática do ChromeDriver
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

class DirectorsCutAdvancedTest:
    def __init__(self, base_url="https://preview--directors-cut.lovable.app", headless=False):
        """
        Inicializa o teste com configuração automática do WebDriver
        """
        self.base_url = base_url
        self.wait_timeout = 15
        
        # Configurar opções do Chrome
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")
        
        # Usar webdriver-manager para instalar automaticamente o ChromeDriver
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, self.wait_timeout)
        
        print("🚗 WebDriver configurado automaticamente!")
        
    def login(self, email, password):
        """
        Realiza o login na aplicação com validações robustas
        """
        print(f"🔐 Fazendo login com: {email}")
        
        try:
            # Navegar para a página de autenticação
            self.driver.get(f"{self.base_url}/auth")
            print(f"📱 Navegando para: {self.base_url}/auth")
            
            # Aguardar a página carregar completamente
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Aguardar especificamente pelos campos de login
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            password_field = self.wait.until(EC.presence_of_element_located((By.ID, "password")))
            
            # Preencher email
            email_field.clear()
            email_field.send_keys(email)
            print(f"✉️  Email preenchido: {email}")
            
            # Preencher senha
            password_field.clear()
            password_field.send_keys(password)
            print("🔑 Senha preenchida")
            
            # Aguardar e clicar no botão de login
            login_button = self.wait.until(
                EC.element_to_be_clickable((By.ID, "login-button"))
            )
            
            print("🔘 Clicando no botão de login...")
            login_button.click()
            
            # Aguardar redirecionamento (pode ser para /admin ou mostrar erro)
            try:
                # Aguardar até que a URL mude para admin OU apareça uma mensagem de erro
                self.wait.until(
                    lambda driver: "/admin" in driver.current_url or 
                    len(driver.find_elements(By.CSS_SELECTOR, "[role='alert'], .toast, .error")) > 0
                )
                
                if "/admin" in self.driver.current_url:
                    print("✅ Login realizado com sucesso!")
                    return True
                else:
                    print("❌ Falha no login - verifique as credenciais")
                    return False
                    
            except TimeoutException:
                print("⏱️  Timeout no login - verifique se a aplicação está funcionando")
                return False
                
        except Exception as e:
            print(f"💥 Erro durante login: {str(e)}")
            return False
    
    def wait_for_admin_page(self):
        """
        Aguarda a página admin carregar completamente
        """
        try:
            # Aguardar elementos específicos da página admin
            self.wait.until(EC.presence_of_element_located((By.TEXT, "Admin Panel")))
            self.wait.until(EC.presence_of_element_located((By.ID, "add-movie-button")))
            print("📊 Página admin carregada!")
            return True
        except TimeoutException:
            print("⏱️  Timeout aguardando página admin")
            return False
    
    def add_movie(self, movie_data):
        """
        Adiciona um filme com validações robustas
        """
        print(f"🎬 Adicionando filme: {movie_data.get('title')}")
        
        try:
            # Aguardar e clicar no botão "Adicionar Filme"
            add_button = self.wait.until(
                EC.element_to_be_clickable((By.ID, "add-movie-button"))
            )
            print("🔘 Clicando em 'Adicionar Filme'...")
            add_button.click()
            
            # Aguardar o modal/dialog abrir
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            print("📝 Modal de adicionar filme aberto!")
            
            # Preencher título
            title_field.clear()
            title_field.send_keys(movie_data.get("title", ""))
            print(f"🏷️  Título: {movie_data.get('title')}")
            
            # Preencher diretor
            director_field = self.driver.find_element(By.ID, "director")
            director_field.clear()
            director_field.send_keys(movie_data.get("director", ""))
            print(f"🎭 Diretor: {movie_data.get('director')}")
            
            # Selecionar ano usando Select (se for um dropdown tradicional)
            if movie_data.get("year"):
                try:
                    # Primeiro tenta clicar no select customizado
                    year_trigger = self.driver.find_element(By.CSS_SELECTOR, "[role='combobox'][aria-label*='ano' i]")
                    year_trigger.click()
                    
                    # Aguardar e selecionar o ano
                    time.sleep(1)
                    year_option = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, f"//div[@role='option' and contains(text(), '{movie_data['year']}')]"))
                    )
                    year_option.click()
                    print(f"📅 Ano selecionado: {movie_data['year']}")
                except:
                    print("⚠️  Não foi possível selecionar o ano")
            
            # Selecionar duração
            if movie_data.get("duration"):
                try:
                    duration_trigger = self.driver.find_element(By.CSS_SELECTOR, "[role='combobox'][aria-label*='duração' i]")
                    duration_trigger.click()
                    
                    time.sleep(1)
                    duration_option = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, f"//div[@role='option' and contains(text(), '{movie_data['duration']}')]"))
                    )
                    duration_option.click()
                    print(f"⏱️  Duração selecionada: {movie_data['duration']}")
                except:
                    print("⚠️  Não foi possível selecionar a duração")
            
            # Adicionar gêneros
            if movie_data.get("genres"):
                try:
                    for genre in movie_data["genres"]:
                        genre_trigger = self.driver.find_element(By.CSS_SELECTOR, "[role='combobox'][aria-label*='gênero' i]")
                        genre_trigger.click()
                        
                        time.sleep(0.5)
                        genre_option = self.wait.until(
                            EC.element_to_be_clickable((By.XPATH, f"//div[@role='option' and contains(text(), '{genre}')]"))
                        )
                        genre_option.click()
                        print(f"🎭 Gênero adicionado: {genre}")
                        time.sleep(0.5)
                except:
                    print("⚠️  Não foi possível adicionar gêneros")
            
            # Preencher campos opcionais
            optional_fields = [
                ("thumbnail", "🖼️  URL da imagem", "thumbnail"),
                ("video_url", "🎥 URL do vídeo", "videoUrl"),
                ("synopsis", "📄 Sinopse", "synopsis")
            ]
            
            for field_data in optional_fields:
                field_key, description, field_id = field_data
                if movie_data.get(field_key):
                    try:
                        field_element = self.driver.find_element(By.ID, field_id or field_key)
                        field_element.clear()
                        field_element.send_keys(movie_data[field_key])
                        print(f"{description}: {movie_data[field_key][:50]}...")
                    except:
                        print(f"⚠️  Não foi possível preencher {description}")
            
            # Submeter formulário
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit' and contains(text(), 'Adicionar')]")
            print("💾 Submetendo formulário...")
            submit_button.click()
            
            # Aguardar modal fechar ou sucesso
            try:
                self.wait.until(EC.invisibility_of_element_located((By.ID, "title")))
                print("✅ Filme adicionado com sucesso!")
                return True
            except TimeoutException:
                # Verificar se há mensagens de erro
                try:
                    error_elements = self.driver.find_elements(By.CSS_SELECTOR, "[role='alert'], .toast-error, .error-message")
                    if error_elements:
                        error_text = error_elements[0].text
                        print(f"❌ Erro ao adicionar filme: {error_text}")
                    else:
                        print("❌ Timeout ao aguardar confirmação")
                except:
                    print("❌ Falha ao adicionar filme")
                return False
                
        except Exception as e:
            print(f"💥 Erro ao adicionar filme: {str(e)}")
            return False
    
    def verify_movie_in_list(self, movie_title):
        """
        Verifica se o filme aparece na lista
        """
        try:
            print(f"🔍 Procurando filme '{movie_title}' na lista...")
            
            # Aguardar a lista atualizar
            time.sleep(3)
            
            # Procurar pelo título - várias estratégias
            selectors = [
                f"//h3[contains(text(), '{movie_title}')]",
                f"//h2[contains(text(), '{movie_title}')]", 
                f"//*[contains(@class, 'title') and contains(text(), '{movie_title}')]",
                f"//*[contains(text(), '{movie_title}')]"
            ]
            
            for selector in selectors:
                try:
                    movie_element = self.driver.find_element(By.XPATH, selector)
                    print(f"✅ Filme '{movie_title}' encontrado!")
                    return True
                except NoSuchElementException:
                    continue
            
            print(f"❌ Filme '{movie_title}' não encontrado na lista")
            return False
            
        except Exception as e:
            print(f"💥 Erro ao verificar filme: {str(e)}")
            return False
    
    def take_screenshot(self, filename="test_screenshot.png"):
        """
        Tira um screenshot para debug
        """
        try:
            filepath = os.path.join(os.getcwd(), filename)
            self.driver.save_screenshot(filepath)
            print(f"📸 Screenshot salvo: {filepath}")
        except Exception as e:
            print(f"⚠️  Erro ao salvar screenshot: {str(e)}")
    
    def run_complete_test(self, credentials):
        """
        Executa o teste completo com dados realistas
        """
        print("🚀 INICIANDO TESTE COMPLETO")
        print("=" * 50)
        
        try:
            # Dados de teste mais realistas
            test_movies = [
                {
                    "title": "O Grande Teste",
                    "director": "Steven Selenium",
                    "year": "2023",
                    "duration": "90-120 min", 
                    "genres": ["Drama", "Ação"],
                    "thumbnail": "https://via.placeholder.com/300x450/FF6B6B/FFFFFF?text=Teste+1",
                    "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                    "synopsis": "Um épico filme de teste criado automaticamente pelo Selenium para validar a funcionalidade de adicionar filmes ao catálogo do Director's Cut."
                }
            ]
            
            # 1. Login
            if not self.login(credentials["email"], credentials["password"]):
                self.take_screenshot("login_failed.png")
                return False
            
            # 2. Aguardar página admin
            if not self.wait_for_admin_page():
                self.take_screenshot("admin_page_failed.png") 
                return False
            
            # 3. Testar adição de cada filme
            success_count = 0
            for i, movie in enumerate(test_movies):
                print(f"\n📽️  TESTE {i+1}/{len(test_movies)}")
                print("-" * 30)
                
                if self.add_movie(movie):
                    if self.verify_movie_in_list(movie["title"]):
                        success_count += 1
                        print(f"✅ Teste {i+1} PASSOU!")
                    else:
                        print(f"❌ Teste {i+1} FALHOU - filme não apareceu na lista")
                        self.take_screenshot(f"movie_{i+1}_not_found.png")
                else:
                    print(f"❌ Teste {i+1} FALHOU - erro ao adicionar")
                    self.take_screenshot(f"movie_{i+1}_add_failed.png")
                
                # Pequena pausa entre testes
                time.sleep(2)
            
            # 4. Resultados finais
            print("\n" + "=" * 50)
            print("📊 RESULTADOS FINAIS")
            print(f"✅ Sucessos: {success_count}")
            print(f"❌ Falhas: {len(test_movies) - success_count}")
            print(f"📈 Taxa de sucesso: {(success_count/len(test_movies))*100:.1f}%")
            
            if success_count == len(test_movies):
                print("🎉 TODOS OS TESTES PASSARAM!")
                return True
            else:
                print("⚠️  ALGUNS TESTES FALHARAM!")
                return False
            
        except Exception as e:
            print(f"💥 ERRO CRÍTICO NO TESTE: {str(e)}")
            self.take_screenshot("critical_error.png")
            return False
        
        finally:
            # Screenshot final
            self.take_screenshot("final_state.png")
            time.sleep(2)
            self.cleanup()
    
    def cleanup(self):
        """
        Limpa recursos
        """
        print("🧹 Finalizando teste...")
        self.driver.quit()

def main():
    """
    Função principal - AJUSTE AS CREDENCIAIS AQUI
    """
    print("🎬 DIRECTOR'S CUT - TESTE AUTOMATIZADO")
    print("🎯 Funcionalidade: Adicionar Filme")
    print("=" * 50)
    
    # ⚠️  CONFIGURAÇÕES - AJUSTE CONFORME NECESSÁRIO
    CONFIG = {
        "base_url": "https://preview--directors-cut.lovable.app",  # URL da aplicação hospedada
        "headless": False,  # True = sem interface, False = mostra navegador
        "credentials": {
            "email": "guilherme7072@gmail.com",     # 🔑 AJUSTE SEU EMAIL
            "password": "124910010"              # 🔑 AJUSTE SUA SENHA  
        }
    }
    
    # Verificações pré-teste
    print(f"🌐 URL de teste: {CONFIG['base_url']}")
    print(f"👤 Email: {CONFIG['credentials']['email']}")
    print(f"🖥️  Modo headless: {CONFIG['headless']}")
    print("🚀 Testando aplicação hospedada no Lovable!")
    print()
    
    # Executar teste
    test = DirectorsCutAdvancedTest(
        base_url=CONFIG["base_url"],
        headless=CONFIG["headless"]
    )
    
    success = test.run_complete_test(CONFIG["credentials"])
    
    # Exit codes para CI/CD
    exit(0 if success else 1)

if __name__ == "__main__":
    main()