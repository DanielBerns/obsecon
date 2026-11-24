// Feature-detect native Popover API and load polyfill ONLY when missing.
if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
  import("https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js");
}

const header = document.querySelector(".site-header");
const inner = header?.querySelector(".header-inner");
const menu = document.getElementById("site-menu");

if (header && inner && menu) {
  let lastHeaderWidth = 0;

  const isMenuOpen = () => {
    try {
      return menu.matches(":popover-open");
    } catch {
      return menu.classList.contains(":popover-open");
    }
  };

  const syncNavLayout = () => {
    const currentWidth = header.clientWidth;
    const currentlyWide = header.classList.contains("is-wide");

    // While collapsed, only remeasure when the header has grown to avoid thrashing.
    if (!currentlyWide && currentWidth <= lastHeaderWidth && lastHeaderWidth > 0) {
      lastHeaderWidth = currentWidth;
      return;
    }

    const wasOpen = !currentlyWide && isMenuOpen();

    header.classList.add("is-measuring", "is-wide");
    menu.removeAttribute("popover");

    const fitsInline = inner.scrollWidth <= inner.clientWidth;

    if (fitsInline) {
      header.classList.add("is-wide");
      menu.removeAttribute("popover");
    } else {
      header.classList.remove("is-wide");
      menu.setAttribute("popover", "auto");
      if (wasOpen && typeof menu.showPopover === "function") {
        try {
          menu.showPopover();
        } catch {
          // Ignore if polyfill has not yet initialized.
        }
      }
    }

    lastHeaderWidth = currentWidth;
    // Flush collapsed styles while .is-measuring suppresses discrete display transitions.
    void header.offsetHeight;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        header.classList.remove("is-measuring");
      });
    });
  };

  // Close collapsed popover when navigating to an in-page anchor.
  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (link && !header.classList.contains("is-wide") && typeof menu.hidePopover === "function") {
      try {
        menu.hidePopover();
      } catch {
        // Already closed.
      }
    }
  });

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(syncNavLayout);
    observer.observe(header);
    observer.observe(menu);
  } else {
    window.addEventListener("resize", syncNavLayout);
  }

  // Run initial check and recheck once webfonts settle.
  syncNavLayout();
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      lastHeaderWidth = 0;
      syncNavLayout();
    });
  }
}
