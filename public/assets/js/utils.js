(function () {
  'use strict';

  // Utility helpers for 2014.html refactor - safe numeric parsing, formatting and small helpers
  // Usage: include public/assets/js/utils.js before other scripts and call window.utils.safeNum(idOrEl)

  function safeNum(elOrId) {
    var el = (typeof elOrId === 'string') ? document.getElementById(elOrId) : elOrId;
    if (!el) return 0;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : 0;
  }

  function formatNumber(value, decimals) {
    decimals = (typeof decimals === 'number') ? decimals : 1;
    if (!isFinite(value)) return '0';
    var s = Number(value).toFixed(decimals);
    return s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function generateDimensionExamples(options) {
    var list = [];
    var d = options.delta || 0;
    if (options.isHeightPreferred) {
      if (options.baseLVal > 0 && (options.baseLVal - d) > 0) list.push('طول القاعدة من ' + Math.round(options.baseLVal) + ' إلى ' + Math.round(options.baseLVal - d) + ' سم');
      if (options.depthVal > 0 && (options.depthVal - d) > 0) list.push('الارتفاع من ' + Math.round(options.depthVal) + ' إلى ' + Math.round(options.depthVal - d) + ' سم');
    } else {
      if (options.baseWVal > 0 && (options.baseWVal - d) > 0) list.push('عرض القاعدة من ' + Math.round(options.baseWVal) + ' إلى ' + Math.round(options.baseWVal - d) + ' سم');
      if (options.depthVal > 0 && (options.depthVal - d) > 0) list.push('الارتفاع من ' + Math.round(options.depthVal) + ' إلى ' + Math.round(options.depthVal - d) + ' سم');
    }
    return list;
  }

  function computeDeltaBox(itemW, itemH, dimLabel) {
    var reference = (dimLabel === 'الطول') ? Math.round(itemH) : Math.round(itemW);
    var rawDelta = Math.max(1, reference - 17);
    var maxAllowed = Math.max(1, Math.floor(reference * 0.2));
    return Math.min(rawDelta, maxAllowed);
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Expose helpers
  window.utils = {
    safeNum: safeNum,
    formatNumber: formatNumber,
    clamp: clamp,
    generateDimensionExamples: generateDimensionExamples,
    computeDeltaBox: computeDeltaBox,
    escapeHtml: escapeHtml
  };
})();
