import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException, TimeoutException, UnexpectedAlertPresentException


class DeleteLastMovieTest:
	def __init__(self, headless: bool = False, demo_delay: float = 0.0, typing_delay: float = 0.0, verbose: bool = False):
		self.base_url = "https://preview--directors-cut.lovable.app"
		self.wait_timeout = 15
		self.demo_delay = max(0.0, demo_delay)
		self.typing_delay = max(0.0, typing_delay) if typing_delay else (0.08 if self.demo_delay else 0.0)
		self.verbose = verbose

		options = Options()
		if headless:
			options.add_argument("--headless")
			options.add_argument("--window-size=1920,1080")
		else:
			options.add_argument("--start-maximized")

		try:
			service = Service("chromedriver.exe")
			self.driver = webdriver.Chrome(service=service, options=options)
		except Exception:
			self.driver = webdriver.Chrome(options=options)

		try:
			if not headless:
				self.driver.maximize_window()
		except Exception:
			pass

		self.wait = WebDriverWait(self.driver, self.wait_timeout)

	def ensure_auto_confirm(self):
		"""Garante que window.confirm será automaticamente aceito no front."""
		try:
			self.driver.execute_script("window.confirm = () => true;")
		except Exception:
			pass

	def pause(self, seconds: float | None = None):
		delay = self.demo_delay if seconds is None else seconds
		if delay and delay > 0:
			time.sleep(delay)

	def type_text(self, element, text: str):
		try:
			element.clear()
		except Exception:
			pass
		for ch in text:
			element.send_keys(ch)
			if self.typing_delay:
				time.sleep(self.typing_delay)
		self.pause(0.2)

	def login(self, email: str, password: str) -> bool:
		print("Login...")
		try:
			self.driver.get(f"{self.base_url}/auth")
			time.sleep(1.5)

			email_field = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
			password_field = self.driver.find_element(By.ID, "password")

			self.type_text(email_field, email)
			self.type_text(password_field, password)

			self.driver.find_element(By.ID, "login-button").click()
			self.pause()

			self.wait.until(lambda d: "/admin" in d.current_url)
			print("OK")
			return True
		except Exception as e:
			print(f"Falha no login: {e}")
			return False

	def get_first_card_title(self) -> str | None:
		try:
			# Aguarda pelo menos um card
			self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-gradient-card")))
			title = self.driver.execute_script(
				"""
				const card = document.querySelector('.bg-gradient-card');
				if (!card) return null;
				const titleEl = card.querySelector('.text-lg');
				return titleEl ? titleEl.textContent.trim() : null;
				"""
			)
			return title
		except TimeoutException:
			return None

	def find_deletable_card(self, preferred: str | None = None):
		try:
			return self.driver.execute_script(
				"""
				const pref = (arguments[0]||'').toLowerCase();
				const cards = Array.from(document.querySelectorAll('.bg-gradient-card'));
				let fallback = null;
				for (let i=0;i<cards.length;i++) {
					const card = cards[i];
					const actions = card.querySelector('.flex.justify-end.space-x-2');
					if (!actions) continue;
					const titleEl = card.querySelector('.text-lg');
					const t = titleEl ? titleEl.textContent.trim() : '';
					if (!fallback && t) fallback = { title: t, index: i };
					if (pref && t.toLowerCase().includes(pref)) return { title: t, index: i };
				}
				return fallback;
				""",
				preferred,
			)
		except Exception:
			return None

	def click_delete_by_index(self, index: int) -> bool:
		try:
			return bool(self.driver.execute_script(
				"""
				const idx = arguments[0];
				const cards = Array.from(document.querySelectorAll('.bg-gradient-card'));
				const card = cards[idx];
				if (!card) return false;
				try { card.scrollIntoView({block:'center'}); } catch(e) { card.scrollIntoView(); }
				// Tenta achar o botão de deletar pelo ícone Trash2 (Lucide)
				const trashIcon = card.querySelector('svg[data-lucide="trash-2"], svg.lucide-trash-2, svg[class*="trash-2"]');
				let delBtn = null;
				if (trashIcon) {
					delBtn = trashIcon.closest('button');
				}
				// Fallback: barra de ações e último botão
				if (!delBtn) {
					const actions = card.querySelector('.flex.justify-end.space-x-2');
					if (!actions) return false;
					const btns = actions.querySelectorAll('button');
					delBtn = btns[btns.length - 1] || null;
				}
				if (!delBtn) return false;
				try { delBtn.scrollIntoView({block:'center'}); } catch(e) { delBtn.scrollIntoView(); }
				delBtn.focus();
				try { delBtn.click(); } catch (e) {}
				const ev = new MouseEvent('click', {bubbles:true, cancelable:true, view:window});
				delBtn.dispatchEvent(ev);
				return true;
				""",
				index,
			))
		except Exception:
			return False

	def click_delete(self, preferred: str | None = None):
		try:
			result = self.driver.execute_script(
				"""
				const pref = (arguments[0]||'').toLowerCase();
				const cards = Array.from(document.querySelectorAll('.bg-gradient-card'));
				let chosen = null, chosenIdx = -1;
				for (let i=0;i<cards.length;i++) {
					const card = cards[i];
					const titleEl = card.querySelector('.text-lg');
					const title = titleEl ? titleEl.textContent.trim() : '';
					const actions = card.querySelector('.flex.justify-end.space-x-2');
					if (!actions) continue;
					if (pref && !title.toLowerCase().includes(pref)) continue;
					chosen = card; chosenIdx = i; break;
				}
				if (!chosen) {
					// fallback: primeiro com ações
					for (let i=0;i<cards.length;i++) {
						const card = cards[i];
						const actions = card.querySelector('.flex.justify-end.space-x-2');
						if (actions) { chosen = card; chosenIdx = i; break; }
					}
				}
				if (!chosen) return { clicked:false, reason:'no-card-with-actions' };
				try { chosen.scrollIntoView({block:'center'}); } catch(e) { }
				const titleEl = chosen.querySelector('.text-lg');
				const title = titleEl ? titleEl.textContent.trim() : '';
				let delBtn = null;
				const trashIcon = chosen.querySelector('svg[data-lucide="trash-2"], svg.lucide-trash-2, svg[class*="trash-2"]');
				if (trashIcon) delBtn = trashIcon.closest('button');
				if (!delBtn) {
					const actions = chosen.querySelector('.flex.justify-end.space-x-2');
					const btns = actions ? actions.querySelectorAll('button') : [];
					delBtn = btns[btns.length-1] || null;
				}
				if (!delBtn) return { clicked:false, reason:'no-delete-button', title, index: chosenIdx };
				try { delBtn.scrollIntoView({block:'center'}); } catch(e) { }
				delBtn.focus();
				let ok = false;
				try { delBtn.click(); ok = true; } catch(e) {}
				try { const ev = new MouseEvent('click', {bubbles:true, cancelable:true, view:window}); delBtn.dispatchEvent(ev); ok = true; } catch(e) {}
				return { clicked: ok, reason: ok ? 'clicked' : 'dispatch-failed', title, index: chosenIdx };
				""",
				preferred or "",
			)
			return result
		except Exception as e:
			return { 'clicked': False, 'reason': f'exception: {e}' }

	def accept_confirm(self) -> bool:
		try:
			alert = self.wait.until(EC.alert_is_present())
			alert.accept()
			return True
		except TimeoutException:
			# Fallback: em alguns ambientes, podemos sobrescrever confirm para sempre aceitar
			try:
				self.driver.execute_script("window.confirm = () => true;")
				return False  # indicamos que foi necessário fallback (quem chamar decide reclicar)
			except Exception:
				print("Confirmação não apareceu e fallback falhou.")
				return False

	def wait_title_removed(self, title: str) -> bool:
		end = time.time() + self.wait_timeout
		while time.time() < end:
			try:
				present = self.driver.execute_script(
					"""
					const t = arguments[0].toLowerCase();
					const cards = Array.from(document.querySelectorAll('.bg-gradient-card'));
					return cards.some(card => {
						const el = card.querySelector('.text-lg');
						return el && el.textContent.trim().toLowerCase().includes(t);
					});
					""",
					title,
				)
				if not present:
					return True
			except Exception:
				pass
			time.sleep(0.5)
		return False

	def run(self, email: str, password: str) -> bool:
		print("=== Deletar último filme ===")
		try:
			if not self.login(email, password):
				return False

			self.pause(1.0)

			# Evitar 'unexpected alert open' sobrescrevendo confirm antes de clicar
			self.ensure_auto_confirm()


			# Diagnóstico opcional: listar primeiros cards
			if self.verbose:
				try:
					info = self.driver.execute_script(
						"""
						const cards = Array.from(document.querySelectorAll('.bg-gradient-card'));
						return cards.slice(0,6).map((card, i) => {
							const titleEl = card.querySelector('.text-lg');
							const actions = card.querySelector('.flex.justify-end.space-x-2');
							const svg = card.querySelector('svg[data-lucide="trash-2"], svg.lucide-trash-2, svg[class*="trash-2"]');
							return {
								index: i,
								title: titleEl ? titleEl.textContent.trim() : null,
								hasActions: !!actions,
								hasTrashIcon: !!svg,
								buttons: actions ? actions.querySelectorAll('button').length : 0
							};
						});
						"""
					)
					if info:
						for item in info:
							print(f"Card {item['index']}: '{item['title']}' | actions={item['hasActions']} trashIcon={item['hasTrashIcon']} buttons={item['buttons']}")
				except Exception:
					pass

			# Preferir deletar "Teste Automatizado" se existir; senão o primeiro deletável
			result = self.click_delete("Teste Automatizado")
			if not result or not result.get('clicked'):
				# tentar sem preferência
				result = self.click_delete(None)
			if not result or not result.get('clicked'):
				print(f"Não foi possível acionar o botão de exclusão. Motivo: {result.get('reason') if isinstance(result, dict) else 'desconhecido'}")
				return False

			target_title = result.get('title', 'desconhecido')
			print(f"Alvo: '{target_title}'")

			# Como confirm foi sobrescrito, não há alerta para aceitar; apenas aguardar remoção

			removed = self.wait_title_removed(target_title)
			if removed:
				print("Excluído com sucesso.")
				return True
			else:
				print("O card ainda está na tela após a exclusão.")
				return False
		finally:
			self.pause(0.5)
			self.driver.quit()


def main():
	EMAIL = "guilherme7072@gmail.com"
	PASSWORD = "124910010"
	HEADLESS = False
	DEMO_DELAY = 0.8
	TYPING_DELAY = 0.08

	test = DeleteLastMovieTest(headless=HEADLESS, demo_delay=DEMO_DELAY, typing_delay=TYPING_DELAY, verbose=False)
	ok = test.run(EMAIL, PASSWORD)
	exit(0 if ok else 1)


if __name__ == "__main__":
	main()

