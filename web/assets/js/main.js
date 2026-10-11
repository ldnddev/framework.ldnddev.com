/**
 * Sal - Scroll Animation Library
 * Performance focused, lightweight scroll animation library
 *
 * Adapted from ESM source for Grunt concat/uglify (no import/export).
 * Styles live in source/scss/vendors/sal.scss.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.sal = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SSR_MESSAGE = 'Sal was not initialised! Probably it is used in SSR.';

  const NOT_SUPPORTED_MESSAGE = ''
    + 'Your browser does not support IntersectionObserver!\n'
    + 'Get a polyfill from here:\n'
    + 'https://github.com/w3c/IntersectionObserver/tree/master/polyfill';

  /**
   * Default options
   */
  let options = {
    root: null,
    rootMargin: '0% 50%',
    threshold: 0.5,
    animateClassName: 'sal-animate',
    disabledClassName: 'sal-disabled',
    enterEventName: 'sal:in',
    exitEventName: 'sal:out',
    selector: '[data-sal]',
    once: true,
    disabled: false,
  };

  /**
   * Private
   */
  let elements = [];
  let intersectionObserver = null;

  /**
   * Sets options.
   * @param {Object} settings
   */
  const setOptions = (settings) => {
    if (settings && settings !== options) {
      options = {
        ...options,
        ...settings,
      };
    }
  };

  /**
   * Clears animation for given element.
   * @param {HTMLElement} element
   */
  const clearAnimation = (element) => {
    element.classList.remove(options.animateClassName);
  };

  /**
   * Dispatches the animate event on the intersection observer entry.
   * @param {IntersectionObserverEntry} detail The entry to fire event on.
   */
  const fireEvent = (name, entry) => {
    const event = new CustomEvent(name, {
      bubbles: true,
      detail: entry,
    });

    entry.target.dispatchEvent(event);
  };

  /**
   * Launches animation by adding class.
   * @param {IntersectionObserverEntry} entry
   */
  const animate = (entry) => {
    entry.target.classList.add(options.animateClassName);
    fireEvent(options.enterEventName, entry);
  };

  /**
   * Reverses animation by removing class.
   * @param {IntersectionObserverEntry} entry
   */
  const reverse = (entry) => {
    clearAnimation(entry.target);
    fireEvent(options.exitEventName, entry);
  };

  /**
   * Checks if element was animated.
   * @param {HTMLElement} element
   */
  const isAnimated = (element) => (
    element.classList.contains(options.animateClassName)
  );

  /**
   * Enables animations by remove class from body.
   */
  const enableAnimations = () => {
    document.body.classList.remove(options.disabledClassName);
  };

  /**
   * Disables animations by add class from body.
   */
  const disableAnimations = () => {
    document.body.classList.add(options.disabledClassName);
  };

  /**
   * Clears observer.
   */
  const clearObserver = () => {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  };

  /**
   * Check if should be disabled.
   * @return {Boolean}
   */
  const isDisabled = () => (
    options.disabled
    || (
      (typeof options.disabled === 'function')
      && options.disabled()
    )
  );

  /**
   * IntersectionObserver callback.
   * @param  {Array<IntersectionObserverEntry>} entries
   * @param  {IntersectionObserver} observer
   */
  const onIntersection = (entries, observer) => {
    entries.forEach((entry) => {
      const { target } = entry;
      const hasRepeatFlag = target.dataset.salRepeat !== undefined;
      const hasOnceFlag = target.dataset.salOnce !== undefined;
      const shouldRepeat = hasRepeatFlag || !(hasOnceFlag || options.once);

      if (entry.intersectionRatio >= options.threshold) {
        animate(entry);

        if (!shouldRepeat) {
          observer.unobserve(target);
        }
      } else if (shouldRepeat) {
        reverse(entry);
      }
    });
  };

  /**
   * Returns collection of elements and pushes them to observer.
   *
   * @returns {Array<Node>}
   */
  const getObservedElements = () => {
    const collection = [].filter.call(
      document.querySelectorAll(options.selector),
      (element) => !isAnimated(element, options.animateClassName),
    );

    collection.forEach((element) => intersectionObserver.observe(element));

    return collection;
  };

  /**
   * Disables instance by removing animations and clearing observer.
   */
  const disable = () => {
    disableAnimations();
    clearObserver();
  };

  /**
   * Enables instance by launching new IntersectionObserver.
   */
  const enable = () => {
    enableAnimations();

    intersectionObserver = new IntersectionObserver(onIntersection, {
      root: options.root,
      rootMargin: options.rootMargin,
      threshold: options.threshold,
    });

    elements = getObservedElements();
  };

  /**
   * Resets instance to provide new settings.
   * @param {Object} settings
   */
  const reset = (settings = {}) => {
    clearObserver();

    Array.from(document.querySelectorAll(options.selector))
      .forEach(clearAnimation);

    setOptions(settings);
    enable();
  };

  /**
   * Updates observer with new elements to animated.
   * Useful for dynamically injected elements.
   */
  const update = () => {
    const newElements = getObservedElements();
    elements.push(newElements);
  };

  /**
   * Init
   * @param  {Object} settings
   * @return {Object} public API
   */
  const init = (settings = options) => {
    setOptions(settings);

    // Early return, when window object is not defined
    // e.g. during Server Side Rendering
    if (typeof window === 'undefined') {
      console.warn(SSR_MESSAGE);

      return {
        elements,
        disable,
        enable,
        reset,
        update,
      };
    }

    if (!window.IntersectionObserver) {
      disableAnimations();

      throw Error(NOT_SUPPORTED_MESSAGE);
    }

    if (!isDisabled()) {
      enable();
    } else {
      disableAnimations();
    }

    return {
      elements,
      disable,
      enable,
      reset,
      update,
    };
  };

  return init;
}));

