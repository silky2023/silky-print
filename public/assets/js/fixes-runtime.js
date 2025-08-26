(function () {
  'use strict';

  // Runtime DOM fixes for 2014.html to clean up markdown-like bold and format numeric outputs
  function replaceMarkdownBold(root) {
    var nodes = root.querySelectorAll('p, div, span, label');
    nodes.forEach(function (el) {
      if (!el.innerHTML) return;
      if (el.innerHTML.indexOf('**') === -1) return;
      // replace **bold** with <strong>bold</strong>
      el.innerHTML = el.innerHTML.replace(/\*\*(.+?)\*\*/g, function (_, m) {
        return '<strong>' + m + '</strong>';
      });
    });
  }

  function formatDisplayedNumbers() {
    var els = document.querySelectorAll('#sub-total-price, #profit-value, #total-price');
    els.forEach(function (el) {
      var txt = el.textContent || el.innerText || '';
      var num = parseFloat(txt.replace(/[^0-9.+-]/g, ''));
      if (!isFinite(num)) return;
      if (window.utils && typeof window.utils.formatNumber === 'function') {
        // keep currency suffix
        var suffix = txt.replace(/[-0-9.,\s٪جنيه+]+/g, '').trim();
        var formatted = window.utils.formatNumber(num, 2) + (suffix ? ' ' + suffix : '');
        el.textContent = formatted;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      replaceMarkdownBold(document);
      formatDisplayedNumbers();

      // observe results-breakdown to reformat numbers and fix markdown inserted later
      var results = document.getElementById('results-breakdown');
      if (results) {
        var obs = new MutationObserver(function (mutations) {
          replaceMarkdownBold(results);
          formatDisplayedNumbers();
        });
        obs.observe(results, { childList: true, subtree: true, characterData: true });
      }

      // Observe profit input to reformat on change
      var profitInput = document.getElementById('profitPercentage');
      if (profitInput) profitInput.addEventListener('input', formatDisplayedNumbers);

    } catch (e) {
      console.error('fixes-runtime error', e);
    }
  });
})();
