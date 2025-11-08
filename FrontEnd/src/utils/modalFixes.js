/**
 * Universal Modal Utility Functions - Campus Pulse
 * Fixes double scrollbar issues and improper modal layouts
 */

/**
 * Apply modal fixes to prevent double scrollbars and improve layout
 * @param {HTMLElement} modalElement - The modal element to fix
 * @param {Object} options - Configuration options
 */
export function applyModalFixes(modalElement, options = {}) {
  const {
    overlaySelector = '.modal-overlay',
    contentSelector = '.modal-content, .modal-body',
    headerSelector = '.modal-header',
    footerSelector = '.modal-footer',
    closeSelector = '.close-btn, .modal-close'
  } = options;

  if (!modalElement) {
    console.warn('Modal element not found for fixing');
    return;
  }

  // Find modal parts
  const overlay = modalElement.querySelector(overlaySelector) || modalElement;
  const content = modalElement.querySelector(contentSelector);
  const header = modalElement.querySelector(headerSelector);
  const footer = modalElement.querySelector(footerSelector);
  const closeBtn = modalElement.querySelector(closeSelector);

  // Apply fixed classes
  overlay.classList.add('modal-overlay-fixed');
  
  if (content) {
    // Determine if it's the container or content
    const container = content.closest('.modal-content') || content;
    container.classList.add('modal-container-fixed');
    content.classList.add('modal-content-fixed');
  }
  
  if (header) header.classList.add('modal-header-fixed');
  if (footer) footer.classList.add('modal-footer-fixed');
  if (closeBtn) closeBtn.classList.add('modal-close-fixed');

  // Prevent body scroll
  document.body.classList.add('modal-open');

  console.log('Modal fixes applied successfully');
}

/**
 * Remove modal fixes and restore normal scrolling
 */
export function removeModalFixes() {
  document.body.classList.remove('modal-open');
  
  // Remove inline styles that might interfere
  document.body.style.overflow = '';
  document.body.style.height = '';
  document.body.style.position = '';
  document.body.style.width = '';
  
  console.log('Modal fixes removed, body scroll restored');
}

/**
 * Fix an existing modal that's already showing
 * @param {string|HTMLElement} modalSelector - Selector or element for the modal
 */
export function fixExistingModal(modalSelector = '.modal-overlay') {
  const modal = typeof modalSelector === 'string' 
    ? document.querySelector(modalSelector)
    : modalSelector;
    
  if (modal && modal.style.display !== 'none') {
    applyModalFixes(modal);
  }
}

/**
 * Auto-detect and fix all modals on page load
 */
export function autoFixModals() {
  const modalSelectors = [
    '.modal-overlay',
    '[class*="modal"]',
    '[class*="popup"]',
    '[class*="dialog"]'
  ];

  modalSelectors.forEach(selector => {
    const modals = document.querySelectorAll(selector);
    modals.forEach(modal => {
      // Only fix visible modals
      const style = window.getComputedStyle(modal);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        applyModalFixes(modal);
      }
    });
  });
}

/**
 * Create a mutation observer to auto-fix modals when they appear
 */
export function createModalObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node is a modal
          if (node.classList && (
            node.classList.contains('modal-overlay') ||
            node.classList.contains('modal') ||
            node.classList.contains('popup') ||
            node.classList.contains('dialog')
          )) {
            setTimeout(() => applyModalFixes(node), 100);
          }
          
          // Check if the added node contains modals
          const modals = node.querySelectorAll && node.querySelectorAll(
            '.modal-overlay, .modal, .popup, .dialog'
          );
          if (modals && modals.length > 0) {
            modals.forEach(modal => {
              setTimeout(() => applyModalFixes(modal), 100);
            });
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}

/**
 * Enhanced modal event handlers
 */
export function setupModalEventHandlers() {
  // Handle close button clicks
  document.addEventListener('click', (e) => {
    if (e.target.matches('.modal-close-fixed, .close-btn')) {
      removeModalFixes();
    }
  });

  // Handle overlay clicks
  document.addEventListener('click', (e) => {
    if (e.target.matches('.modal-overlay-fixed')) {
      removeModalFixes();
    }
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('modal-open')) {
      removeModalFixes();
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    // Reapply fixes to ensure proper sizing
    const openModal = document.querySelector('.modal-overlay-fixed');
    if (openModal) {
      applyModalFixes(openModal);
    }
  });
}

/**
 * Force fix all modal issues immediately (emergency function)
 */
export function emergencyModalFix() {
  // Force remove any problematic styles
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  
  // Fix all visible modals
  const allPossibleModals = document.querySelectorAll(`
    .modal-overlay,
    .modal-content,
    .modal,
    .popup,
    .dialog,
    [class*="modal"],
    [class*="popup"],
    [class*="dialog"]
  `);
  
  allPossibleModals.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.display !== 'none' && style.visibility !== 'hidden') {
      // Force proper modal structure
      element.style.overflow = element.classList.contains('modal-overlay') ? 'hidden' : 'auto';
      element.style.maxHeight = element.classList.contains('modal-content') ? 'calc(100% - 100px)' : '85vh';
      
      if (element.classList.contains('modal-overlay')) {
        element.style.position = 'fixed';
        element.style.top = '0';
        element.style.left = '0';
        element.style.right = '0';
        element.style.bottom = '0';
        element.style.zIndex = '1000';
      }
    }
  });
  
  console.log('Emergency modal fix applied');
}

/**
 * Initialize all modal fixes
 */
export function initializeModalFixes() {
  // Load the CSS fixes
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/src/styles/modal-fixes.css';
  document.head.appendChild(link);
  
  // Setup event handlers
  setupModalEventHandlers();
  
  // Create observer for future modals
  createModalObserver();
  
  // Fix any existing modals
  setTimeout(autoFixModals, 500);
  
  console.log('Modal fixes initialized successfully');
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModalFixes);
  } else {
    initializeModalFixes();
  }
}