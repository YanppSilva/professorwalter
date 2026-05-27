/* app.js — interações modernas (menu, scroll, dialog, FABs)
   Mantém o comportamento essencial do seu script antigo: scroll-top e ação de WhatsApp. */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function isDialogSupported() {
    return typeof HTMLDialogElement !== "undefined";
  }

  function getHeaderHeight() {
    const header = $(".site-header");
    return header ? header.getBoundingClientRect().height : 0;
  }

  function openInNewTab(url) {
    // noopener por segurança
    window.open(url, "_blank", "noopener");
  }

  document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       MENU MOBILE
    ========================= */
    const navToggle = $(".nav-toggle");
    const navList = $("#menu");
    const navLinks = navList ? $$('a[href^="#"]', navList) : [];

    function setMenu(open) {
      if (!navToggle) return;
      navToggle.setAttribute("aria-expanded", String(!!open));
    }

    function isMenuOpen() {
      return navToggle?.getAttribute("aria-expanded") === "true";
    }

    function closeMenu() {
      setMenu(false);
    }

    navToggle?.addEventListener("click", () => {
      setMenu(!isMenuOpen());
    });

    // Fecha ao clicar em link do menu + scroll com offset do header
    navLinks.forEach((link) => {
      link.addEventListener("click", (ev) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const target = $(href);
        if (!target) return;

        ev.preventDefault();
        closeMenu();

        // Scroll com offset para não “esconder” atrás do header sticky
        const y = target.getBoundingClientRect().top + window.scrollY - (getHeaderHeight() + 12);
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      });
    });

    // Fecha ao clicar fora do menu (apenas quando aberto e em modo mobile)
    document.addEventListener("click", (ev) => {
      if (!navToggle || !navList) return;
      if (!isMenuOpen()) return;

      const clickedInsideNav =
        navList.contains(ev.target) || navToggle.contains(ev.target);

      if (!clickedInsideNav) closeMenu();
    });

    // Fecha ao pressionar ESC
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && isMenuOpen()) closeMenu();
    });

    /* =========================
       SCROLL TOP (mesma ideia do seu antigo: aparece após ~300px)
    ========================= */
    const btnTop = $('[data-scrolltop]');
    const SHOW_AFTER = 300; // referência do seu comportamento anterior [1](https://bnbgovbr.sharepoint.com/sites/FaaVocMesmo-CENTRAL3121/Documentos%20Partilhados/Artigos/MFA%20no%20Gerenciamento%20do%20Nordeste%20Eletr%c3%b4nico/MFA%20no%20Gerenciamento%20do%20Nordeste%20Eletr%c3%b4nico.pdf?web=1)

    function updateScrollTopVisibility() {
      if (!btnTop) return;
      if (window.scrollY > SHOW_AFTER) btnTop.classList.add("is-visible");
      else btnTop.classList.remove("is-visible");
    }

    window.addEventListener("scroll", updateScrollTopVisibility, { passive: true });
    updateScrollTopVisibility();

    btnTop?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* =========================
       FAB WHATSAPP
    ========================= */
    const fabWhatsapp = $(".fab-whatsapp");
    fabWhatsapp?.addEventListener("click", () => {
      const url = fabWhatsapp.getAttribute("data-whatsapp");
      if (url) openInNewTab(url);
    });

    /* =========================
       DIALOG (MODAL) — pós compra
       - Abre pelos botões [data-open-dialog="..."]
       - CTA do modal abre WhatsApp
    ========================= */
    const dialogTriggers = $$("[data-open-dialog]");
    let dialogEl = null;

    dialogTriggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-open-dialog");
        if (!id) return;

        dialogEl = document.getElementById(id);

        // Se não existir ou não for dialog suportado, apenas abre WhatsApp como fallback
        if (!dialogEl || !isDialogSupported() || typeof dialogEl.showModal !== "function") {
          // fallback: tenta achar uma URL padrão no botão do FAB ou no próprio trigger
          const fallbackUrl =
            fabWhatsapp?.getAttribute("data-whatsapp") ||
            btn.getAttribute("data-go-whatsapp");

          if (fallbackUrl) openInNewTab(fallbackUrl);
          return;
        }

        dialogEl.showModal();
      });
    });

    // Botão do modal que direciona pro WhatsApp
    document.addEventListener("click", (ev) => {
      const el = ev.target.closest("[data-go-whatsapp]");
      if (!el) return;

      const url = el.getAttribute("data-go-whatsapp");
      if (!url) return;

      // Fecha dialog (se aberto) e abre WhatsApp em nova aba
      const dlg = el.closest("dialog");
      if (dlg && typeof dlg.close === "function") dlg.close();
      openInNewTab(url);
    });

    // Clique no backdrop fecha o dialog (padrão esperado em UI moderna)
    document.addEventListener("click", (ev) => {
      const dlg = ev.target instanceof HTMLDialogElement ? ev.target : null;
      if (!dlg) return;

      const rect = dlg.getBoundingClientRect();
      const inDialog =
        rect.top <= ev.clientY &&
        ev.clientY <= rect.top + rect.height &&
        rect.left <= ev.clientX &&
        ev.clientX <= rect.left + rect.width;

      // Clique fora do conteúdo (backdrop)
      if (!inDialog) dlg.close();
    });

    /* =========================
       Melhorias pequenas: foco/outline (não muda layout)
    ========================= */
    document.addEventListener("keydown", (ev) => {
      if (ev.key !== "Tab") return;
      document.body.classList.add("user-is-tabbing");
    });
  });
})();