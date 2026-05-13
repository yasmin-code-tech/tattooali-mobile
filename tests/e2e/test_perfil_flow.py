"""Tela Perfil logada: hero, lista de atalhos e fluxo Editar perfil."""

from __future__ import annotations

from playwright.sync_api import Page, expect


def test_perfil_cabecalho_stack_e_conteudo(page_logada_perfil: Page) -> None:
    page = page_logada_perfil
    expect(page.get_by_text("MEU PERFIL", exact=True).first).to_be_visible(timeout=30_000)
    perfil = page.get_by_test_id("perfil-screen").first
    expect(perfil).to_be_visible()
    expect(perfil.get_by_text("Editar perfil", exact=True)).to_be_visible(timeout=15_000)
    expect(perfil.get_by_text("Minha Agenda", exact=True)).to_be_visible()
    expect(perfil.get_by_text("Mensagens", exact=True)).to_be_visible()
    expect(perfil.get_by_text("Minhas Avaliações", exact=True)).to_be_visible()


def test_perfil_abrir_editar_e_voltar(page_logada_perfil: Page) -> None:
    page = page_logada_perfil
    page.get_by_test_id("perfil-screen").first.get_by_test_id("perfil-editar").click()
    expect(page.get_by_test_id("editar-perfil-screen").first).to_be_visible(timeout=30_000)
    expect(page.get_by_text("EDITAR PERFIL", exact=True).first).to_be_visible(timeout=15_000)
    expect(page.get_by_text("Informações pessoais", exact=True).first).to_be_visible(timeout=15_000)
    page.get_by_test_id("editar-perfil-header-back").first.click()
    expect(page.get_by_test_id("perfil-screen").first).to_be_visible(timeout=30_000)
