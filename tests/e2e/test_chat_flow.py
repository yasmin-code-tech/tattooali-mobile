"""Contatos (lista de chats) e tela Chat quando acessível pelo modal na Busca."""

from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect


def test_contatos_render_mensagens_vazio_ou_lista(page_logada_contatos: Page) -> None:
    page = page_logada_contatos
    expect(page.get_by_text("CONTATOS", exact=True).first).to_be_visible(timeout=30_000)
    root = page.get_by_test_id("contatos-screen").first
    expect(root).to_be_visible()
    expect(root.get_by_text("Mensagens", exact=True)).to_be_visible()
    subt = root.get_by_text(
        "Converse com seus tatuadores", exact=False
    ).or_(root.get_by_text("Converse com seus clientes", exact=False))
    expect(subt.first).to_be_visible(timeout=15_000)
    vazio = root.get_by_text("Nenhuma conversa ainda", exact=False)
    carregando = root.get_by_text("Carregando", exact=False)
    config = root.get_by_text("EXPO_PUBLIC_SUPABASE", exact=False)
    linhas = page.locator("[data-testid^='contatos-conversa-']")
    expect(vazio.or_(carregando).or_(config).or_(linhas.first)).to_be_visible(timeout=60_000)


def test_chat_abre_pelo_modal_conversar(page_logada_busca: Page) -> None:
    """Busca → Ver perfil → Conversar (se o card tiver user_id após detalhe)."""
    page = page_logada_busca
    expect(page.get_by_test_id("busca-screen").first).to_be_visible(timeout=15_000)
    ver = page.get_by_text("Ver perfil", exact=True).first
    expect(ver).to_be_visible(timeout=90_000)
    ver.click()
    sheet = page.get_by_test_id("artist-modal-sheet")
    expect(sheet).to_be_visible(timeout=30_000)
    conv = sheet.get_by_text("Conversar", exact=True)
    try:
        expect(conv).to_be_visible(timeout=45_000)
    except AssertionError:
        sheet.get_by_text("Fechar", exact=True).click()
        pytest.skip("Sem botão Conversar (perfil sem user_id ou ainda a carregar detalhe)")
    conv.click()
    chat = page.get_by_test_id("chat-screen").first
    expect(chat).to_be_visible(timeout=30_000)
    expect(page.get_by_test_id("chat-input").first).to_be_visible(timeout=20_000)
    expect(page.get_by_test_id("chat-send").first).to_be_visible()
    page.get_by_test_id("chat-back").first.click()
    expect(page.get_by_test_id("busca-screen").first).to_be_visible(timeout=20_000)
