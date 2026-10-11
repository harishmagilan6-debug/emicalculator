/**
 * EMI NOVA — Smart Loan Calculator
 * Full-featured Financial Engine, Visual Analytics, and Interactive Simulation
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. State Management & Constants
  // --------------------------------------------------------------------------
  const PRESETS = {
    home: {
      amount: 4500000,
      rate: 8.4,
      tenureYears: 20,
      label: 'Home Loan',
      status: 'Competitive Home Rate'
    },
    personal: {
      amount: 500000,
      rate: 11.5,
      tenureYears: 5,
      label: 'Personal Loan',
      status: 'Standard Unsecured Rate'
    },
    car: {
      amount: 1200000,
      rate: 9.0,
      tenureYears: 5,
      label: 'Car Loan',
      status: 'Vehicle Finance Rate'
    },
    education: {
      amount: 2000000,
      rate: 9.5,
      tenureYears: 8,
      label: 'Education Loan',
      status: 'Student Loan Rate'
    }
  };

  const STATE = {
    amount: 4500000,
    rate: 8.4,
    tenureUnit: 'years', // 'years' | 'months'
    tenureValue: 20,     // current value in active unit
    tenureMonths: 240,   // always normalized in months
    extraPayment: 5000,
    scheduleViewMode: 'yearly', // 'yearly' | 'monthly'
    searchQuery: '',
    expandedYears: new Set([1]), // default Year 1 expanded
    theme: 'dark'
  };

  // Cached Calculation Results
  let currentResults = null;
  let currentAmortization = null;

  // Chart Instances
  let doughnutChart = null;
  let trendChart = null;

  // --------------------------------------------------------------------------
  // 2. DOM Elements Selection
  // --------------------------------------------------------------------------
  const dom = {
    // Theme & Navigation
    html: document.documentElement,
    themeToggle: document.getElementById('themeToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileDrawer: document.getElementById('mobileDrawer'),
    navLinks: document.querySelectorAll('.nav-link, .mobile-link'),

    // Preset buttons
    presetBtns: document.querySelectorAll('.preset-btn'),

    // Inputs & Sliders
    loanAmountInput: document.getElementById('loanAmountInput'),
    loanAmountSlider: document.getElementById('loanAmountSlider'),
    amountInWords: document.getElementById('amountInWords'),
    amountError: document.getElementById('amountError'),

    interestRateInput: document.getElementById('interestRateInput'),
    interestRateSlider: document.getElementById('interestRateSlider'),
    rateStatusTag: document.getElementById('rateStatusTag'),
    rateError: document.getElementById('rateError'),

    tenureInput: document.getElementById('tenureInput'),
    tenureSlider: document.getElementById('tenureSlider'),
    tenureUnitLabel: document.getElementById('tenureUnitLabel'),
    tenureSliderScale: document.getElementById('tenureSliderScale'),
    unitYearsBtn: document.getElementById('unitYearsBtn'),
    unitMonthsBtn: document.getElementById('unitMonthsBtn'),
    tenureError: document.getElementById('tenureError'),

    btnCalculate: document.getElementById('btnCalculate'),
    btnReset: document.getElementById('btnReset'),

    // Hero Live Preview
    heroPreviewEmi: document.getElementById('heroPreviewEmi'),

    // Main Results Display
    resultMonthlyEmi: document.getElementById('resultMonthlyEmi'),
    resultEmiDecimals: document.getElementById('resultEmiDecimals'),
    resultDailyEquiv: document.getElementById('resultDailyEquiv'),
    emiCardTenureText: document.getElementById('emiCardTenureText'),
    resultPrincipalAmount: document.getElementById('resultPrincipalAmount'),
    resultPrincipalPct: document.getElementById('resultPrincipalPct'),
    resultTotalInterest: document.getElementById('resultTotalInterest'),
    resultInterestPct: document.getElementById('resultInterestPct'),
    resultTotalRepayment: document.getElementById('resultTotalRepayment'),
    resultTenureCount: document.getElementById('resultTenureCount'),
    resultRatio: document.getElementById('resultRatio'),
    resultRatioInsight: document.getElementById('resultRatioInsight'),

    // Chart & Proportional Bar
    emiDoughnutChart: document.getElementById('emiDoughnutChart'),
    chartCenterAmount: document.getElementById('chartCenterAmount'),
    legendPrincipalVal: document.getElementById('legendPrincipalVal'),
    legendInterestVal: document.getElementById('legendInterestVal'),
    barFillPrincipal: document.getElementById('barFillPrincipal'),
    barFillInterest: document.getElementById('barFillInterest'),
    barPrincipalPctText: document.getElementById('barPrincipalPctText'),
    barInterestPctText: document.getElementById('barInterestPctText'),
    monthlyInsightText: document.getElementById('monthlyInsightText'),

    // Prepayment Simulator
    extraPaymentInput: document.getElementById('extraPaymentInput'),
    extraPaymentSlider: document.getElementById('extraPaymentSlider'),
    extraAmountTag: document.getElementById('extraAmountTag'),
    prepaySavingsAmount: document.getElementById('prepaySavingsAmount'),
    prepaySavingsSub: document.getElementById('prepaySavingsSub'),
    prepayRevisedTenure: document.getElementById('prepayRevisedTenure'),
    prepayTenureSaved: document.getElementById('prepayTenureSaved'),
    prepayRevisedInterest: document.getElementById('prepayRevisedInterest'),
    prepayOriginalInterest: document.getElementById('prepayOriginalInterest'),
    compOrigMonths: document.getElementById('compOrigMonths'),
    compRevisedMonths: document.getElementById('compRevisedMonths'),
    compRevFill: document.getElementById('compRevFill'),

    // Smart Insights
    insightBurdenBadge: document.getElementById('insightBurdenBadge'),
    insightBurdenDesc: document.getElementById('insightBurdenDesc'),
    insightBurdenPill: document.getElementById('insightBurdenPill'),
    tenureMatrixList: document.getElementById('tenureMatrixList'),
    rateSensitivityDesc: document.getElementById('rateSensitivityDesc'),
    rateSensitivityGrid: document.getElementById('rateSensitivityGrid'),

    // Amortization Schedule
    amortizationTrendChart: document.getElementById('amortizationTrendChart'),
    viewYearlyBtn: document.getElementById('viewYearlyBtn'),
    viewMonthlyBtn: document.getElementById('viewMonthlyBtn'),
    amortSearchInput: document.getElementById('amortSearchInput'),
    amortTable: document.getElementById('amortTable'),
    amortTableBody: document.getElementById('amortTableBody'),
    amortTableFooterInfo: document.getElementById('amortTableFooterInfo'),

    // Action Buttons
    btnCopySummary: document.getElementById('btnCopySummary'),
    btnShareSummary: document.getElementById('btnShareSummary'),
    btnPrintSummary: document.getElementById('btnPrintSummary'),
    btnPrintSummary2: document.getElementById('btnPrintSummary2'),
    btnDownloadCsv: document.getElementById('btnDownloadCsv'),
    btnDownloadCsv2: document.getElementById('btnDownloadCsv2'),

    // Toast & Print
    toastContainer: document.getElementById('toastContainer'),
    printDateSpan: document.getElementById('printDateSpan'),
    printSummaryBox: document.getElementById('printSummaryBox'),
    particlesCanvas: document.getElementById('particles-canvas')
  };

  // --------------------------------------------------------------------------
  // 3. Indian Currency & Number Formatting Utilities
  // --------------------------------------------------------------------------
  const inrFormatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  function formatCurrency(val, includeSymbol = true, decimals = 0) {
    if (isNaN(val) || val === null) return includeSymbol ? '₹0' : '0';
    const formatter = decimals > 0 ? inrDecimalFormatter : inrFormatter;
    const formatted = formatter.format(val);
    return includeSymbol ? `₹${formatted}` : formatted;
  }

  function formatIndianLakhCrore(amount) {
    if (amount >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
    } else if (amount >= 100000) {
      const lk = amount / 100000;
      return `₹${lk.toFixed(lk % 1 === 0 ? 0 : 2)} Lakhs`;
    } else if (amount >= 1000) {
      const th = amount / 1000;
      return `₹${th.toFixed(th % 1 === 0 ? 0 : 1)} K`;
    }
    return `₹${inrFormatter.format(amount)}`;
  }

  function parseFormattedNumber(str) {
    if (typeof str === 'number') return str;
    const clean = String(str).replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  // --------------------------------------------------------------------------
  // 4. Financial Calculation Engine
  // --------------------------------------------------------------------------
  /**
   * Calculates standard reducing-balance loan EMI and summary
   */
  function calculateLoanMetrics(principal, annualRate, tenureMonths) {
    const P = Math.max(0, principal);
    const n = Math.max(1, tenureMonths);
    const annualPct = Math.max(0, annualRate);
    const r = (annualPct / 12) / 100;

    let emi = 0;
    if (r === 0) {
      // Zero-interest loan calculation
      emi = P / n;
    } else {
      const rateFactor = Math.pow(1 + r, n);
      emi = (P * r * rateFactor) / (rateFactor - 1);
    }

    const totalRepayment = emi * n;
    const totalInterest = Math.max(0, totalRepayment - P);
    const interestRatio = P > 0 ? (totalInterest / P) * 100 : 0;
    const interestPctOfRepayment = totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0;
    const principalPctOfRepayment = totalRepayment > 0 ? (P / totalRepayment) * 100 : 0;

    return {
      principal: P,
      annualRate: annualPct,
      tenureMonths: n,
      monthlyRate: r,
      monthlyEmi: emi,
      totalRepayment,
      totalInterest,
      interestRatio,
      interestPctOfRepayment,
      principalPctOfRepayment,
      dailyEquivalent: emi / 30
    };
  }

  /**
   * Generates month-by-month and year-by-year amortization schedules
   */
  function generateAmortizationSchedule(principal, annualRate, tenureMonths, monthlyEmi) {
    const r = (annualRate / 12) / 100;
    const months = [];
    const yearly = [];

    let currentBalance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    let currentYearObj = null;

    for (let m = 1; m <= tenureMonths; m++) {
      const openingBalance = currentBalance;
      const interestPaid = r === 0 ? 0 : openingBalance * r;
      let principalPaid = monthlyEmi - interestPaid;

      // Handle final month balance reconciling
      if (m === tenureMonths || principalPaid > openingBalance) {
        principalPaid = openingBalance;
      }

      currentBalance = Math.max(0, openingBalance - principalPaid);
      cumulativeInterest += interestPaid;
      cumulativePrincipal += principalPaid;

      const totalMonthlyPayment = principalPaid + interestPaid;
      const yearIndex = Math.ceil(m / 12);

      const monthEntry = {
        monthNumber: m,
        yearNumber: yearIndex,
        openingBalance,
        principalPaid,
        interestPaid,
        totalPayment: totalMonthlyPayment,
        closingBalance: currentBalance,
        cumulativeInterest,
        cumulativePrincipal,
        loanPaidPercent: principal > 0 ? ((principal - currentBalance) / principal) * 100 : 100
      };

      months.push(monthEntry);

      // Yearly aggregation
      if (!currentYearObj || currentYearObj.year !== yearIndex) {
        currentYearObj = {
          year: yearIndex,
          openingBalance: openingBalance,
          principalPaid: 0,
          interestPaid: 0,
          totalPayment: 0,
          closingBalance: 0,
          months: [],
          loanPaidPercent: 0
        };
        yearly.push(currentYearObj);
      }

      currentYearObj.principalPaid += principalPaid;
      currentYearObj.interestPaid += interestPaid;
      currentYearObj.totalPayment += totalMonthlyPayment;
      currentYearObj.closingBalance = currentBalance;
      currentYearObj.months.push(monthEntry);
      currentYearObj.loanPaidPercent = principal > 0 ? ((principal - currentBalance) / principal) * 100 : 100;

      if (currentBalance <= 0) break;
    }

    return { months, yearly };
  }

  /**
   * Prepayment simulator with additional monthly payment
   */
  function simulatePrepayment(principal, annualRate, standardEmi, tenureMonths, extraMonthlyAmount) {
    const extra = Math.max(0, extraMonthlyAmount);
    if (extra === 0) {
      const base = calculateLoanMetrics(principal, annualRate, tenureMonths);
      return {
        extraAmount: 0,
        payoffMonths: tenureMonths,
        monthsSaved: 0,
        revisedTotalInterest: base.totalInterest,
        interestSaved: 0,
        interestSavedPct: 0,
        originalInterest: base.totalInterest
      };
    }

    const r = (annualRate / 12) / 100;
    let balance = principal;
    let monthCount = 0;
    let totalInterestPaid = 0;
    const maxMonths = tenureMonths;

    while (balance > 0 && monthCount < maxMonths * 2) {
      monthCount++;
      const interest = r === 0 ? 0 : balance * r;
      let totalPayment = standardEmi + extra;

      if (balance + interest < totalPayment) {
        totalPayment = balance + interest;
      }

      const principalPaid = totalPayment - interest;
      balance = Math.max(0, balance - principalPaid);
      totalInterestPaid += interest;

      if (balance <= 0) break;
    }

    const baseMetrics = calculateLoanMetrics(principal, annualRate, tenureMonths);
    const monthsSaved = Math.max(0, tenureMonths - monthCount);
    const interestSaved = Math.max(0, baseMetrics.totalInterest - totalInterestPaid);
    const interestSavedPct = baseMetrics.totalInterest > 0 ? (interestSaved / baseMetrics.totalInterest) * 100 : 0;

    return {
      extraAmount: extra,
      payoffMonths: monthCount,
      monthsSaved,
      revisedTotalInterest: totalInterestPaid,
      interestSaved,
      interestSavedPct,
      originalInterest: baseMetrics.totalInterest
    };
  }

  // --------------------------------------------------------------------------
  // 5. User Interface Updaters & Renderers
  // --------------------------------------------------------------------------
  /**
   * Master recalculation and sync function
   */
  function updateAllCalculations() {
    // 1. Calculate base metrics
    currentResults = calculateLoanMetrics(STATE.amount, STATE.rate, STATE.tenureMonths);

    // 2. Generate full amortization schedule
    currentAmortization = generateAmortizationSchedule(
      STATE.amount,
      STATE.rate,
      STATE.tenureMonths,
      currentResults.monthlyEmi
    );

    // 3. Render Top Results Panel
    renderResultsPanel(currentResults);

    // 4. Update Doughnut Chart & Proportional Stacked Bar
    updateDoughnutChart(currentResults);

    // 5. Run & Render Prepayment Simulator
    updatePrepaymentSimulator();

    // 6. Update Smart Insights Engine
    updateSmartInsights();

    // 7. Render Repayment Amortization Table & Trend Chart
    renderAmortizationTrendChart(currentAmortization);
    renderAmortizationTable();

    // 8. Update Hero Mini Dashboard Preview
    if (dom.heroPreviewEmi) {
      dom.heroPreviewEmi.innerHTML = `${formatCurrency(Math.round(currentResults.monthlyEmi))}<span class="per-month">/mo</span>`;
    }
  }

  function renderResultsPanel(results) {
    const emiInt = Math.floor(results.monthlyEmi);
    const emiDec = (results.monthlyEmi % 1).toFixed(2).substring(1);

    // Primary Monthly EMI Counter
    dom.resultMonthlyEmi.textContent = inrFormatter.format(emiInt);
    dom.resultEmiDecimals.textContent = emiDec;
    dom.resultDailyEquiv.textContent = `Equates to approximately ${formatCurrency(Math.round(results.dailyEquivalent))} per day`;

    const yrs = (results.tenureMonths / 12).toFixed(results.tenureMonths % 12 === 0 ? 0 : 1);
    dom.emiCardTenureText.textContent = `for ${results.tenureMonths} months (${yrs} yrs)`;

    // 4 Grid Metric Cards
    dom.resultPrincipalAmount.textContent = formatCurrency(results.principal);
    dom.resultPrincipalPct.textContent = `${results.principalPctOfRepayment.toFixed(1)}% of total`;

    dom.resultTotalInterest.textContent = formatCurrency(results.totalInterest);
    dom.resultInterestPct.textContent = `${results.interestPctOfRepayment.toFixed(1)}% of total`;

    dom.resultTotalRepayment.textContent = formatCurrency(results.totalRepayment);
    dom.resultTenureCount.textContent = `${results.tenureMonths} Monthly Payments`;

    dom.resultRatio.textContent = `${results.interestRatio.toFixed(1)}%`;

    // Ratio qualitative insight
    if (results.interestRatio < 35) {
      dom.resultRatioInsight.textContent = 'Low Interest Load';
      dom.resultRatioInsight.style.color = 'var(--accent-emerald)';
    } else if (results.interestRatio < 75) {
      dom.resultRatioInsight.textContent = 'Moderate Ratio';
      dom.resultRatioInsight.style.color = 'var(--accent-cyan)';
    } else {
      dom.resultRatioInsight.textContent = 'High Interest Load';
      dom.resultRatioInsight.style.color = 'var(--accent-amber)';
    }

    // Stacked proportional bar
    dom.barFillPrincipal.style.width = `${results.principalPctOfRepayment}%`;
    dom.barFillInterest.style.width = `${results.interestPctOfRepayment}%`;
    dom.barPrincipalPctText.textContent = `Principal: ${results.principalPctOfRepayment.toFixed(1)}%`;
    dom.barInterestPctText.textContent = `Interest: ${results.interestPctOfRepayment.toFixed(1)}%`;

    // Legend values
    dom.legendPrincipalVal.textContent = `${formatCurrency(results.principal)} (${results.principalPctOfRepayment.toFixed(1)}%)`;
    dom.legendInterestVal.textContent = `${formatCurrency(results.totalInterest)} (${results.interestPctOfRepayment.toFixed(1)}%)`;

    // Doughnut center text
    dom.chartCenterAmount.textContent = formatIndianLakhCrore(results.totalRepayment);

    // Monthly insight pill
    dom.monthlyInsightText.innerHTML = `Your monthly EMI is <strong>${formatCurrency(Math.round(results.monthlyEmi))}</strong> for <strong>${results.tenureMonths} months</strong> (${yrs} years).`;
  }

  // --------------------------------------------------------------------------
  // 6. Chart.js Implementations (Doughnut & Payoff Curve)
  // --------------------------------------------------------------------------
  function initOrGetDoughnutChart() {
    if (doughnutChart) return doughnutChart;
    if (!dom.emiDoughnutChart) return null;

    const ctx = dom.emiDoughnutChart.getContext('2d');
    const isDark = STATE.theme === 'dark';

    doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Loan Principal', 'Total Interest'],
        datasets: [{
          data: [STATE.amount, 100000],
          backgroundColor: ['#38bdf8', '#8b5cf6'],
          hoverBackgroundColor: ['#0284c7', '#7c3aed'],
          borderWidth: 0,
          borderRadius: 6,
          spacing: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: isDark ? '#f8fafc' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#334155',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            callbacks: {
              label: function (ctx) {
                const label = ctx.label || '';
                const val = ctx.raw || 0;
                return ` ${label}: ${formatCurrency(val)}`;
              }
            }
          }
        },
        animation: {
          duration: 650,
          easing: 'easeOutQuart'
        }
      }
    });

    return doughnutChart;
  }

  function updateDoughnutChart(results) {
    const chart = initOrGetDoughnutChart();
    if (!chart) return;

    chart.data.datasets[0].data = [results.principal, results.totalInterest];
    chart.update();
  }

  function initOrGetTrendChart() {
    if (trendChart) return trendChart;
    if (!dom.amortizationTrendChart) return null;

    const ctx = dom.amortizationTrendChart.getContext('2d');
    const isDark = STATE.theme === 'dark';

    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Remaining Principal Balance',
            data: [],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 6
          },
          {
            label: 'Cumulative Interest Paid',
            data: [],
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: isDark ? '#f8fafc' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#334155',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (ctx) {
                return ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDark ? '#64748b' : '#94a3b8',
              maxTicksLimit: 12
            }
          },
          y: {
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDark ? '#64748b' : '#94a3b8',
              callback: function (val) {
                return formatIndianLakhCrore(val);
              }
            }
          }
        },
        animation: {
          duration: 500
        }
      }
    });

    return trendChart;
  }

  function renderAmortizationTrendChart(amortization) {
    const chart = initOrGetTrendChart();
    if (!chart || !amortization) return;

    // Sample data points yearly to keep rendering lightning fast
    const labels = [];
    const balanceData = [];
    const interestData = [];

    // Starting point
    labels.push('Start');
    balanceData.push(STATE.amount);
    interestData.push(0);

    let cumulativeInt = 0;
    amortization.yearly.forEach((yr) => {
      labels.push(`Yr ${yr.year}`);
      balanceData.push(Math.round(yr.closingBalance));
      cumulativeInt += yr.interestPaid;
      interestData.push(Math.round(cumulativeInt));
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = balanceData;
    chart.data.datasets[1].data = interestData;
    chart.update();
  }

  // --------------------------------------------------------------------------
  // 7. Prepayment Simulator
  // --------------------------------------------------------------------------
  function updatePrepaymentSimulator() {
    const sim = simulatePrepayment(
      STATE.amount,
      STATE.rate,
      currentResults.monthlyEmi,
      STATE.tenureMonths,
      STATE.extraPayment
    );

    // Spotlight savings amount
    dom.prepaySavingsAmount.textContent = formatCurrency(Math.round(sim.interestSaved));
    dom.prepaySavingsSub.textContent = `You save ${sim.interestSavedPct.toFixed(1)}% of your overall interest!`;

    // Revised Payoff Time
    const revYears = Math.floor(sim.payoffMonths / 12);
    const revMonths = sim.payoffMonths % 12;
    dom.prepayRevisedTenure.textContent = `${revYears} Yrs ${revMonths} Mos`;

    const savedYears = Math.floor(sim.monthsSaved / 12);
    const savedMonths = sim.monthsSaved % 12;
    dom.prepayTenureSaved.textContent = `Save ${savedYears} Yrs ${savedMonths} Mos sooner`;

    // Interest Comparison
    dom.prepayRevisedInterest.textContent = formatCurrency(Math.round(sim.revisedTotalInterest));
    dom.prepayOriginalInterest.textContent = `vs ${formatCurrency(Math.round(sim.originalInterest))} original`;

    // Progress Bar comparison
    dom.compOrigMonths.textContent = `${STATE.tenureMonths} Months (${(STATE.tenureMonths / 12).toFixed(1)} Yrs)`;
    dom.compRevisedMonths.textContent = `${sim.payoffMonths} Months (Saved ${sim.monthsSaved} Mos)`;

    const fillPct = Math.min(100, Math.max(10, (sim.payoffMonths / STATE.tenureMonths) * 100));
    dom.compRevFill.style.width = `${fillPct}%`;
  }

  // --------------------------------------------------------------------------
  // 8. Smart Insights Engine
  // --------------------------------------------------------------------------
  function updateSmartInsights() {
    // 1. Interest Burden Card
    const ratio = currentResults.interestRatio;
    const intForEvery100 = Math.round(ratio);

    if (ratio < 40) {
      dom.insightBurdenBadge.textContent = 'Favorable Ratio';
      dom.insightBurdenBadge.className = 'insight-badge cyan';
    } else if (ratio < 80) {
      dom.insightBurdenBadge.textContent = 'Moderate Burden';
      dom.insightBurdenBadge.className = 'insight-badge info';
    } else {
      dom.insightBurdenBadge.textContent = 'High Interest Burden';
      dom.insightBurdenBadge.className = 'insight-badge';
    }

    dom.insightBurdenDesc.innerHTML = `For every ₹100 borrowed, you are paying <strong>₹${intForEvery100}</strong> in interest charges over the full term.`;
    dom.insightBurdenPill.textContent = `Interest is ${currentResults.interestPctOfRepayment.toFixed(1)}% of your total loan outflow`;

    // 2. Tenure Comparison Matrix (Selected vs -5 Yrs vs +5 Yrs)
    const baseYears = STATE.tenureMonths / 12;
    const variations = [];

    // Shorter tenure option
    if (baseYears >= 5) {
      const shorterYr = Math.max(1, baseYears - (baseYears > 10 ? 5 : 2));
      variations.push({ yr: shorterYr, label: `${shorterYr} Years (Shorter)` });
    }

    // Current tenure
    variations.push({ yr: baseYears, label: `${baseYears} Years (Selected)`, active: true });

    // Longer tenure option
    if (baseYears <= 25) {
      const longerYr = Math.min(30, baseYears + (baseYears < 20 ? 5 : 3));
      variations.push({ yr: longerYr, label: `${longerYr} Years (Extended)` });
    }

    let matrixHtml = '';
    variations.forEach((v) => {
      const res = calculateLoanMetrics(STATE.amount, STATE.rate, Math.round(v.yr * 12));
      const emiDiff = res.monthlyEmi - currentResults.monthlyEmi;
      const intDiff = res.totalInterest - currentResults.totalInterest;

      let badgeHtml = '';
      if (v.active) {
        badgeHtml = '<span class="matrix-diff">Current Baseline</span>';
      } else if (intDiff < 0) {
        badgeHtml = `<span class="matrix-diff save">Saves ${formatIndianLakhCrore(Math.abs(intDiff))}</span>`;
      } else {
        badgeHtml = `<span class="matrix-diff extra">+${formatIndianLakhCrore(intDiff)} Interest</span>`;
      }

      matrixHtml += `
        <div class="tenure-matrix-row ${v.active ? 'active' : ''}">
          <span class="matrix-tenure-tag">${v.label}</span>
          <span class="matrix-emi-val">${formatCurrency(Math.round(res.monthlyEmi))}/mo</span>
          ${badgeHtml}
        </div>
      `;
    });
    dom.tenureMatrixList.innerHTML = matrixHtml;

    // 3. Interest Rate Sensitivity (±0.5%)
    const rateMinus = Math.max(0, STATE.rate - 0.5);
    const ratePlus = Math.min(30, STATE.rate + 0.5);

    const resMinus = calculateLoanMetrics(STATE.amount, rateMinus, STATE.tenureMonths);
    const resPlus = calculateLoanMetrics(STATE.amount, ratePlus, STATE.tenureMonths);

    const emiDrop = currentResults.monthlyEmi - resMinus.monthlyEmi;
    const emiHike = resPlus.monthlyEmi - currentResults.monthlyEmi;

    dom.rateSensitivityDesc.textContent = `A 0.5% rate change alters your monthly outflow by approximately ${formatCurrency(Math.round(emiHike))}/month:`;

    dom.rateSensitivityGrid.innerHTML = `
      <div class="rate-sens-row">
        <span>If rate drops to <strong>${rateMinus.toFixed(2)}%</strong> (-0.5%)</span>
        <span class="text-cyan font-mono">${formatCurrency(Math.round(resMinus.monthlyEmi))}/mo</span>
        <span class="matrix-diff save">Save ${formatCurrency(Math.round(emiDrop))}/mo</span>
      </div>
      <div class="rate-sens-row">
        <span>Current: <strong>${STATE.rate.toFixed(2)}%</strong></span>
        <span class="font-mono font-bold">${formatCurrency(Math.round(currentResults.monthlyEmi))}/mo</span>
        <span class="matrix-diff">Baseline</span>
      </div>
      <div class="rate-sens-row">
        <span>If rate rises to <strong>${ratePlus.toFixed(2)}%</strong> (+0.5%)</span>
        <span class="font-mono">${formatCurrency(Math.round(resPlus.monthlyEmi))}/mo</span>
        <span class="matrix-diff extra">+${formatCurrency(Math.round(emiHike))}/mo</span>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 9. Amortization Table Renderer (Yearly + Expandable Monthly)
  // --------------------------------------------------------------------------
  function renderAmortizationTable() {
    if (!currentAmortization || !dom.amortTableBody) return;

    const query = STATE.searchQuery.toLowerCase().trim();
    let rowsHtml = '';

    if (STATE.scheduleViewMode === 'yearly') {
      let visibleYears = currentAmortization.yearly;

      if (query) {
        visibleYears = visibleYears.filter((y) =>
          `year ${y.year}`.includes(query) || `${y.year}`.includes(query)
        );
      }

      if (visibleYears.length === 0) {
        dom.amortTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
              No records match your search filter "${query}".
            </td>
          </tr>
        `;
        return;
      }

      visibleYears.forEach((yr) => {
        const isExpanded = STATE.expandedYears.has(yr.year);
        const paidPercent = yr.loanPaidPercent.toFixed(1);

        rowsHtml += `
          <tr class="year-row ${isExpanded ? 'expanded' : ''}" data-year="${yr.year}">
            <td>
              <div class="period-cell">
                <svg class="expand-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span>Year ${yr.year}</span>
              </div>
            </td>
            <td class="text-right">${formatCurrency(Math.round(yr.openingBalance))}</td>
            <td class="text-right text-cyan">${formatCurrency(Math.round(yr.principalPaid))}</td>
            <td class="text-right">${formatCurrency(Math.round(yr.interestPaid))}</td>
            <td class="text-right">${formatCurrency(Math.round(yr.totalPayment))}</td>
            <td class="text-right font-bold">${formatCurrency(Math.round(yr.closingBalance))}</td>
            <td class="table-progress-cell">
              <div class="cell-progress-track">
                <div class="cell-progress-bar" style="width: ${paidPercent}%"></div>
              </div>
              <span class="cell-progress-text">${paidPercent}% repaid</span>
            </td>
          </tr>
        `;

        // If expanded, insert 12 monthly rows below
        if (isExpanded) {
          yr.months.forEach((m) => {
            const mPaidPct = m.loanPaidPercent.toFixed(1);
            rowsHtml += `
              <tr class="month-subrow" data-parent-year="${yr.year}">
                <td style="padding-left: 2.5rem;">Month ${m.monthNumber}</td>
                <td class="text-right">${formatCurrency(Math.round(m.openingBalance))}</td>
                <td class="text-right text-cyan">${formatCurrency(Math.round(m.principalPaid))}</td>
                <td class="text-right">${formatCurrency(Math.round(m.interestPaid))}</td>
                <td class="text-right">${formatCurrency(Math.round(m.totalPayment))}</td>
                <td class="text-right">${formatCurrency(Math.round(m.closingBalance))}</td>
                <td class="table-progress-cell">
                  <span class="cell-progress-text">${mPaidPct}%</span>
                </td>
              </tr>
            `;
          });
        }
      });

      dom.amortTableFooterInfo.textContent = `Showing ${visibleYears.length} years of amortization. Click on any year row to view individual 12 monthly installments.`;
    } else {
      // Monthly view
      let visibleMonths = currentAmortization.months;
      if (query) {
        visibleMonths = visibleMonths.filter((m) =>
          `month ${m.monthNumber}`.includes(query) ||
          `m ${m.monthNumber}`.includes(query) ||
          `yr ${m.yearNumber}`.includes(query) ||
          `${m.monthNumber}`.includes(query)
        );
      }

      visibleMonths.slice(0, 180).forEach((m) => {
        const mPaidPct = m.loanPaidPercent.toFixed(1);
        rowsHtml += `
          <tr>
            <td>Month ${m.monthNumber} <span style="font-size: 0.72rem; color: var(--text-muted);">(Yr ${m.yearNumber})</span></td>
            <td class="text-right">${formatCurrency(Math.round(m.openingBalance))}</td>
            <td class="text-right text-cyan">${formatCurrency(Math.round(m.principalPaid))}</td>
            <td class="text-right">${formatCurrency(Math.round(m.interestPaid))}</td>
            <td class="text-right">${formatCurrency(Math.round(m.totalPayment))}</td>
            <td class="text-right font-bold">${formatCurrency(Math.round(m.closingBalance))}</td>
            <td class="table-progress-cell">
              <div class="cell-progress-track">
                <div class="cell-progress-bar" style="width: ${mPaidPct}%"></div>
              </div>
              <span class="cell-progress-text">${mPaidPct}%</span>
            </td>
          </tr>
        `;
      });

      dom.amortTableFooterInfo.textContent = `Showing monthly breakdown (${visibleMonths.length} installments).`;
    }

    dom.amortTableBody.innerHTML = rowsHtml;
  }

  // --------------------------------------------------------------------------
  // 10. Input Synchronization & Event Handlers
  // --------------------------------------------------------------------------
  function setupInputSynchronization() {
    // 1. Loan Amount Sync
    dom.loanAmountSlider.addEventListener('input', function () {
      const val = parseInt(this.value, 10);
      STATE.amount = val;
      dom.loanAmountInput.value = inrFormatter.format(val);
      dom.amountInWords.textContent = `${formatCurrency(val)} (${formatIndianLakhCrore(val)})`;
      dom.amountError.textContent = '';
      updateAllCalculations();
    });

    dom.loanAmountInput.addEventListener('input', function () {
      const val = parseFormattedNumber(this.value);
      if (val < 1000) {
        dom.amountError.textContent = 'Minimum loan amount is ₹1,000';
      } else if (val > 50000000) {
        dom.amountError.textContent = 'Maximum loan amount is ₹5,00,00,000 (₹5 Crore)';
      } else {
        dom.amountError.textContent = '';
      }
      STATE.amount = Math.min(50000000, Math.max(1000, val));
      dom.loanAmountSlider.value = STATE.amount;
      dom.amountInWords.textContent = `${formatCurrency(val)} (${formatIndianLakhCrore(val)})`;
      updateAllCalculations();
    });

    dom.loanAmountInput.addEventListener('blur', function () {
      this.value = inrFormatter.format(STATE.amount);
    });

    // Quick add chips for Amount
    document.querySelectorAll('[data-add-amount]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const add = parseInt(btn.getAttribute('data-add-amount'), 10);
        STATE.amount = Math.min(50000000, STATE.amount + add);
        dom.loanAmountSlider.value = STATE.amount;
        dom.loanAmountInput.value = inrFormatter.format(STATE.amount);
        dom.amountInWords.textContent = `${formatCurrency(STATE.amount)} (${formatIndianLakhCrore(STATE.amount)})`;
        dom.amountError.textContent = '';
        updateAllCalculations();
      });
    });

    document.querySelectorAll('[data-set-amount]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const setVal = parseInt(btn.getAttribute('data-set-amount'), 10);
        STATE.amount = setVal;
        dom.loanAmountSlider.value = STATE.amount;
        dom.loanAmountInput.value = inrFormatter.format(STATE.amount);
        dom.amountInWords.textContent = `${formatCurrency(STATE.amount)} (${formatIndianLakhCrore(STATE.amount)})`;
        dom.amountError.textContent = '';
        updateAllCalculations();
      });
    });

    // 2. Interest Rate Sync
    dom.interestRateSlider.addEventListener('input', function () {
      const val = parseFloat(this.value);
      STATE.rate = val;
      dom.interestRateInput.value = val.toFixed(1);
      updateRateStatusTag(val);
      dom.rateError.textContent = '';
      updateAllCalculations();
    });

    dom.interestRateInput.addEventListener('input', function () {
      const val = parseFloat(this.value);
      if (isNaN(val) || val < 0) {
        dom.rateError.textContent = 'Interest rate cannot be negative';
        return;
      }
      if (val > 30) {
        dom.rateError.textContent = 'Maximum supported interest rate is 30% p.a.';
        return;
      }
      dom.rateError.textContent = '';
      STATE.rate = val;
      dom.interestRateSlider.value = val;
      updateRateStatusTag(val);
      updateAllCalculations();
    });

    // Quick rate chips
    document.querySelectorAll('[data-set-rate]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const setRate = parseFloat(btn.getAttribute('data-set-rate'));
        STATE.rate = setRate;
        dom.interestRateSlider.value = setRate;
        dom.interestRateInput.value = setRate;
        updateRateStatusTag(setRate);
        dom.rateError.textContent = '';
        updateAllCalculations();
      });
    });

    // 3. Loan Tenure Sync & Unit Toggle
    dom.unitYearsBtn.addEventListener('click', () => setTenureUnit('years'));
    dom.unitMonthsBtn.addEventListener('click', () => setTenureUnit('months'));

    dom.tenureSlider.addEventListener('input', function () {
      const val = parseInt(this.value, 10);
      STATE.tenureValue = val;
      if (STATE.tenureUnit === 'years') {
        STATE.tenureMonths = val * 12;
      } else {
        STATE.tenureMonths = val;
      }
      dom.tenureInput.value = val;
      dom.tenureError.textContent = '';
      updateAllCalculations();
    });

    dom.tenureInput.addEventListener('input', function () {
      const val = parseInt(this.value, 10);
      if (isNaN(val) || val <= 0) {
        dom.tenureError.textContent = 'Tenure must be positive';
        return;
      }
      const maxVal = STATE.tenureUnit === 'years' ? 30 : 360;
      if (val > maxVal) {
        dom.tenureError.textContent = `Maximum tenure is ${maxVal} ${STATE.tenureUnit}`;
        return;
      }
      dom.tenureError.textContent = '';
      STATE.tenureValue = val;
      if (STATE.tenureUnit === 'years') {
        STATE.tenureMonths = val * 12;
      } else {
        STATE.tenureMonths = val;
      }
      dom.tenureSlider.value = val;
      updateAllCalculations();
    });

    // Quick tenure chips
    document.querySelectorAll('[data-set-tenure-yr]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const yrs = parseInt(btn.getAttribute('data-set-tenure-yr'), 10);
        if (STATE.tenureUnit === 'months') {
          setTenureUnit('years');
        }
        STATE.tenureValue = yrs;
        STATE.tenureMonths = yrs * 12;
        dom.tenureSlider.value = yrs;
        dom.tenureInput.value = yrs;
        dom.tenureError.textContent = '';
        updateAllCalculations();
      });
    });

    // 4. Extra Prepayment Simulator Sync
    dom.extraPaymentSlider.addEventListener('input', function () {
      const val = parseInt(this.value, 10);
      STATE.extraPayment = val;
      dom.extraPaymentInput.value = inrFormatter.format(val);
      dom.extraAmountTag.textContent = `${formatCurrency(val)} / month`;
      updatePrepaymentSimulator();
    });

    dom.extraPaymentInput.addEventListener('input', function () {
      const val = parseFormattedNumber(this.value);
      STATE.extraPayment = Math.max(0, val);
      dom.extraPaymentSlider.value = Math.min(50000, val);
      dom.extraAmountTag.textContent = `${formatCurrency(val)} / month`;
      updatePrepaymentSimulator();
    });

    dom.extraPaymentInput.addEventListener('blur', function () {
      this.value = inrFormatter.format(STATE.extraPayment);
    });

    document.querySelectorAll('[data-set-extra]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const extraVal = parseInt(btn.getAttribute('data-set-extra'), 10);
        STATE.extraPayment = extraVal;
        dom.extraPaymentSlider.value = Math.min(50000, extraVal);
        dom.extraPaymentInput.value = inrFormatter.format(extraVal);
        dom.extraAmountTag.textContent = `${formatCurrency(extraVal)} / month`;
        updatePrepaymentSimulator();
      });
    });

    // 5. Presets Handling
    dom.presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        dom.presetBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        applyPreset(btn.getAttribute('data-preset'));
      });
    });

    document.querySelectorAll('.footer-preset-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const presetKey = link.getAttribute('data-preset');
        if (presetKey && PRESETS[presetKey]) {
          applyPreset(presetKey);
          dom.presetBtns.forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-preset') === presetKey);
          });
        }
      });
    });

    // 6. Action Buttons: Reset & Calculate
    dom.btnReset.addEventListener('click', () => {
      applyPreset('home');
      dom.presetBtns.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-preset') === 'home');
      });
      showToast('Calculator parameters reset to standard defaults.');
    });

    dom.btnCalculate.addEventListener('click', () => {
      updateAllCalculations();
      // Visual feedback pulse
      dom.btnCalculate.style.transform = 'scale(0.98)';
      setTimeout(() => {
        dom.btnCalculate.style.transform = '';
      }, 150);
      showToast('Calculations updated successfully.');
    });

    // 7. Amortization Table Interactions (Expand/Collapse & View Toggles)
    dom.viewYearlyBtn.addEventListener('click', () => {
      STATE.scheduleViewMode = 'yearly';
      dom.viewYearlyBtn.classList.add('active');
      dom.viewMonthlyBtn.classList.remove('active');
      renderAmortizationTable();
    });

    dom.viewMonthlyBtn.addEventListener('click', () => {
      STATE.scheduleViewMode = 'monthly';
      dom.viewMonthlyBtn.classList.add('active');
      dom.viewYearlyBtn.classList.remove('active');
      renderAmortizationTable();
    });

    dom.amortSearchInput.addEventListener('input', function () {
      STATE.searchQuery = this.value;
      renderAmortizationTable();
    });

    // Year row click for expand/collapse
    dom.amortTableBody.addEventListener('click', (e) => {
      const yearRow = e.target.closest('.year-row');
      if (yearRow && STATE.scheduleViewMode === 'yearly') {
        const yr = parseInt(yearRow.getAttribute('data-year'), 10);
        if (STATE.expandedYears.has(yr)) {
          STATE.expandedYears.delete(yr);
        } else {
          STATE.expandedYears.add(yr);
        }
        renderAmortizationTable();
      }
    });
  }

  function setTenureUnit(unit) {
    if (STATE.tenureUnit === unit) return;
    STATE.tenureUnit = unit;

    if (unit === 'years') {
      dom.unitYearsBtn.classList.add('active');
      dom.unitMonthsBtn.classList.remove('active');
      dom.tenureUnitLabel.textContent = 'Years';
      STATE.tenureValue = Math.max(1, Math.round(STATE.tenureMonths / 12));

      dom.tenureSlider.min = '1';
      dom.tenureSlider.max = '30';
      dom.tenureSlider.step = '1';
      dom.tenureSlider.value = STATE.tenureValue;
      dom.tenureInput.value = STATE.tenureValue;
      dom.tenureInput.max = '30';

      dom.tenureSliderScale.innerHTML = `
        <span>1 Year</span>
        <span>10 Years</span>
        <span>20 Years</span>
        <span>30 Years</span>
      `;
    } else {
      dom.unitMonthsBtn.classList.add('active');
      dom.unitYearsBtn.classList.remove('active');
      dom.tenureUnitLabel.textContent = 'Months';
      STATE.tenureValue = STATE.tenureMonths;

      dom.tenureSlider.min = '12';
      dom.tenureSlider.max = '360';
      dom.tenureSlider.step = '1';
      dom.tenureSlider.value = STATE.tenureValue;
      dom.tenureInput.value = STATE.tenureValue;
      dom.tenureInput.max = '360';

      dom.tenureSliderScale.innerHTML = `
        <span>12 Mos</span>
        <span>120 Mos</span>
        <span>240 Mos</span>
        <span>360 Mos</span>
      `;
    }
    updateAllCalculations();
  }

  function updateRateStatusTag(rate) {
    if (rate === 0) {
      dom.rateStatusTag.textContent = '0% No-Cost EMI';
      dom.rateStatusTag.style.color = 'var(--accent-emerald)';
    } else if (rate <= 8.5) {
      dom.rateStatusTag.textContent = 'Prime / Low Rate';
      dom.rateStatusTag.style.color = 'var(--accent-emerald)';
    } else if (rate <= 12) {
      dom.rateStatusTag.textContent = 'Competitive Rate';
      dom.rateStatusTag.style.color = 'var(--accent-cyan)';
    } else if (rate <= 16) {
      dom.rateStatusTag.textContent = 'Standard Unsecured Rate';
      dom.rateStatusTag.style.color = 'var(--accent-amber)';
    } else {
      dom.rateStatusTag.textContent = 'High APR Loan';
      dom.rateStatusTag.style.color = 'var(--accent-rose)';
    }
  }

  function applyPreset(presetKey) {
    const config = PRESETS[presetKey] || PRESETS.home;

    STATE.amount = config.amount;
    STATE.rate = config.rate;
    STATE.tenureMonths = config.tenureYears * 12;

    if (STATE.tenureUnit === 'years') {
      STATE.tenureValue = config.tenureYears;
      dom.tenureInput.value = config.tenureYears;
      dom.tenureSlider.value = config.tenureYears;
    } else {
      STATE.tenureValue = STATE.tenureMonths;
      dom.tenureInput.value = STATE.tenureMonths;
      dom.tenureSlider.value = STATE.tenureMonths;
    }

    dom.loanAmountInput.value = inrFormatter.format(config.amount);
    dom.loanAmountSlider.value = config.amount;
    dom.amountInWords.textContent = `${formatCurrency(config.amount)} (${formatIndianLakhCrore(config.amount)})`;

    dom.interestRateInput.value = config.rate;
    dom.interestRateSlider.value = config.rate;
    dom.rateStatusTag.textContent = config.status;

    dom.amountError.textContent = '';
    dom.rateError.textContent = '';
    dom.tenureError.textContent = '';

    updateAllCalculations();
  }

  // --------------------------------------------------------------------------
  // 11. Download, Print & Sharing Features
  // --------------------------------------------------------------------------
  function setupExportAndSharing() {
    // 1. Download CSV
    const triggerCsvDownload = () => {
      if (!currentAmortization || !currentResults) return;

      let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel compatibility
      csv += 'EMI NOVA — Smart Loan Calculator Repayment Schedule\n';
      csv += `Generated On,${new Date().toLocaleString()}\n`;
      csv += `Loan Principal,${currentResults.principal}\n`;
      csv += `Annual Interest Rate,${currentResults.annualRate}%\n`;
      csv += `Loan Tenure,${currentResults.tenureMonths} Months (${(currentResults.tenureMonths / 12).toFixed(1)} Years)\n`;
      csv += `Monthly EMI,${currentResults.monthlyEmi.toFixed(2)}\n`;
      csv += `Total Interest Payable,${currentResults.totalInterest.toFixed(2)}\n`;
      csv += `Total Repayment Amount,${currentResults.totalRepayment.toFixed(2)}\n\n`;

      csv += 'Month,Year,Opening Balance,Principal Paid,Interest Paid,Total Monthly Payment,Closing Balance,Loan Repaid %\n';

      currentAmortization.months.forEach((m) => {
        csv += `${m.monthNumber},${m.yearNumber},${m.openingBalance.toFixed(2)},${m.principalPaid.toFixed(2)},${m.interestPaid.toFixed(2)},${m.totalPayment.toFixed(2)},${m.closingBalance.toFixed(2)},${m.loanPaidPercent.toFixed(2)}%\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `EMI_NOVA_Repayment_Schedule_${STATE.amount}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Repayment Amortization CSV downloaded successfully!');
    };

    dom.btnDownloadCsv.addEventListener('click', triggerCsvDownload);
    dom.btnDownloadCsv2.addEventListener('click', triggerCsvDownload);

    // 2. Print / Save as PDF
    const triggerPrint = () => {
      if (dom.printDateSpan) {
        dom.printDateSpan.textContent = new Date().toLocaleDateString('en-IN', {
          dateStyle: 'full'
        });
      }
      if (dom.printSummaryBox && currentResults) {
        dom.printSummaryBox.innerHTML = `
          <div><strong>Loan Principal:</strong> ${formatCurrency(currentResults.principal)}</div>
          <div><strong>Interest Rate:</strong> ${currentResults.annualRate}% p.a.</div>
          <div><strong>Tenure:</strong> ${currentResults.tenureMonths} Months</div>
          <div><strong>Monthly EMI:</strong> ${formatCurrency(currentResults.monthlyEmi, true, 2)}</div>
          <div><strong>Total Interest:</strong> ${formatCurrency(currentResults.totalInterest, true, 2)}</div>
          <div><strong>Total Outflow:</strong> ${formatCurrency(currentResults.totalRepayment, true, 2)}</div>
        `;
      }
      window.print();
    };

    dom.btnPrintSummary.addEventListener('click', triggerPrint);
    dom.btnPrintSummary2.addEventListener('click', triggerPrint);

    // 3. Copy Summary to Clipboard
    dom.btnCopySummary.addEventListener('click', async () => {
      if (!currentResults) return;

      const summaryText = [
        '=====================================',
        'EMI NOVA — Smart Loan Summary',
        '=====================================',
        `• Principal Amount:     ${formatCurrency(currentResults.principal)}`,
        `• Interest Rate:        ${currentResults.annualRate}% p.a.`,
        `• Loan Tenure:          ${currentResults.tenureMonths} Months (${(currentResults.tenureMonths / 12).toFixed(1)} Years)`,
        `• Monthly EMI:          ${formatCurrency(Math.round(currentResults.monthlyEmi))}`,
        `• Total Interest:       ${formatCurrency(Math.round(currentResults.totalInterest))}`,
        `• Total Repayment:      ${formatCurrency(Math.round(currentResults.totalRepayment))}`,
        `• Interest/Principal:   ${currentResults.interestRatio.toFixed(1)}%`,
        '=====================================',
        'Calculated on EMI NOVA: Plan Smart. Borrow Better.'
      ].join('\n');

      try {
        await navigator.clipboard.writeText(summaryText);
        showToast('Loan summary copied to clipboard!');
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = summaryText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Loan summary copied to clipboard!');
      }
    });

    // 4. Share Summary (Web Share API)
    dom.btnShareSummary.addEventListener('click', async () => {
      if (!currentResults) return;

      const shareData = {
        title: 'EMI NOVA — Loan Estimate',
        text: `My simulated loan EMI is ${formatCurrency(Math.round(currentResults.monthlyEmi))}/month for ₹${inrFormatter.format(currentResults.principal)} at ${currentResults.annualRate}%. Check out EMI NOVA:`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          showToast('Loan summary shared successfully!');
        } catch (err) {
          // User dismissed share dialog
        }
      } else {
        // Fallback: Copy URL with summary
        dom.btnCopySummary.click();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 12. Toast Notification System
  // --------------------------------------------------------------------------
  function showToast(message) {
    if (!dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    dom.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // 13. Theme Management (Dark / Light)
  // --------------------------------------------------------------------------
  function setupTheme() {
    const savedTheme = localStorage.getItem('emi_nova_theme') || 'dark';
    setTheme(savedTheme);

    dom.themeToggle.addEventListener('click', () => {
      const nextTheme = STATE.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  }

  function setTheme(theme) {
    STATE.theme = theme;
    dom.html.setAttribute('data-theme', theme);
    localStorage.setItem('emi_nova_theme', theme);

    // Refresh charts if initialized to adjust grid lines and tooltips
    if (trendChart) {
      const isDark = theme === 'dark';
      trendChart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      trendChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      trendChart.options.scales.x.ticks.color = isDark ? '#64748b' : '#94a3b8';
      trendChart.options.scales.y.ticks.color = isDark ? '#64748b' : '#94a3b8';
      trendChart.update();
    }
  }

  // --------------------------------------------------------------------------
  // 14. Responsive Navigation & Mobile Drawer
  // --------------------------------------------------------------------------
  function setupNavigation() {
    dom.mobileMenuBtn.addEventListener('click', () => {
      const isOpen = dom.mobileDrawer.classList.toggle('open');
      dom.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    dom.navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        dom.mobileDrawer.classList.remove('open');
        dom.mobileMenuBtn.setAttribute('aria-expanded', false);

        // Active link styling
        dom.navLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // ScrollSpy for navbar active highlight
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      sections.forEach((sec) => {
        const sectionHeight = sec.offsetHeight;
        const sectionTop = sec.offsetTop - 120;
        const sectionId = sec.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-link').forEach((l) => {
            l.classList.toggle('active', l.getAttribute('href') === `#${sectionId}`);
          });
        }
      });
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 15. Background Canvas Particles
  // --------------------------------------------------------------------------
  function setupParticles() {
    const canvas = dom.particlesCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(45, Math.floor(width / 30));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);
      const isDark = STATE.theme === 'dark';
      const particleColor = isDark ? '56, 189, 248' : '37, 99, 235';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
        ctx.fill();
      }

      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  // --------------------------------------------------------------------------
  // 16. Initialize Application
  // --------------------------------------------------------------------------
  function init() {
    setupTheme();
    setupNavigation();
    setupInputSynchronization();
    setupExportAndSharing();
    setupParticles();

    // Run initial calculation
    updateAllCalculations();
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
