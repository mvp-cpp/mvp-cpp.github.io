// Tutorial interactions: copy buttons, current-page search, and secondary table of contents.
(function () {
      const copyResetTimers = new WeakMap();

      async function copyText(text) {
        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(text);
            return;
          } catch (error) {
            // Fall back to legacy copy below.
          }
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        const copied = document.execCommand('copy');
        textarea.remove();

        if (!copied) {
          throw new Error('Copy command failed');
        }
      }

      function setCopyButtonState(button, label) {
        const state = label === 'Copied' ? 'copied' : label === 'Failed' ? 'failed' : 'idle';
        button.dataset.copyState = state;
        button.setAttribute('aria-label', label === 'Copy' ? 'Copy code block' : label);
        button.title = label;
        const previousTimer = copyResetTimers.get(button);
        if (previousTimer) {
          window.clearTimeout(previousTimer);
        }
        const timer = window.setTimeout(() => {
          button.dataset.copyState = 'idle';
          button.setAttribute('aria-label', 'Copy code block');
          button.title = 'Copy';
          copyResetTimers.delete(button);
        }, 1400);
        copyResetTimers.set(button, timer);
      }

      document.querySelectorAll('.code').forEach((block) => {
        const code = block.querySelector('pre code');
        if (!code || block.querySelector('.code-copy-btn')) return;

        block.classList.add('code-copy-wrap');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy-btn';
        button.dataset.copyState = 'idle';
        button.innerHTML = '<svg class="code-copy-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M5 15H4V4h11v1" fill="none" stroke="currentColor" stroke-width="2"></path></svg>';
        button.setAttribute('aria-label', 'Copy code block');
        button.title = 'Copy';

        button.addEventListener('click', async () => {
          try {
            await copyText(code.textContent || '');
            setCopyButtonState(button, 'Copied');
          } catch (error) {
            setCopyButtonState(button, 'Failed');
          }
        });

        block.appendChild(button);
      });

      const primaryLinks = Array.from(document.querySelectorAll('.toc-link-primary'));
      const sections = primaryLinks
        .map(link => document.getElementById(link.dataset.target))
        .filter(Boolean);

      const secondaryToc = document.getElementById('secondaryToc');
      const searchWrap = document.getElementById('tutorialSearch');
      const searchInput = document.getElementById('tutorialSearchInput');
      const searchClear = document.getElementById('tutorialSearchClear');
      const searchStatus = document.getElementById('tutorialSearchStatus');
      const searchPrev = document.getElementById('tutorialSearchPrev');
      const searchNext = document.getElementById('tutorialSearchNext');
      const contentRoot = document.getElementById('tutorialContent');
      let searchQuery = '';
      let searchMarks = [];
      let currentSearchIndex = -1;

      function normalizeSearchText(text) {
        return text.toLowerCase().trim();
      }

      function clearSearchMarks() {
        contentRoot?.querySelectorAll('mark.tutorial-search-mark').forEach(mark => {
          mark.replaceWith(document.createTextNode(mark.textContent || ''));
        });
        contentRoot?.normalize();
        searchMarks = [];
        currentSearchIndex = -1;
      }

      function shouldSearchTextNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue?.trim()) return false;
        return !parent.closest('script, style, .code-copy-btn, .tutorial-search');
      }

      function highlightTextNode(node, query) {
        const text = node.nodeValue || '';
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        let index = lowerText.indexOf(lowerQuery);
        let created = 0;

        while (index !== -1) {
          if (index > cursor) {
            fragment.appendChild(document.createTextNode(text.slice(cursor, index)));
          }

          const mark = document.createElement('mark');
          mark.className = 'tutorial-search-mark';
          mark.textContent = text.slice(index, index + query.length);
          fragment.appendChild(mark);
          searchMarks.push(mark);
          created += 1;

          cursor = index + query.length;
          index = lowerText.indexOf(lowerQuery, cursor);
        }

        if (!created) return;

        if (cursor < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(cursor)));
        }

        node.replaceWith(fragment);
      }

      function updateSearchPosition(index, shouldScroll) {
        searchMarks.forEach(mark => mark.classList.remove('is-current'));

        if (!searchMarks.length) {
          currentSearchIndex = -1;
          if (searchStatus) {
            searchStatus.textContent = searchQuery ? 'No matches' : '';
          }
          searchPrev.disabled = true;
          searchNext.disabled = true;
          return;
        }

        currentSearchIndex = (index + searchMarks.length) % searchMarks.length;
        const current = searchMarks[currentSearchIndex];
        current.classList.add('is-current');

        if (searchStatus) {
          searchStatus.textContent = `${currentSearchIndex + 1} of ${searchMarks.length}`;
        }
        searchPrev.disabled = false;
        searchNext.disabled = false;

        if (shouldScroll) {
          current.scrollIntoView({ behavior:'smooth', block:'center' });
        }
      }

      function applySearch() {
        searchQuery = normalizeSearchText(searchInput?.value || '');
        searchWrap?.classList.toggle('has-query', Boolean(searchQuery));
        clearSearchMarks();

        if (!searchQuery) {
          searchStatus.textContent = '';
          searchPrev.disabled = true;
          searchNext.disabled = true;
          onScroll();
          return;
        }

        const walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            return shouldSearchTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        });
        const textNodes = [];
        while (walker.nextNode()) {
          textNodes.push(walker.currentNode);
        }
        textNodes.forEach(node => highlightTextNode(node, searchQuery));
        updateSearchPosition(0, false);
      }

      function buildSecondary(section) {
        const title = section.dataset.sectionTitle || section.querySelector('h2')?.textContent || '';
        const subs = Array.from(section.querySelectorAll('.doc-subsection h3'));

        secondaryToc.innerHTML = '';

        subs.forEach((heading, index) => {
          if (!heading.id) {
            heading.id = `${section.id}-sub-${index + 1}`;
          }
          const a = document.createElement('a');
          a.href = `#${heading.id}`;
          a.className = 'toc-link toc-link-secondary';
          a.dataset.target = heading.id;
          a.textContent = heading.textContent;
          secondaryToc.appendChild(a);
        });

        syncSecondaryActive();
      }

      function setActivePrimary(sectionId) {
        primaryLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.target === sectionId);
        });
      }

      function syncSecondaryActive() {
        const secondaryLinks = Array.from(document.querySelectorAll('.toc-link-secondary'));
        const headings = secondaryLinks
          .map(link => document.getElementById(link.dataset.target))
          .filter(Boolean);

        let activeHeadingId = headings[0]?.id || null;
        const threshold = window.innerHeight * 0.22;

        headings.forEach(heading => {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= threshold) {
            activeHeadingId = heading.id;
          }
        });

        secondaryLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.target === activeHeadingId);
        });
      }

      function findActiveSection() {
        let activeSection = sections[0];
        const threshold = window.innerHeight * 0.22;

        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= threshold) {
            activeSection = section;
          }
        });
        return activeSection;
      }

      let currentSectionId = sections[0]?.id || null;
      if (sections[0]) {
        buildSecondary(sections[0]);
        setActivePrimary(sections[0].id);
      }

      function onScroll() {
        const activeSection = findActiveSection();
        if (!activeSection) return;

        if (activeSection.id !== currentSectionId) {
          currentSectionId = activeSection.id;
          buildSecondary(activeSection);
          setActivePrimary(activeSection.id);
        }
        syncSecondaryActive();
      }

      document.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);

      searchInput?.addEventListener('input', () => {
        applySearch();
        onScroll();
      });

      searchClear?.addEventListener('click', () => {
        searchInput.value = '';
        applySearch();
        searchInput.focus();
        onScroll();
      });

      searchPrev?.addEventListener('click', () => {
        updateSearchPosition(currentSearchIndex - 1, true);
      });

      searchNext?.addEventListener('click', () => {
        updateSearchPosition(currentSearchIndex + 1, true);
      });

      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function () {
          requestAnimationFrame(() => {
            setTimeout(onScroll, 120);
          });
        });
      });

      applySearch();
      onScroll();
    })();
