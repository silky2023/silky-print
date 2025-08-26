/* Begin file content */
// app.js - ربط الواجهة بالـ layout helpers وحساب تكاليف بسيطة
// مبني ليتكامل مع الملفات المقسمة: index.html + components/* + layout.js

(function () {
  const $ = (id) => document.getElementById(id);

  // Simple UI navigation (wizard)
  let currentStep = 1;
  const totalSteps = 3;
  function showStep(n) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const stepEl = document.getElementById('step' + n);
    if (stepEl) stepEl.classList.add('active');
    document.querySelectorAll('.wizard-nav-link').forEach(l => l.classList.remove('active'));
    const nav = document.querySelector('.wizard-nav-link[data-step="' + n + '"]');
    if (nav) nav.classList.add('active');
    $('prevBtn').style.display = (n === 1) ? 'none' : 'inline-block';
    $('nextBtn').textContent = (n === totalSteps) ? 'حساب' : 'التالي';
    currentStep = n;
  }
  document.addEventListener('click', function (e) {
    if (e.target.matches('#nextBtn')) {
      if (currentStep < totalSteps) showStep(currentStep + 1);
      else calculateAndRender();
    }
    if (e.target.matches('#prevBtn')) showStep(Math.max(1, currentStep - 1));
    if (e.target.matches('.wizard-nav-link')) {
      e.preventDefault();
      const s = parseInt(e.target.getAttribute('data-step') || '1', 10);
      showStep(s);
    }
  });

  // Populate selects with some defaults
  function fillSelects() {
    const paperTypes = ['أوفست', 'كاوتشوك', 'كرافت', 'جلاسيه'];
    const gramOptions = [70, 80, 90, 120, 150, 200, 300];
    const selPaper = $('paperType');
    const selCoverPaper = $('coverPaperType');
    [selPaper, selCoverPaper].forEach(sel => {
      if (!sel) return;
      sel.innerHTML = paperTypes.map(p => `<option value="${p}">${p}</option>`).join('');
    });
    const selGram = $('paperGrammage');
    const selCoverGram = $('coverPaperGrammage');
    [selGram, selCoverGram].forEach(sel => {
      if (!sel) return;
      sel.innerHTML = gramOptions.map(g => `<option value="${g}">${g} جم</option>`).join('');
    });
  }

  // Simple pricing model (placeholder) — يحسب سعر تقريبي بناءً على المساحة والكمية
  function estimateSheetCost(sheetWidthCm, sheetHeightCm, paperGsm) {
    // سعر افتراضي لكل متر مربع حسب الجراماج
    const basePerM2 = 15 + (paperGsm - 80) * 0.04; // مجرد نموذج
    const areaM2 = (sheetWidthCm / 100) * (sheetHeightCm / 100);
    return Math.max(0.01, basePerM2 * areaM2);
  }

  function calculateAndRender() {
    // اقرأ القيم الأساسية
    const qty = parseFloat($('bookCount').value || 100);
    const pages = parseFloat($('bookPages').value || 64);
    const internalSheet = $('sheetSize').value || 'kamel';
    const coverEnabled = $('enableCover') ? $('enableCover').checked : true;

    // اختار sheet dimensions من helpers أو افتراض
    let sheetW = 100, sheetH = 70, gram = parseFloat($('paperGrammage').value || 80);
    if (window.layoutHelpers && window.layoutHelpers.layoutSheets) {
      const ls = window.layoutHelpers.layoutSheets[internalSheet] || window.layoutHelpers.mainSheet;
      sheetW = ls.width || sheetW; sheetH = ls.height || sheetH;
    }

    const sheetCost = estimateSheetCost(sheetW, sheetH, gram);
    // افتراض: كل ورق داخلي يحتاج pageCount/4 sheets (تجميع في 4 صفحات للفرخ)
    const sheetsPerBook = Math.max(1, Math.ceil((pages) / 4));
    const totalSheetsNeeded = sheetsPerBook * qty;
    const sheetsPerPress = Math.max(1, Math.floor((sheetW * sheetH) / (10 * 15))); // مجرد تقريبي
    const pressRuns = Math.ceil(totalSheetsNeeded / sheetsPerPress);
    const internalCost = sheetCost * pressRuns;

    let coverCost = 0;
    if (coverEnabled) {
      const coverSheet = $('coverSheetSelect') ? $('coverSheetSelect').value : 'kamel';
      let cW = sheetW, cH = sheetH, cGram = parseFloat($('coverPaperGrammage').value || 200);
      if (window.layoutHelpers && window.layoutHelpers.layoutSheets) {
        const ls2 = window.layoutHelpers.layoutSheets[coverSheet] || window.layoutHelpers.mainSheet;
        cW = ls2.width || cW; cH = ls2.height || cH;
      }
      coverCost = estimateSheetCost(cW, cH, cGram) * Math.max(1, Math.ceil(qty / 100));
    }

    const subtotal = parseFloat((internalCost + coverCost).toFixed(2));
    const profitPerc = parseFloat($('profitPercentage').value || 25);
    const profitValue = +(subtotal * (profitPerc / 100)).toFixed(2);
    const total = +(subtotal + profitValue).toFixed(2);

    // Render results
    const breakdown = $('results-breakdown');
    breakdown.innerHTML = '';
    const rows = [
      { label: 'تكلفة الورق والتشغيل (تقريبي)', value: internalCost.toFixed(2) + ' جنيه' },
      { label: 'تكلفة الغلاف (تقريبي)', value: coverCost.toFixed(2) + ' جنيه' }
    ];
    rows.forEach(r => {
      const div = document.createElement('div'); div.className = 'cost-item';
      div.innerHTML = `<div class="cost-label">${r.label}</div><div class="cost-value">${r.value}</div>`;
      breakdown.appendChild(div);
    });

    $('sub-total-price').textContent = subtotal.toFixed(2) + ' جنيه';
    $('profit-value').textContent = '+' + profitValue.toFixed(2) + ' جنيه';
    $('total-price').textContent = total.toFixed(2) + ' جنيه';

    // Visuals: show a simple sheet arrangement for internal
    const internalVisuals = $('internal_layout_visuals');
    if (internalVisuals && window.layoutHelpers) {
      internalVisuals.innerHTML = '';
      const arr = window.layoutHelpers.findBestCardArrangement(sheetW, sheetH, 14, 21);
      const v = window.layoutHelpers.createVisual({ positions: arr.positions, width: sheetW, height: sheetH, gripperOrientation: 'horizontal', gripperFits: true }, 'توزيع داخلي', 'sheet', null, true);
      internalVisuals.appendChild(v);
    }

    // Cover visual
    const coverVisuals = $('cover_layout_visuals');
    if (coverVisuals && window.layoutHelpers) {
      coverVisuals.innerHTML = '';
      const arr2 = window.layoutHelpers.findBestCardArrangement(sheetW, sheetH, 28, 21);
      const v2 = window.layoutHelpers.createVisual({ positions: arr2.positions, width: sheetW, height: sheetH, gripperOrientation: 'horizontal', gripperFits: true }, 'توزيع الغلاف', 'card', null, true);
      coverVisuals.appendChild(v2);
    }

    // Scroll to results
    document.getElementById('results-card').scrollIntoView({ behavior: 'smooth' });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    if ($('profitPercentage')) $('profitPercentage').addEventListener('change', calculateAndRender);
    fillSelects();
    showStep(1);
  });

  // expose for debugging
  window.app = { calculateAndRender };
})();
/* End file content */