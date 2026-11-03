(() => {
  const sidebar = document.querySelector('.tutorial-sidebar-left');
  const content = sidebar?.querySelector('.tutorial-sidebar-inner');
  if (!content) return;

  const phone = window.matchMedia('(max-width: 760px)');
  let toggle;
  const originalId = content.id;
  const originalHidden = content.hidden;

  function updateLayout() {
    if (phone.matches && !toggle) {
      content.id = originalId || 'mobile-tutorial-menu';
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mobile-tutorial-toggle';
      toggle.textContent = 'Chapters & search';
      toggle.setAttribute('aria-controls', content.id);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        content.hidden = expanded;
      });
      sidebar.prepend(toggle);
      content.hidden = true;
    } else if (!phone.matches && toggle) {
      // Restore the original desktop DOM when the viewport grows again.
      content.hidden = originalHidden;
      if (content.contains(document.activeElement) || document.activeElement === toggle) {
        sidebar.querySelector('.toc-link.active, .toc-link')?.focus({ preventScroll: true });
      }
      if (!originalId) content.removeAttribute('id');
      toggle.remove();
      toggle = undefined;
    }
  }

  phone.addEventListener('change', updateLayout);
  updateLayout();
})();