// function that will escape all HTML chars from the passed element and add the output to the proper code element: AI!
function escape_code_block() {
  // Find all <code> elements
  document.querySelectorAll('code').forEach(codeBlock => {
    // Skip if already processed (prevents double-wrapping)
    if (codeBlock.dataset.enhanced) return;
    //codeBlock.dataset.enhanced = 'true';

    // Get the original raw content (before we escape it)
    const originalContent = codeBlock.innerHTML;

    // Escape it so it displays correctly as text
    const escaped = originalContent
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#039;');

    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.style.position = 'absolute';
    copyBtn.style.top = '6px';
    copyBtn.style.right = '8px';
    copyBtn.classList.add("-ghost");
    copyBtn.style.zIndex = '10';

    // Copy functionality
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(originalContent)
        .then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          copyBtn.style.backgroundColor = '#d4edda';
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '#f0f0f0';
          }, 1800);
        })
        .catch(err => {
          console.error('Copy failed:', err);
          copyBtn.textContent = 'Copy failed';
        });
    });

    // Replace content with escaped version
    codeBlock.innerHTML = escaped;

    // Add copy button to code block
    codeBlock.appendChild(copyBtn);
  });
}

// dd cookie consent + Google Consent Mode v2.
// Accept grants analytics_storage ONLY; ad_storage, ad_user_data and ad_personalization are always 'denied'.
// Defaults (analytics 'denied', or 'granted' for a stored 'accept') are set inline in <head> (templates/_head.hbs)
// before gtag.js loads. This file only shows the banner and sends consent updates.
function dd_consent_update(state) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: state,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
}
function dd_cookie_consent() {
  let consent = null;
  try { consent = localStorage.getItem('dd_cookie_consent'); } catch (e) {}
  const popup = document.getElementById('cookie-consent');
  if (!popup) return;
  // Show the banner only when no choice has been stored yet.
  popup.style.display = consent ? 'none' : 'block';
}
function handleCookieConsent(choice) {
  try { localStorage.setItem('dd_cookie_consent', choice); } catch (e) {}
  const popup = document.getElementById('cookie-consent');
  if (popup) popup.style.display = 'none';
  dd_consent_update(choice === 'accept' ? 'granted' : 'denied');
}

// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_cookie_consent();
});

function dd_data_table() {
  const tables = document.querySelectorAll('.dd-data-table');

  tables.forEach(table => {
    if (table.dataset.ddInit === 'true') {
      dd_data_table_sync_scroll(table);
      return;
    }
    table.dataset.ddInit = 'true';

    const tableEl = table.querySelector('.dd-data-table__table');
    const buttons = table.querySelectorAll('.dd-data-table__sort');

    buttons.forEach(button => {
      button.addEventListener('click', function () {
        const th = this.closest('th');
        const headerRow = th.parentElement;
        const columnIndex = Array.from(headerRow.children).indexOf(th);
        const current = th.getAttribute('aria-sort');
        const direction = current === 'ascending' ? 'descending' : 'ascending';

        // Reset every sortable header to none (4.1.2 — only one non-none).
        tableEl.querySelectorAll('th[aria-sort]').forEach(header => {
          header.setAttribute('aria-sort', 'none');
        });
        th.setAttribute('aria-sort', direction);

        dd_data_table_sort_rows(tableEl, columnIndex, direction);
      });
    });

    // Keep the scroll region reachable only while it actually overflows.
    dd_data_table_sync_scroll(table);
  });
}

