import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class MovieTest:
    def __init__(self, headless=False, demo_delay: float = 0.0, typing_delay: float = 0.0):
        self.base_url = "https://preview--directors-cut.lovable.app"
        self.wait_timeout = 15
        self.last_movie_title = None
        self.demo_delay = max(0.0, demo_delay)
        # Tempo entre cada caractere digitado (efeito de digitação)
        self.typing_delay = max(0.0, typing_delay) if typing_delay else max(0.06, min(0.12, self.demo_delay / 1.5 if self.demo_delay else 0.0))
        
        # Configurar Chrome
        options = Options()
        if headless:
            # Headless: controla tamanho pela window-size
            options.add_argument("--headless")
            options.add_argument("--window-size=1920,1080")
        else:
            # Modo normal: inicia maximizado
            options.add_argument("--start-maximized")
        
        # Usar ChromeDriver local se disponível
        try:
            service = Service("chromedriver.exe")
            self.driver = webdriver.Chrome(service=service, options=options)
        except:
            self.driver = webdriver.Chrome(options=options)
        
        # Garantir janela maximizada quando possível
        try:
            if not headless:
                self.driver.maximize_window()
        except Exception:
            pass

        self.wait = WebDriverWait(self.driver, self.wait_timeout)
    
    def pause(self, seconds: float | None = None):
        """Pausa para fins de demonstração sem poluir o código com muitos sleeps."""
        delay = self.demo_delay if seconds is None else seconds
        if delay and delay > 0:
            time.sleep(delay)

    def type_text(self, element, text: str):
        """Digita caractere por caractere no elemento informado."""
        try:
            element.clear()
        except Exception:
            pass
        for ch in text:
            element.send_keys(ch)
            if self.typing_delay:
                time.sleep(self.typing_delay)
        # pequena pausa após terminar de digitar
        self.pause(0.2)
    
    def login(self, email, password):
        """Realiza login no sistema"""
        print("Fazendo login...")
        
        try:
            self.driver.get(f"{self.base_url}/auth")
            time.sleep(2)
            self.pause()
            
            # Preencher credenciais (efeito de digitação)
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            password_field = self.driver.find_element(By.ID, "password")
            
            self.type_text(email_field, email)
            self.type_text(password_field, password)
            
            # Fazer login
            login_button = self.driver.find_element(By.ID, "login-button")
            login_button.click()
            self.pause()
            
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
                self.pause(0.6)
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
            self.pause()
            
            # Aguardar modal carregar
            title_field = self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            time.sleep(1)
            self.pause()
            
            # Preencher campos básicos
            print("Preenchendo informações básicas...")
            
            movie_title = "Teste Automatizado"
            self.type_text(title_field, movie_title)
            self.pause(0.6)
            
            director_field = self.driver.find_element(By.ID, "director")
            self.type_text(director_field, "Diretor Teste")
            self.pause(0.6)
            
            time.sleep(1)
            self.pause()
            
            # Configurar dropdowns obrigatórios
            print("Configurando campos obrigatórios...")
            
            # Ano (dropdown 0)
            self.select_dropdown_option(0, "2023", "Ano")
            time.sleep(1)
            self.pause()
            
            # Duração (dropdown 1) - obrigatório
            duration_ok = self.select_dropdown_option(1, "90-120", "Duração")
            if not duration_ok:
                print("Tentando qualquer duração disponível...")
                duration_ok = self.select_dropdown_option(1, "", "Duração")
                if not duration_ok:
                    print("ERRO: Não foi possível selecionar duração")
                    return False
            
            time.sleep(1)
            self.pause()
            
            # Gênero (dropdown 2)
            self.select_dropdown_option(2, "Drama", "Gênero")
            time.sleep(1)
            self.pause()
            
            # Submeter formulário
            print("Salvando filme...")
            submit_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_button.click()
            self.pause()
            
            # Aguardar processamento
            time.sleep(3)
            self.pause()
            
            # Verificar se o modal fechou (indicativo de sucesso)
            try:
                self.driver.find_element(By.ID, "title")
                print("Modal ainda aberto - possível erro de validação")
                return False
            except NoSuchElementException:
                self.last_movie_title = movie_title
                print(f"Filme '{movie_title}' adicionado com sucesso")
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

            # Editar filme recém-adicionado (URLs de vídeo e imagem)
            if success and self.last_movie_title:
                edit_ok = self.edit_movie_urls(
                    title=self.last_movie_title,
                    video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    image_url="https://picsum.photos/seed/directors-cut/800/450"
                )
                success = success and edit_ok
            
            # Resultado
            elapsed = time.time() - start_time
            print()
            print("=== Resultado ===")
            if success:
                print("Status: SUCESSO")
                print("Filme adicionado e editado com êxito")
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

    # ==== Funções de edição ====
    def _wait_for_movie_card(self, title: str, timeout: int = 15) -> bool:
        """Espera o card do filme aparecer no grid pelo título."""
        end = time.time() + timeout
        while time.time() < end:
            try:
                found = self.driver.execute_script(
                    """
                    const t = arguments[0].toLowerCase();
                    const cards = Array.from(document.querySelectorAll('.bg-gradient-card'));
                    for (const card of cards) {
                        const titleEl = card.querySelector('.text-lg');
                        if (titleEl && titleEl.textContent.trim().toLowerCase().includes(t)) {
                            return true;
                        }
                    }
                    return false;
                    """,
                    title,
                )
                if found:
                    return True
            except Exception:
                pass
            time.sleep(0.5)
        return False

    def _open_edit_dialog_for_movie(self, title: str) -> bool:
        """Clica no botão de editar do card do filme pelo título (primeiro botão de ação)."""
        try:
            opened = self.driver.execute_script(
                """
                const t = arguments[0].toLowerCase();
                const cards = Array.from(document.querySelectorAll('.bg-gradient-card'));
                for (const card of cards) {
                    const titleEl = card.querySelector('.text-lg');
                    if (titleEl && titleEl.textContent.trim().toLowerCase().includes(t)) {
                        const actions = card.querySelector('.flex.justify-end.space-x-2');
                        if (actions) {
                            const editBtn = actions.querySelector('button'); // primeiro é editar
                            if (editBtn) { editBtn.click(); return true; }
                        }
                    }
                }
                return false;
                """,
                title,
            )
            if not opened:
                print("Não foi possível localizar o botão de editar para o filme.")
                return False
            # Espera o formulário abrir
            self.wait.until(EC.presence_of_element_located((By.ID, "title")))
            self.pause()
            return True
        except Exception as e:
            print(f"Erro ao abrir diálogo de edição: {e}")
            return False

    def _set_input_value_by_id(self, field_id: str, value: str) -> bool:
        """Define valor de um input controlado pelo React priorizando digitação caractere a caractere."""
        try:
            el = self.wait.until(EC.presence_of_element_located((By.ID, field_id)))
            try:
                # Efeito de digitação
                self.type_text(el, value)
            except Exception:
                # Fallback via JS
                self.driver.execute_script(
                    """
                    const el = document.getElementById(arguments[0]);
                    if (!el) return false;
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(el, arguments[1]);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    return true;
                    """,
                    field_id,
                    value,
                )
            self.pause(0.5)
            return True
        except Exception as e:
            print(f"Não foi possível definir '{field_id}': {e}")
            return False

    def edit_movie_urls(self, title: str, video_url: str, image_url: str) -> bool:
        """Abre edição do filme, atualiza URLs e salva."""
        print("Editando filme para incluir URLs...")
        try:
            # Garante que o card está visível
            if not self._wait_for_movie_card(title):
                print("Card do filme não encontrado após inclusão.")
                return False

            if not self._open_edit_dialog_for_movie(title):
                return False

            # Preencher URLs
            if not self._set_input_value_by_id("thumbnail", image_url):
                return False
            if not self._set_input_value_by_id("videoUrl", video_url):
                return False

            # Salvar alterações
            submit_button = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']")))
            submit_button.click()
            self.pause()

            # Espera o diálogo fechar
            self.wait.until(EC.invisibility_of_element_located((By.ID, "title")))
            self.pause()

            # Reabre edição e verifica persistência
            if not self._open_edit_dialog_for_movie(title):
                return False
            got_image = self.driver.find_element(By.ID, "thumbnail").get_attribute("value")
            got_video = self.driver.find_element(By.ID, "videoUrl").get_attribute("value")
            ok = (got_image == image_url) and (got_video == video_url)
            # Fecha diálogo
            try:
                cancel = self.driver.find_element(By.XPATH, "//button[normalize-space()='Cancelar']")
                cancel.click()
            except Exception:
                self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
                self.wait.until(EC.invisibility_of_element_located((By.ID, "title")))
            self.pause()

            if ok:
                print("URLs salvas com sucesso.")
                return True
            else:
                print("As URLs não persistiram corretamente.")
                return False
        except Exception as e:
            print(f"Erro ao editar filme: {e}")
            return False

def main():
    """Função principal"""
    # Configurações
    EMAIL = "guilherme7072@gmail.com"
    PASSWORD = "124910010"
    HEADLESS = False
    DEMO_DELAY = 1.0  # segundos extras entre ações para demonstração (ajuste conforme necessário)
    TYPING_DELAY = 0.08  # segundos por caractere para efeito de digitação
    
    # Executar teste
    test = MovieTest(headless=HEADLESS, demo_delay=DEMO_DELAY, typing_delay=TYPING_DELAY)
    success = test.run_test(EMAIL, PASSWORD)
    
    exit(0 if success else 1)

if __name__ == "__main__":
    main()