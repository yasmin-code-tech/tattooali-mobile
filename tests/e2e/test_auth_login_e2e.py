"""Login real contra API (Expo Web). Credenciais só por variável de ambiente — nunca commitar."""

from __future__ import annotations

import os

import pytest
from playwright.sync_api import Page, expect

from login_helpers import expect_busca_logada, perform_login

EMAIL = os.environ.get("E2E_LOGIN_EMAIL", "").strip()
PASSWORD = os.environ.get("E2E_LOGIN_PASSWORD", "")

pytestmark = pytest.mark.skipif(
    not EMAIL or not PASSWORD,
    reason="Crie .env.e2e na raiz com E2E_LOGIN_EMAIL e E2E_LOGIN_PASSWORD (veja e2e.env.example).",
)


def test_login_redireciona_para_busca(page: Page) -> None:
    perform_login(page, EMAIL, PASSWORD)
    expect_busca_logada(page)
    expect(page.get_by_text("BUSCAR", exact=True).first).to_be_visible()