function dd_data_table_sort_rows(tableEl, columnIndex, direction) {
  const body = tableEl.querySelector('tbody');
  if (!body) return;
  const rows = Array.from(body.querySelectorAll('tr')).filter(
    row => !row.classList.contains('-empty')
  );

  const cellValue = row => {
    const cell = row.children[columnIndex];
    return cell ? cell.textContent.trim() : '';
  };
  const asNumber = text => {
    const num = parseFloat(String(text).replace(/[^0-9.\-]/g, ''));
    return Number.isNaN(num) ? null : num;
  };

  rows.sort((a, b) => {
    const av = cellValue(a);
    const bv = cellValue(b);
    const an = asNumber(av);
    const bn = asNumber(bv);
    let result;
    if (an !== null && bn !== null) {
      result = an - bn;
    } else {
      result = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
    }
    return direction === 'ascending' ? result : -result;
  });

  rows.forEach(row => body.appendChild(row));
}

function dd_data_table_sync_scroll(table) {
  const scroll = table.querySelector('.dd-data-table__scroll');
  if (!scroll) return;

  const overflows = scroll.scrollWidth > scroll.clientWidth;
  if (overflows) {
    if (!scroll.hasAttribute('aria-label')) {
      const caption = table.querySelector('.dd-data-table__caption');
      const name = scroll.dataset.label || (caption ? caption.textContent.trim() : 'Data table');
      scroll.setAttribute('aria-label', name);
    }
    scroll.setAttribute('tabindex', '0');
    scroll.setAttribute('role', 'region');
  } else {
    // Not scrollable: remove the empty focus stop / stray landmark.
    scroll.removeAttribute('tabindex');
    scroll.removeAttribute('role');
    if (!scroll.dataset.label) {
      scroll.removeAttribute('aria-label');
    }
  }
}

// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_data_table();
});
// Re-initialize after HTMX swaps
document.body.addEventListener('htmx:afterSettle', function () {
  dd_data_table();
});
// Re-evaluate scrollability on resize / zoom
window.addEventListener('resize', () => {
  document.querySelectorAll('.dd-data-table').forEach(dd_data_table_sync_scroll);
});

function dd_is_visible() {
  const animate_observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('-is-visible');
        }
        else {
          entry.target.classList.remove('-is-visible');
        }
      });
    });
    // Only check for elements with a class of -animate
    const animate_elements = document.querySelectorAll('.-animate');
    // watch and swap classes
    animate_elements.forEach((el) => animate_observer.observe(el));
}

// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_is_visible();
});

// This function is called from the dd_animate.js file
function dd_milestones_count() {
  document.querySelectorAll('.dd-milestones .dd-milestones__percentage').forEach(function(elem) {
    var milestone_start = 0;
    var milestone_end = elem.dataset.number;
    var milestone_elem = elem.querySelector('.number');
    var milestone_animate = setInterval(function() {
      if (milestone_start <= milestone_end) {
        milestone_elem.innerText = milestone_start;
        milestone_start++;
      } else {
        clearInterval(milestone_animate);
      }
    }, 60);
  });
}
// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_milestones_count();
});

function dd_modal() {
  // Check if any element with data-modal exists
  if (document.querySelector("[data-modal]")) {
    // Handle open / close buttons
    const modal_open_buttons = document.querySelectorAll("[data-modal-open]");
    modal_open_buttons.forEach((modal_open_button) => {
      const modalId = modal_open_button.getAttribute("data-id");
      const modal = document.getElementById(modalId);
      const modal_close_button = modal.querySelector("[data-modal-close]");
      if (modal) {
        // Handle open button
        modal_open_button.addEventListener("click", () => {
          modal.showModal();
        });
        // Handle close button
        modal_close_button.addEventListener("click", () => {
          modal.close();
        });
      }
    });

    // Close on outside click for all modals
    const modals = document.querySelectorAll("[data-modal]");
    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.close();
        }
      });
    });
  }
}

// Initialize on initial page load
document.addEventListener("DOMContentLoaded", () => {
  dd_modal();
});

