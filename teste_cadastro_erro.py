from selenium import webdriver
import time 
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

navegador =  webdriver.Chrome()
wait = WebDriverWait(navegador,  30)

def escrever_texto(id_do_elemento, texto):
    """
    Espera até que um elemento com o ID fornecido seja clicável,
    clica nele e então envia o texto.
    """
    try:
        # 1. Espera o elemento se tornar clicável
        #    O wait.until retorna o próprio elemento quando a condição é satisfeita
        diretor = wait.until(
            EC.element_to_be_clickable((By.ID, id_do_elemento))
        )
        
        # 2. Interage com o elemento
        diretor.click()
        diretor.send_keys(texto)
        
        print(f"Texto '{texto}' escrito com sucesso no elemento com ID '{id_do_elemento}'.")

    except Exception as e:
        print(f"Ocorreu um erro ao tentar escrever no elemento com ID '{id_do_elemento}': {e}")

navegador.get("https://preview--directors-cut.lovable.app/auth")

navegador.maximize_window()

colocar_email = navegador.find_element("id", "email")

colocar_email.click()
time.sleep(2)
colocar_email.send_keys("guilherme7072@gmail.com")


colocar_senha = navegador.find_element("id", "password")
colocar_senha.click()
time.sleep(2)
colocar_senha.send_keys("124910010")

botao_entrar = navegador.find_element("id", "login-button")
botao_entrar.click()

time.sleep(5)

botao_add_film = navegador.find_element("id", "add-movie-button")
botao_add_film.click()
time.sleep(5)

escrever_texto("title", "Filme teste Selenium")
escrever_texto("director", "Algum diretor aí")
escrever_texto("thumbnail", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Selenium_Logo.png/1148px-Selenium_Logo.png")
escrever_texto("videoUrl", "https://www.youtube.com/watch?v=71ECrViH_Ng&t=1470s")
escrever_texto("synopsis", "Sinopse boa demais, tá doido!")

botao_save = navegador.find_element(By.XPATH, "//form/div[6]/button[2]")
botao_save.click()
time.sleep(5)