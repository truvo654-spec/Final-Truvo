// Auto-cleanup utility: Ensures all buttons with text do NOT display icons across the platform
// As requested: "ปุ่มทั้งหมด ใน platform ไม่มี icon ครับ เอา icon ที่อยุ่ใน component ปุ่ม ที่มันมี text กับ icon ออกไปเลย"

export function setupButtonIconCleaner() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const processButton = (button: Element) => {
    // If button already marked, skip
    // Check if the button has non-empty text content
    const text = (button.textContent || '').trim();
    if (!text) {
      // It's an icon-only button (e.g. close 'X' icon, pagination arrows without text, theme toggle)
      return;
    }

    // Do NOT hide arrows/chevrons in dropdown components or select triggers
    // As explicitly requested: "และ component ไหนที่มันเป็น dropdown ให้เลือก ใส่ตัว arrow เข้าไปด้วยครับ"
    const isDropdownTrigger =
      button.getAttribute('aria-haspopup') === 'true' ||
      button.getAttribute('aria-haspopup') === 'listbox' ||
      button.getAttribute('data-dropdown-trigger') === 'true' ||
      button.closest('[data-dropdown]') !== null ||
      button.classList.contains('dropdown-trigger') ||
      button.classList.contains('select-trigger') ||
      button.id?.includes('dropdown') ||
      button.className.includes('pr-10'); // typical dropdown button layout with right chevron

    // It has text! Hide any svg icons inside this button (except dropdown arrow indicators)
    const svgs = button.querySelectorAll('svg');
    if (svgs.length > 0) {
      svgs.forEach((svg) => {
        // Double check this svg isn't a dropdown arrow indicator
        const isArrow =
          svg.classList.contains('lucide-chevron-down') ||
          svg.classList.contains('lucide-chevron-up') ||
          svg.classList.contains('lucide-chevrons-up-down') ||
          svg.classList.contains('dropdown-arrow') ||
          svg.getAttribute('data-dropdown-arrow') === 'true';

        if (isDropdownTrigger && isArrow) {
          // Keep dropdown arrow visible!
          svg.style.display = '';
          svg.removeAttribute('data-btn-has-text-icon');
          return;
        }

        svg.setAttribute('data-btn-has-text-icon', 'true');
        svg.style.display = 'none';
      });
      if (!isDropdownTrigger) {
        button.setAttribute('data-has-text-btn', 'true');
      }
    }
  };

  const scanAllButtons = () => {
    const buttons = document.querySelectorAll('button, [role="button"], a[class*="btn"], a[class*="button"]');
    buttons.forEach(processButton);
  };

  // Initial scan when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAllButtons);
  } else {
    scanAllButtons();
  }

  // Observe dynamically mounted elements / state changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.matches && (el.matches('button, [role="button"], a[class*="btn"], a[class*="button"]'))) {
              processButton(el);
            }
            if (el.querySelectorAll) {
              const innerBtns = el.querySelectorAll('button, [role="button"], a[class*="btn"], a[class*="button"]');
              innerBtns.forEach(processButton);
            }
          }
        });
      } else if (mutation.type === 'characterData') {
        const parent = mutation.target.parentElement;
        const btn = parent?.closest('button, [role="button"]');
        if (btn) {
          processButton(btn);
        }
      }
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