function dd_navigation() {

    const dd_menu_toggle = document.querySelector('.dd-menu__toggle');
    const dd_menu_close = document.querySelector('.dd-menu__close');
    const dd_main_menu = document.querySelector('.navigation.-main-menu');

    function dd_navigation_set_open(is_open) {
      if (dd_menu_toggle) {
        dd_menu_toggle.classList.toggle('-active', is_open);
        dd_menu_toggle.setAttribute('aria-expanded', is_open ? 'true' : 'false');
      }
      if (dd_main_menu) {
        dd_main_menu.classList.toggle('-active', is_open);
      }
      // dd_search_close() clears body.-active, so set the scroll lock after that call.
      document.body.classList.toggle('-active', is_open);
    }

    if (dd_menu_toggle) {
      dd_menu_toggle.setAttribute('aria-expanded', 'false');
      dd_menu_toggle.addEventListener('click', () => {
        const will_open = !dd_menu_toggle.classList.contains('-active');
        if (will_open && typeof dd_search_close === 'function') {
          dd_search_close();
        }
        dd_navigation_set_open(will_open);
      });
    }

    if (dd_menu_close) {
      // Used if there is a close button as part of the menu when open on mobile
      dd_menu_close.addEventListener('click', () => {
        dd_navigation_set_open(false);
      });
    }

    // Add click event listeners to menu items with children
    const menuItemsWithChildren = document.querySelectorAll('.menu-item-has-children');
    menuItemsWithChildren.forEach(item => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        if (item.classList.contains('-active')) {
          // If already active, remove it
          item.classList.remove('-active');
          item.removeAttribute('aria-expanded');
        } else {
          // Remove -active class from all other menu items with children
          menuItemsWithChildren.forEach(otherItem => {
            otherItem.classList.remove('-active');
            otherItem.removeAttribute('aria-expanded');
          });
          // Add -active class to the clicked item
          item.classList.add('-active');
          item.setAttribute('aria-expanded', 'true');
        }
        // Set focus to the clicked item for keyboard navigation
        item.focus();
      });
    });

};

// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_navigation();
});

function dd_scrolltop() {
  let scrollTO = null;
  let scrollTop = 0;

  window.addEventListener('scroll', () => {
    if (scrollTO) clearTimeout(scrollTO);
    scrollTO = setTimeout(() => {
      scrollTop = window.scrollY;

      const btn = document.querySelector('.dd-scrolltop');
      if (!btn) return;

      if (scrollTop > 5) {
        btn.classList.add('-active');
      } else {
        btn.classList.remove('-active');
      }
    }, 0);
  });
};

// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_scrolltop();
});

const DD_SEARCH_MIN_LENGTH = 2;
const DD_SEARCH_DEBOUNCE_MS = 200;
const DD_SEARCH_OVERLAY_LIMIT = 8;
const DD_SEARCH_WEIGHTS = {
  title: 10,
  headings: 6,
  description: 4,
  path: 3,
  body: 1
};

let dd_search_index_promise = null;
let dd_search_pages = null;
let dd_search_last_focus = null;
let dd_search_overlay_timer = null;
let dd_search_page_timer = null;

function dd_search_normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function dd_search_tokens(text) {
  const normalized = dd_search_normalize(text);
  return normalized ? normalized.split(/\s+/) : [];
}

