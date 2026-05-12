"""Tela Busca logada: hero, filtros, modal de filtros e Ver perfil (ArtistModal)."""

from __future__ import annotations

import re

import pytest
from playwright.sync_api import Locator, Page, expect


def _locator_chip_anime(page: Page) -> Locator:
    """Chip Anime: testID segue a API (capitalização variável); RN Web pode duplicar a árvore — .last
    costuma ser a instância visível. Qualquer chip cuja etiqueta contenha 'Anime' (sem âncoras ^$ por
    possíveis espaços/ZWJ)."""
    busca = page.get_by_test_id("busca-screen").last
    por_id = (
        busca.get_by_test_id("busca-chip-Anime")
        .or_(busca.get_by_test_id("busca-chip-anime"))
        .or_(busca.get_by_test_id("busca-chip-ANIME"))
    )
    por_texto_no_chip = busca.locator("[data-testid^='busca-chip-']").filter(
        has_text=re.compile(r"Anime", re.I)
    )
    return por_id.or_(por_texto_no_chip).first


def test_busca_header_hero_e_campo(page_logada_busca: Page) -> None:
    page = page_logada_busca
    expect(page.get_by_test_id("busca-screen")).to_be_visible()
    expect(page.get_by_text("BUSCA", exact=True).first).to_be_visible()
    expect(page.get_by_placeholder("Buscar tatuador, estilo, bairro...")).to_be_visible()
    # Um único Text no RN: "ENCONTRE\nSEU ARTISTA" — exact "SEU ARTISTA" não casa.
    expect(page.get_by_text(re.compile(r"ENCONTRE\s+SEU\s+ARTISTA", re.I | re.S))).to_be_visible()
    expect(
        page.get_by_text("Busque por nome, bio, endereço", exact=False).first
    ).to_be_visible()


def test_busca_nav_inferior_destaca_buscar(page_logada_busca: Page) -> None:
    expect(page_logada_busca.get_by_text("BUSCAR", exact=True).first).to_be_visible()


def test_busca_listagem_ou_vazio(page_logada_busca: Page) -> None:
    page = page_logada_busca
    expect(page.get_by_text("TATUADORES", exact=True)).to_be_visible(timeout=60_000)
    cards = page.locator("[data-testid^='artist-card-']")
    empty_title = page.get_by_text("Nenhum tatuador encontrado", exact=True)
    try:
        expect(cards.first).to_be_visible(timeout=90_000)
    except AssertionError:
        expect(empty_title).to_be_visible(timeout=5_000)


def test_busca_chip_segundo_estilo_mostra_resultados(page_logada_busca: Page) -> None:
    page = page_logada_busca
    expect(page.get_by_text("TATUADORES", exact=True)).to_be_visible(timeout=60_000)
    chips = page.locator("[data-testid^='busca-chip-']")
    expect(chips.first).to_be_visible(timeout=30_000)
    if chips.count() < 2:
        pytest.skip("Menos de 2 chips de estilo na tela")
    chips.nth(1).click()
    expect(page.get_by_text("RESULTADOS", exact=True)).to_be_visible(timeout=45_000)
    chips.nth(0).click()
    expect(page.get_by_text("TATUADORES", exact=True)).to_be_visible(timeout=45_000)


def test_busca_filtro_anime_lista_isabelle(page_logada_busca: Page) -> None:
    page = page_logada_busca
    expect(page.get_by_text("TATUADORES", exact=True)).to_be_visible(timeout=60_000)
    anime_chip = _locator_chip_anime(page)
    # Os chips de estilo chegam após o catálogo; count()==0 no primeiro instante gerava skip falso.
    expect(anime_chip).to_be_visible(timeout=60_000)
    anime_chip.scroll_into_view_if_needed()
    anime_chip.click()
    expect(page.get_by_text("RESULTADOS", exact=True)).to_be_visible(timeout=45_000)
    expect(page.get_by_text("Isabelle Lopes", exact=True).first).to_be_visible(timeout=45_000)


def test_busca_modal_filtros_abrir_e_aplicar(page_logada_busca: Page) -> None:
    page = page_logada_busca
    page.get_by_test_id("busca-abrir-filtros").click()
    expect(page.get_by_test_id("search-filter-modal")).to_be_visible()
    expect(page.get_by_text("Filtrar por", exact=True)).to_be_visible()
    page.get_by_text("Aplicar", exact=True).click()
    expect(page.get_by_test_id("search-filter-modal")).to_be_hidden(timeout=15_000)


def test_busca_ver_perfil_abre_modal_e_fecha(page_logada_busca: Page) -> None:
    page = page_logada_busca
    ver = page.get_by_text("Ver perfil", exact=True).first
    expect(ver).to_be_visible(timeout=90_000)
    ver.click()
    sheet = page.get_by_test_id("artist-modal-sheet")
    expect(sheet).to_be_visible(timeout=30_000)
    fechar = sheet.get_by_text("Fechar", exact=True)
    expect(fechar).to_be_visible(timeout=90_000)
    fechar.click()
    expect(sheet).to_be_hidden(timeout=15_000)
