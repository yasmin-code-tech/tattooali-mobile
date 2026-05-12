"""Fluxo público de autenticação (Expo Web)."""

from __future__ import annotations

from playwright.sync_api import Page, expect

from login_helpers import login_root, wait_login_shell


def test_renderiza_tela_de_login(page: Page) -> None:
    page.goto("/")
    wait_login_shell(page)
    root = login_root(page)
    expect(root.get_by_text("EMAIL", exact=True)).to_be_visible()
    expect(root.get_by_text("SENHA", exact=True)).to_be_visible()
    expect(root.get_by_text("Entrar", exact=True)).to_be_visible()


def test_mostra_erro_sem_email(page: Page) -> None:
    page.goto("/")
    wait_login_shell(page)
    login_root(page).get_by_text("Entrar", exact=True).click()
    expect(
        login_root(page).get_by_text("Informe seu e-mail.", exact=True)
    ).to_be_visible()


def test_mostra_erro_sem_senha(page: Page) -> None:
    page.goto("/")
    wait_login_shell(page)
    root = login_root(page)
    root.get_by_placeholder("seuemail@email.com").fill("a@b.com")
    root.get_by_text("Entrar", exact=True).click()
    expect(root.get_by_text("Informe sua senha.", exact=True)).to_be_visible()


def test_navega_para_cadastro(page: Page) -> None:
    page.goto("/")
    wait_login_shell(page)
    login_root(page).get_by_text("Criar conta", exact=True).click()
    expect(
        page.get_by_text("Junte-se à comunidade Tattoali", exact=True)
    ).to_be_visible()
    expect(page.get_by_text("Cadastrar", exact=True)).to_be_visible()


def test_recuperacao_senha_e_volta(page: Page) -> None:
    page.goto("/")
    wait_login_shell(page)
    login_root(page).get_by_text("Esqueci minha senha", exact=True).click()
    expect(
        page.get_by_text("Enviar link de redefinição", exact=True)
    ).to_be_visible()
    page.get_by_text("Voltar para o login", exact=True).click()
    wait_login_shell(page)