function dd_search_escape(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dd_search_levenshtein(a, b) {
  if (a === b) {
    return 0;
  }
  if (!a.length) {
    return b.length;
  }
  if (!b.length) {
    return a.length;
  }
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = new Array(rows);
  for (let i = 0; i < rows; i += 1) {
    matrix[i] = new Array(cols);
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function dd_search_token_match(query_token, field_token) {
  if (query_token === field_token) {
    return 1;
  }
  if (field_token.startsWith(query_token)) {
    return 0.85;
  }
  if (query_token.startsWith(field_token) && field_token.length >= 3) {
    return 0.7;
  }
  if (query_token.length >= 3 && field_token.includes(query_token)) {
    return 0.6;
  }
  const max_distance = query_token.length >= 7 ? 2 : query_token.length >= 4 ? 1 : 0;
  if (!max_distance) {
    return 0;
  }
  if (Math.abs(query_token.length - field_token.length) > max_distance) {
    return 0;
  }
  const distance = dd_search_levenshtein(query_token, field_token);
  if (distance > max_distance) {
    return 0;
  }
  return distance === 1 ? 0.45 : 0.3;
}

function dd_search_best_token_score(query_token, field_tokens) {
  let best = 0;
  for (let i = 0; i < field_tokens.length; i += 1) {
    const score = dd_search_token_match(query_token, field_tokens[i]);
    if (score > best) {
      best = score;
    }
    if (best === 1) {
      break;
    }
  }
  return best;
}

function dd_search_prepare_pages(pages) {
  return (pages || []).map((page) => ({
    url: page.url || '',
    path: page.path || '',
    title: page.title || '',
    description: page.description || '',
    body: page.body || '',
    headings: page.headings || [],
    _title: dd_search_tokens(page.title),
    _headings: dd_search_tokens((page.headings || []).join(' ')),
    _description: dd_search_tokens(page.description),
    _path: dd_search_tokens(`${page.path || ''} ${page.url || ''}`),
    _body: dd_search_tokens(page.body)
  }));
}

function dd_search_index_url() {
  const from_dom = document.documentElement.getAttribute('data-search-index');
  if (from_dom) {
    if (from_dom.indexOf('http') === 0 || from_dom.charAt(0) === '/') {
      return from_dom;
    }
    return new URL(from_dom, `${window.location.origin}/`).pathname;
  }
  return '/search-index.json';
}

function dd_search_load_index() {
  if (dd_search_pages) {
    return Promise.resolve(dd_search_pages);
  }
  if (dd_search_index_promise) {
    return dd_search_index_promise;
  }
  dd_search_index_promise = fetch(dd_search_index_url(), { credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Search index could not be loaded.');
      }
      return response.json();
    })
    .then((data) => {
      dd_search_pages = dd_search_prepare_pages(data && data.pages);
      return dd_search_pages;
    })
    .catch((error) => {
      dd_search_index_promise = null;
      throw error;
    });
  return dd_search_index_promise;
}

function dd_search_query(pages, query) {
  const query_tokens = dd_search_tokens(query);
  if (query_tokens.length === 0) {
    return [];
  }
  const results = [];
  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    let total = 0;
    let matched = true;
    for (let t = 0; t < query_tokens.length; t += 1) {
      const token = query_tokens[t];
      const title_score = dd_search_best_token_score(token, page._title) * DD_SEARCH_WEIGHTS.title;
      const heading_score = dd_search_best_token_score(token, page._headings) * DD_SEARCH_WEIGHTS.headings;
      const description_score = dd_search_best_token_score(token, page._description) * DD_SEARCH_WEIGHTS.description;
      const path_score = dd_search_best_token_score(token, page._path) * DD_SEARCH_WEIGHTS.path;
      const body_score = dd_search_best_token_score(token, page._body) * DD_SEARCH_WEIGHTS.body;
      const token_score = Math.max(title_score, heading_score, description_score, path_score, body_score);
      if (token_score === 0) {
        matched = false;
        break;
      }
      total += token_score;
    }
    if (!matched) {
      continue;
    }
    const title_hits = query_tokens.filter((token) => dd_search_best_token_score(token, page._title) === 1).length;
    if (title_hits === query_tokens.length) {
      total *= 1.25;
    }
    results.push({
      path: page.path || '/',
      title: page.title,
      description: page.description || '',
      score: total
    });
  }
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return results;
}

function dd_search_set_status(el, text) {
  if (el) {
    el.textContent = text;
  }
}

function dd_search_page_query() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

function dd_search_results_href(query) {
  return `/search/?q=${encodeURIComponent(query)}`;
}

function dd_search_overlay_el() {
  return document.querySelector('.dd-search');
}

function dd_search_toggle_el() {
  return document.querySelector('.dd-search__toggle');
}

function dd_search_render_list(results_el, results, options) {
  const prefix = options.prefix;
  const limit = options.limit || results.length;
  const shown = results.slice(0, limit);
  let html = '';
  for (let i = 0; i < shown.length; i += 1) {
    const result = shown[i];
    html += `<li class="${prefix}__result">`;
    html += `<a class="${prefix}__result-link" href="${dd_search_escape(result.path)}">`;
    html += `<span class="${prefix}__result-title">${dd_search_escape(result.title)}</span>`;
    if (result.description) {
      html += `<span class="${prefix}__result-description">${dd_search_escape(result.description)}</span>`;
    }
    html += '</a></li>';
  }
  if (results_el) {
    results_el.innerHTML = html;
    if (shown.length) {
      results_el.removeAttribute('hidden');
    } else {
      results_el.setAttribute('hidden', '');
    }
  }
  const more_el = options.more_el;
  if (more_el) {
    if (options.more_href && results.length > shown.length) {
      more_el.innerHTML = `<a class="${prefix}__more-link" href="${dd_search_escape(options.more_href)}">View all ${results.length} results</a>`;
      more_el.removeAttribute('hidden');
    } else {
      more_el.innerHTML = '';
      more_el.setAttribute('hidden', '');
    }
  }
}

function dd_search_set_invalid(input, is_invalid) {
  if (!input) {
    return;
  }
  if (is_invalid) {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }
}

function dd_search_focus_result(link) {
  if (!link) {
    return;
  }
  link.focus();
  if (typeof link.scrollIntoView === 'function') {
    link.scrollIntoView({ block: 'nearest' });
  }
}

function dd_search_open() {
  const overlay = dd_search_overlay_el();
  const toggle = dd_search_toggle_el();
  const input = overlay ? overlay.querySelector('.dd-search__input') : null;
  const menu_toggle = document.querySelector('.dd-menu__toggle');
  const menu = document.querySelector('.navigation.-main-menu');
  if (!overlay || typeof overlay.showModal !== 'function') {
    return;
  }
  dd_search_last_focus = document.activeElement;
  if (!overlay.open) {
    overlay.showModal();
  }
  document.body.classList.add('-active');
  if (toggle) {
    toggle.classList.add('-active');
    toggle.setAttribute('aria-expanded', 'true');
  }
  if (menu_toggle) {
    menu_toggle.classList.remove('-active');
    menu_toggle.setAttribute('aria-expanded', 'false');
  }
  if (menu) {
    menu.classList.remove('-active');
  }
  dd_search_load_index().catch(() => {});
  if (input) {
    input.focus();
    input.select();
  }
}

function dd_search_close() {
  const overlay = dd_search_overlay_el();
  // Toggle the -active class on the body
  document.body.classList.remove('-active');
  if (overlay && overlay.open) {
    overlay.close();
  }
}

function dd_search_on_closed() {
  const overlay = dd_search_overlay_el();
  const toggle = dd_search_toggle_el();
  const input = overlay ? overlay.querySelector('.dd-search__input') : null;
  document.body.classList.remove('-active-search');
  if (toggle) {
    toggle.classList.remove('-active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  dd_search_set_invalid(input, false);
  const restore = dd_search_last_focus && typeof dd_search_last_focus.focus === 'function'
    ? dd_search_last_focus
    : toggle;
  dd_search_last_focus = null;
  if (restore) {
    restore.focus();
  }
}

function dd_search_run_overlay(query) {
  const overlay = dd_search_overlay_el();
  if (!overlay) {
    return;
  }
  const results_el = overlay.querySelector('.dd-search__results');
  const status_el = overlay.querySelector('.dd-search__status');
  const more_el = overlay.querySelector('.dd-search__more');
  const input = overlay.querySelector('.dd-search__input');
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    dd_search_set_invalid(input, false);
    dd_search_render_list(results_el, [], { prefix: 'dd-search', more_el });
    dd_search_set_status(status_el, '');
    return;
  }
  if (trimmed.length < DD_SEARCH_MIN_LENGTH) {
    dd_search_render_list(results_el, [], { prefix: 'dd-search', more_el });
    dd_search_set_status(status_el, 'Type at least 2 characters.');
    return;
  }
  dd_search_set_invalid(input, false);
  dd_search_set_status(status_el, 'Searching…');
  dd_search_load_index()
    .then((pages) => {
      const results = dd_search_query(pages, trimmed);
      dd_search_render_list(results_el, results, {
        prefix: 'dd-search',
        limit: DD_SEARCH_OVERLAY_LIMIT,
        more_el,
        more_href: results.length > DD_SEARCH_OVERLAY_LIMIT ? dd_search_results_href(trimmed) : ''
      });
      if (!results.length) {
        dd_search_set_status(status_el, `No results for “${trimmed}”.`);
        return;
      }
      const shown = Math.min(results.length, DD_SEARCH_OVERLAY_LIMIT);
      const extra = results.length > shown ? ` Showing ${shown}.` : '';
      dd_search_set_status(status_el, `${results.length} result${results.length === 1 ? '' : 's'} for “${trimmed}”.${extra}`);
    })
    .catch(() => {
      dd_search_render_list(results_el, [], { prefix: 'dd-search', more_el });
      dd_search_set_status(status_el, 'Search is unavailable. Try again later.');
    });
}

function dd_search_sync_page_heading(query) {
  const heading = document.querySelector('.dd-search-page__title');
  const trimmed = String(query || '').trim();
  const title = trimmed ? `Search results for “${trimmed}”` : 'Search';
  if (heading) {
    heading.textContent = title;
  }
  if (document.querySelector('.dd-search-page')) {
    document.title = `${title} | ldnddev`;
  }
}

function dd_search_run_page(query) {
  const page = document.querySelector('.dd-search-page');
  if (!page) {
    return;
  }
  const results_el = page.querySelector('.dd-search-page__results');
  const status_el = page.querySelector('.dd-search-page__status');
  const input = page.querySelector('.dd-search-page__input');
  const trimmed = String(query || '').trim();
  if (input && input.value !== query) {
    input.value = query;
  }
  dd_search_sync_page_heading(trimmed);
  if (!trimmed) {
    dd_search_set_invalid(input, false);
    dd_search_render_list(results_el, [], { prefix: 'dd-search-page' });
    dd_search_set_status(status_el, 'Enter a search term to find pages on this site.');
    return;
  }
  if (trimmed.length < DD_SEARCH_MIN_LENGTH) {
    dd_search_render_list(results_el, [], { prefix: 'dd-search-page' });
    dd_search_set_status(status_el, 'Type at least 2 characters.');
    return;
  }
  dd_search_set_invalid(input, false);
  dd_search_set_status(status_el, 'Searching…');
  dd_search_load_index()
    .then((pages) => {
      const results = dd_search_query(pages, trimmed);
      dd_search_render_list(results_el, results, {
        prefix: 'dd-search-page',
        limit: results.length
      });
      if (!results.length) {
        dd_search_set_status(status_el, `No results for “${trimmed}”.`);
        return;
      }
      dd_search_set_status(status_el, `${results.length} result${results.length === 1 ? '' : 's'} for “${trimmed}”.`);
    })
    .catch(() => {
      dd_search_render_list(results_el, [], { prefix: 'dd-search-page' });
      dd_search_set_status(status_el, 'Search is unavailable. Try again later.');
    });
}

function dd_search_update_page_url(query) {
  const url = new URL(window.location.href);
  const trimmed = String(query || '').trim();
  if (trimmed) {
    url.searchParams.set('q', trimmed);
  } else {
    url.searchParams.delete('q');
  }
  window.history.replaceState({}, '', url);
}

function dd_search_bind_overlay() {
  const overlay = dd_search_overlay_el();
  const toggle = dd_search_toggle_el();
  if (!overlay || overlay.getAttribute('data-search-initialized') === 'true') {
    return;
  }
  overlay.setAttribute('data-search-initialized', 'true');
  if (toggle) {
    toggle.setAttribute('aria-expanded', overlay.open ? 'true' : 'false');
    toggle.setAttribute('aria-controls', overlay.id || 'dd-search');
    toggle.setAttribute('aria-haspopup', 'dialog');
  }

  const close_btn = overlay.querySelector('.dd-search__close');
  const form = overlay.querySelector('.dd-search__form');
  const input = overlay.querySelector('.dd-search__input');
  const results_el = overlay.querySelector('.dd-search__results');

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (overlay.open) {
        dd_search_close();
      } else {
        dd_search_open();
      }
    });
  }
  if (close_btn) {
    close_btn.addEventListener('click', () => {
      dd_search_close();
    });
  }
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      dd_search_close();
    }
  });
  overlay.addEventListener('close', () => {
    dd_search_on_closed();
  });
  if (form) {
    form.addEventListener('submit', (event) => {
      const value = input ? input.value.trim() : '';
      if (value.length < DD_SEARCH_MIN_LENGTH) {
        event.preventDefault();
        dd_search_set_invalid(input, true);
        dd_search_run_overlay(value);
      }
    });
  }
  if (input) {
    input.addEventListener('input', () => {
      window.clearTimeout(dd_search_overlay_timer);
      dd_search_overlay_timer = window.setTimeout(() => {
        dd_search_run_overlay(input.value);
      }, DD_SEARCH_DEBOUNCE_MS);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') {
        return;
      }
      const links = results_el ? results_el.querySelectorAll('.dd-search__result-link') : [];
      if (!links.length) {
        return;
      }
      event.preventDefault();
      dd_search_focus_result(links[0]);
    });
  }
  if (results_el) {
    results_el.addEventListener('keydown', (event) => {
      const links = Array.prototype.slice.call(results_el.querySelectorAll('.dd-search__result-link'));
      const index = links.indexOf(document.activeElement);
      if (index < 0) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        dd_search_focus_result(links[Math.min(index + 1, links.length - 1)]);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (index <= 0 && input) {
          input.focus();
        } else {
          dd_search_focus_result(links[index - 1]);
        }
      }
    });
  }
}

