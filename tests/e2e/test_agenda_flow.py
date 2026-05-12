"""Tela Agenda: renderização inicial e três abas de status."""

from __future__ import annotations

import re

from playwright.sync_api import Locator, Page, expect


def _expect_conteudo_agendadas(agenda: Locator) -> None:
    vazio = agenda.get_by_text("Nenhum agendamento encontrado", exact=False)
    badge = agenda.get_by_text(re.compile(r"^Agendada$", re.I))
    expect(vazio.or_(badge).first).to_be_visible(timeout=30_000)


def _expect_conteudo_concluidas(agenda: Locator) -> None:
    vazio = agenda.get_by_text("Nenhuma sessão concluída", exact=False)
    badge = agenda.get_by_text(re.compile(r"^Concluída$", re.I))
    expect(vazio.or_(badge).first).to_be_visible(timeout=30_000)


def _expect_conteudo_canceladas(agenda: Locator) -> None:
    vazio = agenda.get_by_text("Nenhuma sessão cancelada", exact=False)
    badge = agenda.get_by_text(re.compile(r"^Cancelada$", re.I))
    expect(vazio.or_(badge).first).to_be_visible(timeout=30_000)


def test_agenda_render_hint_tablist_e_tres_abas(page_logada_agenda: Page) -> None:
    page = page_logada_agenda
    agenda = page.get_by_test_id("agenda-screen").first
    expect(agenda).to_be_visible(timeout=30_000)
    expect(page.get_by_text(re.compile(r"Suas sessões por status", re.I))).to_be_visible()
    expect(page.get_by_role("tablist")).to_be_visible()
    expect(page.get_by_test_id("agenda-tab-agendadas").first).to_be_visible()
    expect(page.get_by_test_id("agenda-tab-concluidas").first).to_be_visible()
    expect(page.get_by_test_id("agenda-tab-canceladas").first).to_be_visible()
    for label in ("Agendadas", "Concluídas", "Canceladas"):
        expect(agenda.get_by_text(label, exact=True).first).to_be_visible()


def test_agenda_abas_roles_acessiveis(page_logada_agenda: Page) -> None:
    page = page_logada_agenda
    expect(page.get_by_role("tab", name="Sessões agendadas").first).to_be_visible()
    expect(page.get_by_role("tab", name="Sessões concluídas").first).to_be_visible()
    expect(page.get_by_role("tab", name="Sessões canceladas").first).to_be_visible()


def _agenda_pronta_apos_carga(page: Page) -> None:
    """API ok mostra horário; falha mostra retry — evita assert antes do fim do loading."""
    ok = page.get_by_text(re.compile(r"Última atualização:", re.I))
    erro = page.get_by_text("Tentar novamente", exact=True)
    expect(ok.or_(erro).first).to_be_visible(timeout=90_000)


def test_agenda_abas_mudam_conteudo_lista_ou_vazio(page_logada_agenda: Page) -> None:
    """Cada aba mostra lista com badge de status ou vazio; RN Web não define aria-selected nas tabs."""
    page = page_logada_agenda
    agenda = page.get_by_test_id("agenda-screen").first
    _agenda_pronta_apos_carga(page)

    t_ag = page.get_by_test_id("agenda-tab-agendadas").first
    t_co = page.get_by_test_id("agenda-tab-concluidas").first
    t_ca = page.get_by_test_id("agenda-tab-canceladas").first

    _expect_conteudo_agendadas(agenda)
    t_co.click()
    _expect_conteudo_concluidas(agenda)

    t_ca.click()
    _expect_conteudo_canceladas(agenda)

    t_ag.click()
    _expect_conteudo_agendadas(agenda)
