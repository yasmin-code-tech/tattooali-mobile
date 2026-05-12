"""Helpers comuns para telas de login (Expo Web / RN)."""

from __future__ import annotations

from playwright.sync_api import Page, expect


def login_root(page: Page):
    # Stack + Strict Mode podem duplicar a tela no DOM (RN Web).
    return page.get_by_test_id("login-screen").last


def wait_login_shell(page: Page) -> None:
    expect(login_root(page)).to_be_visible(timeout=60_000)


def perform_login(page: Page, email: str, password: str) -> None:
    page.goto("/")
    wait_login_shell(page)
    root = login_root(page)
    root.get_by_placeholder("seuemail@email.com").fill(email)
    root.get_by_placeholder("••••••••").fill(password)
    root.get_by_text("Entrar", exact=True).click()


def expect_busca_logada(page: Page) -> None:
    """Após login bem-sucedido: tela inicial privada é Busca."""
    try:
        expect(page.get_by_test_id("busca-screen")).to_be_visible(timeout=90_000)
    except AssertionError as err:
        root = login_root(page)
        if root.is_visible(timeout=2000):
            snippet = root.inner_text(timeout=5000)[:900]
            raise AssertionError(
                "Não chegou na tela Busca após login. "
                "Garanta o backend em http://127.0.0.1:3000 (ou E2E_EXPO_PUBLIC_API_URL) e CORS para "
                "http://127.0.0.1:19007. Se reutiliza um Expo já aberto com API só em IP da LAN, "
                "feche-o ou use E2E_REUSE_SERVER=0 para o pytest subir outro Expo com API no loopback. "
                f"Trecho da tela de login:\n{snippet}"
            ) from err
        raise
    expect(
        page.get_by_placeholder("Buscar tatuador, estilo, bairro...")
    ).to_be_visible(timeout=15_000)
    expect(page.get_by_text("TATUADORES", exact=True)).to_be_visible(timeout=30_000)