function dd_search_bind_page() {
  const page = document.querySelector('.dd-search-page');
  if (!page || page.getAttribute('data-search-page-initialized') === 'true') {
    return;
  }
  page.setAttribute('data-search-page-initialized', 'true');
  const form = page.querySelector('.dd-search-page__form');
  const input = page.querySelector('.dd-search-page__input');
  const initial = dd_search_page_query();
  if (input) {
    input.value = initial;
  }
  dd_search_run_page(initial);
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input ? input.value.trim() : '';
      if (value.length < DD_SEARCH_MIN_LENGTH) {
        dd_search_set_invalid(input, true);
        dd_search_run_page(value);
        return;
      }
      dd_search_update_page_url(value);
      dd_search_run_page(value);
    });
  }
  if (input) {
    input.addEventListener('input', () => {
      window.clearTimeout(dd_search_page_timer);
      dd_search_page_timer = window.setTimeout(() => {
        dd_search_update_page_url(input.value);
        dd_search_run_page(input.value);
      }, DD_SEARCH_DEBOUNCE_MS);
    });
  }
}

function dd_search() {
  dd_search_bind_overlay();
  dd_search_bind_page();
}

document.addEventListener('DOMContentLoaded', () => {
  dd_search();
});

function dd_slider() {
  const sliders = document.querySelectorAll('.dd-slider');

  if (!sliders.length) {
    return;
  }

  sliders.forEach((sliderContainer) => {
    const slides = sliderContainer.querySelectorAll('.dd-slider__item');
    const prevBtn = sliderContainer.querySelector('.dd-slider__previous');
    const nextBtn = sliderContainer.querySelector('.dd-slider__next');
    const tabsContainer = sliderContainer.querySelector('.dd-slider__tabs');

    if (!slides.length) {
      return;
    }

    let currentSlide = 0;
    const sliderId = sliderContainer.dataset.sliderId || Math.random().toString(36).substr(2, 9);
    sliderContainer.dataset.sliderId = sliderId;

    function createTabs() {
      if (!tabsContainer) return;
      tabsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = i + 1;
        button.addEventListener('click', () => {
          currentSlide = i;
          showSlide(currentSlide);
        });
        li.appendChild(button);
        tabsContainer.appendChild(li);
      });
    }

    function updateTabs() {
      if (!tabsContainer) return;
      const tabListButton = tabsContainer.querySelectorAll('button');
      tabListButton.forEach((btn, i) => {
        btn.classList.toggle('-current', i === currentSlide);
      });
    }

    function showSlide(index) {
      const position = (0 - index) * 100;
      slides.forEach((slide, i) => {
        slide.style.left = `${position}%`;
        slide.classList.toggle('-current', i === index);
      });
      updateTabs();
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }

    createTabs();
    updateTabs();

    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }

    sliderContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dd_slider();
});

