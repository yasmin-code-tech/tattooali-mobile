"""Sobe ou reutiliza o Expo Web conforme a base URL dos testes (pytest-playwright)."""

from __future__ import annotations

import os
import socket
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

import pytest
from playwright.sync_api import Page, expect

from login_helpers import expect_busca_logada, perform_login

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def _load_dotenv_e2e() -> None:
    """Carrega .env.e2e na raiz (gitignored) sem sobrescrever variáveis já exportadas."""
    path = REPO_ROOT / ".env.e2e"
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


_load_dotenv_e2e()
os.chdir(REPO_ROOT)
TATTOOALI = REPO_ROOT / "tattooali"
# Porta usada só quando o pytest sobe um Expo dedicado para E2E
E2E_DEDICATED_PORT = 19007


def _session_base_url(request: pytest.FixtureRequest) -> str:
    """Mesma URL do pytest-base-url (pytest.ini ou --base-url http://localhost:8081)."""
    try:
        url = request.config.getoption("base_url")
    except (ValueError, AttributeError):
        url = None
    if url:
        return str(url).rstrip("/")
    return f"http://127.0.0.1:{E2E_DEDICATED_PORT}"


def _tcp_open(host: str, port: int, timeout: float = 0.25) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def _wait_http_ready(base: str, timeout_sec: int = 180) -> None:
    fetch = base.rstrip("/") + "/"
    p = urlparse(fetch)
    host = p.hostname or "127.0.0.1"
    port = p.port or (443 if p.scheme == "https" else 80)
    deadline = time.monotonic() + timeout_sec
    while time.monotonic() < deadline:
        if not _tcp_open(host, port):
            time.sleep(0.5)
            continue
        try:
            urllib.request.urlopen(fetch, timeout=5)
            return
        except (urllib.error.URLError, TimeoutError, OSError):
            time.sleep(1)
    raise RuntimeError(
        f"App não respondeu em {fetch} dentro de {timeout_sec}s. "
        f"Se usa --base-url http://localhost:8081, rode antes `cd tattooali && npm start` e abra o Web (w). "
        f"Para o pytest subir o Expo sozinho, use a URL padrão (porta {E2E_DEDICATED_PORT}) sem --base-url."
    )


@pytest.fixture(scope="session")
def expo_web_server(request: pytest.FixtureRequest):
    """
    - URL padrão (127.0.0.1:19007): sobe ou reutiliza Expo com EXPO_PUBLIC_API_URL no loopback.
    - URL custom (ex.: http://localhost:8081): só espera o app já rodando (mesmo fluxo do teu teste manual).
    """
    base = _session_base_url(request)
    parsed = urlparse(base)
    scheme = parsed.scheme or "http"
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port
    if port is None:
        port = 443 if scheme == "https" else 80

    reuse = os.environ.get("E2E_REUSE_SERVER", "1") == "1"
    if reuse and _tcp_open(host, port):
        _wait_http_ready(base)
        yield base
        return

    if port == E2E_DEDICATED_PORT:
        if not TATTOOALI.is_dir():
            raise RuntimeError(f"Pasta do app não encontrada: {TATTOOALI}")

        env = os.environ.copy()
        env.setdefault("CI", "1")
        api_url = os.environ.get("E2E_EXPO_PUBLIC_API_URL", "http://127.0.0.1:3000")
        env["EXPO_PUBLIC_API_URL"] = api_url

        proc = subprocess.Popen(
            ["npx", "expo", "start", "--web", f"--port={E2E_DEDICATED_PORT}"],
            cwd=str(TATTOOALI),
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            _wait_http_ready(base)
            yield base
        finally:
            proc.terminate()
            try:
                proc.wait(timeout=25)
            except subprocess.TimeoutExpired:
                proc.kill()
        return

    _wait_http_ready(base, timeout_sec=120)
    yield base


@pytest.fixture(scope="session", autouse=True)
def _require_expo_web(expo_web_server):
    assert expo_web_server.startswith("http")


@pytest.fixture
def page_logada_busca(page: Page) -> Page:
    """Login + espera tela Busca (mesmas credenciais E2E do teste de login)."""
    email = os.environ.get("E2E_LOGIN_EMAIL", "").strip()
    password = os.environ.get("E2E_LOGIN_PASSWORD", "")
    if not email or not password:
        pytest.skip("Crie .env.e2e com E2E_LOGIN_EMAIL e E2E_LOGIN_PASSWORD.")
    perform_login(page, email, password)
    expect_busca_logada(page)
    return page


@pytest.fixture
def page_logada_agenda(page: Page) -> Page:
    """Login, Busca estável e navegação para Agenda (navbar)."""
    email = os.environ.get("E2E_LOGIN_EMAIL", "").strip()
    password = os.environ.get("E2E_LOGIN_PASSWORD", "")
    if not email or not password:
        pytest.skip("Crie .env.e2e com E2E_LOGIN_EMAIL e E2E_LOGIN_PASSWORD.")
    perform_login(page, email, password)
    expect_busca_logada(page)
    page.get_by_test_id("nav-Agenda").click()
    expect(page.get_by_test_id("agenda-screen").first).to_be_visible(timeout=60_000)
    return page


@pytest.fixture
def page_logada_perfil(page: Page) -> Page:
    """Login, Busca e navbar Perfil."""
    email = os.environ.get("E2E_LOGIN_EMAIL", "").strip()
    password = os.environ.get("E2E_LOGIN_PASSWORD", "")
    if not email or not password:
        pytest.skip("Crie .env.e2e com E2E_LOGIN_EMAIL e E2E_LOGIN_PASSWORD.")
    perform_login(page, email, password)
    expect_busca_logada(page)
    page.get_by_test_id("nav-Perfil").click()
    expect(page.get_by_test_id("perfil-screen").first).to_be_visible(timeout=60_000)
    return page


@pytest.fixture
def page_logada_contatos(page: Page) -> Page:
    """Login, Busca e navbar Contatos (lista de conversas)."""
    email = os.environ.get("E2E_LOGIN_EMAIL", "").strip()
    password = os.environ.get("E2E_LOGIN_PASSWORD", "")
    if not email or not password:
        pytest.skip("Crie .env.e2e com E2E_LOGIN_EMAIL e E2E_LOGIN_PASSWORD.")
    perform_login(page, email, password)
    expect_busca_logada(page)
    page.get_by_test_id("nav-Contatos").click()
    expect(page.get_by_test_id("contatos-screen").first).to_be_visible(timeout=60_000)
    return page