function dd_tabs() {
  const tabsContainers = document.querySelectorAll('.dd-tabs');

  tabsContainers.forEach(container => {
    const links = container.querySelectorAll('.dd-tabs__menu-link');
    const items = container.querySelectorAll('.dd-tabs__item');

    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('aria-controls');
        const targetItem = container.querySelector(`#${targetId}`);

        // Remove active from all links and items in this container
        links.forEach(l => {
          l.classList.remove('-active');
          l.setAttribute('aria-selected', 'false');
        });
        items.forEach(item => {
          item.classList.remove('-active');
          item.setAttribute('aria-hidden', 'true');
        });

        // Add active to clicked link and corresponding item
        this.classList.add('-active');
        this.setAttribute('aria-selected', 'true');
        targetItem.classList.add('-active');
        targetItem.setAttribute('aria-hidden', 'false');
      });
    });
  });
}

// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_tabs();
});


function dd_video() {
  // Work grid video hover setting
  document.querySelectorAll('.dd-work_grid__item').forEach(container => {
    const video = container.querySelector('video');
    if (video) {
      video.removeAttribute('autoplay');
      container.addEventListener('mouseenter', () => {
        video.play();
      });
      container.addEventListener('mouseleave', () => {
        video.pause();
        video.load();
      });
    }
  });
}
// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_video();
});

function dd_window_scroll() {
  /**
   * Window scroll trigger. Bind to scrollEnd to use.
   * example. window.addEventListener('scrollEnd', function () {});
   **/
  window.addEventListener('scroll', function () {
    if (window.scrollTO) clearTimeout(window.scrollTO);
    window.scrollTO = setTimeout(function () {
      window.dispatchEvent(new Event('scrollEnd'));
    }, 0);
  });
}

// Initialize on initial page load
document.addEventListener('DOMContentLoaded', () => {
  dd_window_scroll();
});

/**
* all document ready functions
**/
document.addEventListener('DOMContentLoaded', () => {

  window.ddSal = sal({
    // Global settings:
    root: null, // IntersectionObserver root; null = viewport
    rootMargin: '0% 0%', // grow/shrink the root bounding box
    threshold: 0.1, // fire when this fraction of the element is visible
    animateClassName: 'sal-animate', // class applied on animation
    disabledClassName: 'sal-disabled', // class applied to body when disabled
    enterEventName: 'sal:in',
    exitEventName: 'sal:out',
    selector: '[data-sal]', // elements to observe
    once: true, // whether animation should happen only once
    // Honor prefers-reduced-motion (WCAG 2.2 2.3.3)
    disabled: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

});
