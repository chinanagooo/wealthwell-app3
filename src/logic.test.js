/**
 * Unit tests for WealthOS Logic Engine
 * Run with: node --experimental-vm-modules node_modules/.bin/jest logic.test.js
 * Or with Vitest (already in the Finora stack): npx vitest run
 */

import {
  calcTotalAssets,
  calcTotalDebt,
  calcNetWorth,
  calcLiquidityScore,
  calcDiversificationScore,
  calcVolatilityScore,
  calcDebtLoadScore,
  calcProtectionScore,
  calcBehaviourScore,
  calcIncomeStabilityScore,
  calcWealthScore,
  calcResilienceScore,
  classifyFragility,
  calcConfidenceScore,
  calcSurvivalRunway,
  applyScenario,
  applyDecision,
  getRecommendations,
  computeAll,
} from './logic.js';

// ── Base Calculations ────────────────────────────────────────────────────────

test('calcTotalAssets sums all asset types', () => {
  expect(calcTotalAssets({ cash: 1000, stocks: 2000, property: 50000, crypto: 500, gold: 300 }))
    .toBe(53800);
});

test('calcTotalDebt sums all debt types', () => {
  expect(calcTotalDebt({ mortgage: 200000, loan: 5000, credit: 1500 })).toBe(206500);
});

test('calcNetWorth = assets - debt', () => {
  expect(calcNetWorth({ cash: 10000 }, { loan: 3000 })).toBe(7000);
});

// ── Liquidity ────────────────────────────────────────────────────────────────

test('liquidity: 6 months cash → 100', () => {
  expect(calcLiquidityScore({ cash: 6000 }, 1000)).toBe(100);
});

test('liquidity: 3 months cash → 50', () => {
  expect(calcLiquidityScore({ cash: 3000 }, 1000)).toBe(50);
});

test('liquidity clamped at 100 when over-funded', () => {
  expect(calcLiquidityScore({ cash: 100000 }, 1000)).toBe(100);
});

test('liquidity: zero expenses returns 0', () => {
  expect(calcLiquidityScore({ cash: 5000 }, 0)).toBe(0);
});

// ── Diversification ──────────────────────────────────────────────────────────

test('diversification: balanced portfolio → 100', () => {
  const assets = { cash: 2000, stocks: 2000, property: 2000, crypto: 2000, gold: 2000 };
  expect(calcDiversificationScore(assets)).toBe(100);
});

test('diversification: crypto > 30% → -15', () => {
  const assets = { cash: 1000, stocks: 1000, crypto: 5000, property: 0, gold: 0 };
  // largest share (crypto) = 5000/7000 ≈ 71% → -20; crypto > 30% → -15; total = 65
  expect(calcDiversificationScore(assets)).toBe(65);
});

test('diversification: property > 60% → -10 (and largest > 50% → -20)', () => {
  const assets = { cash: 500, stocks: 500, property: 8000, crypto: 500, gold: 500 };
  // largest = property 8000/10000 = 80% → -20; property > 60% → -10; score = 70
  expect(calcDiversificationScore(assets)).toBe(70);
});

// ── Volatility ───────────────────────────────────────────────────────────────

test('volatility: all cash → 90 (highest safety)', () => {
  expect(calcVolatilityScore({ cash: 10000, stocks: 0, property: 0, crypto: 0, gold: 0 })).toBe(90);
});

test('volatility: all crypto → 10 (most risky)', () => {
  expect(calcVolatilityScore({ cash: 0, stocks: 0, property: 0, crypto: 10000, gold: 0 })).toBe(10);
});

// ── Debt Load ────────────────────────────────────────────────────────────────

test('debtLoad: no debt → 100', () => {
  expect(calcDebtLoadScore({ cash: 10000 }, {})).toBe(100);
});

test('debtLoad: debt = assets → 0', () => {
  expect(calcDebtLoadScore({ cash: 10000 }, { loan: 10000 })).toBe(0);
});

// ── Protection ───────────────────────────────────────────────────────────────

test('protection: coverage ≥ 6x annual income → 90', () => {
  // monthly income 5000 → annual 60000; coverage 360000 = 6x
  expect(calcProtectionScore({ monthlyIncome: 5000, insuranceCoverage: 360000 })).toBe(90);
});

test('protection: coverage 3–6x → 70', () => {
  expect(calcProtectionScore({ monthlyIncome: 5000, insuranceCoverage: 240000 })).toBe(70);
});

test('protection: coverage < 3x → 40', () => {
  expect(calcProtectionScore({ monthlyIncome: 5000, insuranceCoverage: 50000 })).toBe(40);
});

// ── Behaviour ────────────────────────────────────────────────────────────────

test('behaviour: balanced, low crypto → 80', () => {
  expect(calcBehaviourScore({ cash: 5000, crypto: 100 }, { riskTolerance: 'Balanced' })).toBe(80);
});

test('behaviour: aggressive + high crypto → 60', () => {
  expect(calcBehaviourScore({ cash: 1000, crypto: 5000 }, { riskTolerance: 'Aggressive' })).toBe(60);
});

// ── Income Stability ─────────────────────────────────────────────────────────

test('incomeStability: Conservative → 85', () => {
  expect(calcIncomeStabilityScore({ riskTolerance: 'Conservative' })).toBe(85);
});

// ── Composite Scores ─────────────────────────────────────────────────────────

test('wealthScore: all 100 components → 100', () => {
  const scores = { liquidity: 100, diversification: 100, volatility: 100, debtLoad: 100, protection: 100, behaviour: 100, incomeStability: 100 };
  expect(calcWealthScore(scores)).toBe(100);
});

test('resilienceScore: all 0 components → 0', () => {
  const scores = { liquidity: 0, debtLoad: 0, diversification: 0, incomeStability: 0, protection: 0, behaviour: 0 };
  expect(calcResilienceScore(scores)).toBe(0);
});

// ── Fragility ────────────────────────────────────────────────────────────────

test('fragility: score 80 → Low', () => expect(classifyFragility(80)).toBe('Low'));
test('fragility: score 60 → Moderate', () => expect(classifyFragility(60)).toBe('Moderate'));
test('fragility: score 30 → High', () => expect(classifyFragility(30)).toBe('High'));
test('fragility: score 75 → Low (boundary)', () => expect(classifyFragility(75)).toBe('Low'));
test('fragility: score 50 → Moderate (boundary)', () => expect(classifyFragility(50)).toBe('Moderate'));

// ── Confidence ───────────────────────────────────────────────────────────────

test('confidence: complete profile → High', () => {
  const profile = {
    monthlyExpenses: 2000,
    assets: { cash: 10000 },
    debt: { loan: 0 },
    insuranceCoverage: 100000,
    goal: 'Retirement',
    riskTolerance: 'Balanced',
  };
  const { score, label } = calcConfidenceScore(profile);
  expect(score).toBe(100);
  expect(label).toBe('High');
});

test('confidence: missing expenses and assets → Low', () => {
  const { score, label } = calcConfidenceScore({});
  expect(score).toBeLessThan(50);
  expect(label).toBe('Low');
});

// ── Survival Runway ──────────────────────────────────────────────────────────

test('survivalRunway: 12 months → Strong runway', () => {
  const { months, label } = calcSurvivalRunway({ cash: 12000 }, 1000);
  expect(months).toBe(12);
  expect(label).toBe('Strong runway');
});

test('survivalRunway: 2 months → Fragile runway', () => {
  const { months, label } = calcSurvivalRunway({ cash: 2000 }, 1000);
  expect(months).toBe(2);
  expect(label).toBe('Fragile runway');
});

// ── Scenarios ────────────────────────────────────────────────────────────────

test('marketCrash: stocks drop 20%, crypto 30%, gold up 5%', () => {
  const state = { assets: { cash: 5000, stocks: 10000, crypto: 2000, gold: 1000, property: 0 }, debt: {}, monthlyIncome: 4000, monthlyExpenses: 2000 };
  const result = applyScenario('marketCrash', state);
  expect(result.assets.stocks).toBeCloseTo(8000);
  expect(result.assets.crypto).toBeCloseTo(1400);
  expect(result.assets.gold).toBeCloseTo(1050);
  expect(result.assets.cash).toBe(5000); // unchanged
});

test('jobLoss: income → 0, cash drops by 3x expenses', () => {
  const state = { assets: { cash: 10000 }, debt: {}, monthlyIncome: 4000, monthlyExpenses: 2000 };
  const result = applyScenario('jobLoss', state);
  expect(result.monthlyIncome).toBe(0);
  expect(result.assets.cash).toBe(4000); // 10000 - 3*2000
});

test('propertyPurchase: cash -15k, mortgage +50k, property +50k', () => {
  const state = { assets: { cash: 20000, property: 0 }, debt: { mortgage: 0 }, monthlyIncome: 4000, monthlyExpenses: 2000 };
  const result = applyScenario('propertyPurchase', state);
  expect(result.assets.cash).toBe(5000);
  expect(result.debt.mortgage).toBe(50000);
  expect(result.assets.property).toBe(50000);
});

// ── Decisions ────────────────────────────────────────────────────────────────

test('emergencyFund: cash +8000', () => {
  const state = { assets: { cash: 2000 }, debt: {} };
  expect(applyDecision('emergencyFund', state).assets.cash).toBe(10000);
});

test('reduceDebt: loan -10k, credit -5k', () => {
  const state = { assets: {}, debt: { loan: 15000, credit: 8000 } };
  const result = applyDecision('reduceDebt', state);
  expect(result.debt.loan).toBe(5000);
  expect(result.debt.credit).toBe(3000);
});

// ── Recommendations ──────────────────────────────────────────────────────────

test('no recommendations when all scores are high', () => {
  expect(getRecommendations({ liquidity: 80, diversification: 80, debtLoad: 80, protection: 80 })).toHaveLength(0);
});

test('all 4 recommendations fire when all scores are low', () => {
  expect(getRecommendations({ liquidity: 50, diversification: 60, debtLoad: 50, protection: 50 })).toHaveLength(4);
});

// ── computeAll integration ───────────────────────────────────────────────────

test('computeAll returns complete analytics object', () => {
  const profile = {
    assets: { cash: 6000, stocks: 4000, property: 0, crypto: 0, gold: 1000 },
    debt: { mortgage: 0, loan: 2000, credit: 500 },
    monthlyIncome: 4000,
    monthlyExpenses: 1000,
    insuranceCoverage: 120000,
    riskTolerance: 'Balanced',
    goal: 'Financial security',
    portfolioFocus: 'Balanced',
  };

  const result = computeAll(profile);

  expect(result).toHaveProperty('wealthScore');
  expect(result).toHaveProperty('resilienceScore');
  expect(result).toHaveProperty('fragility');
  expect(result).toHaveProperty('confidence');
  expect(result).toHaveProperty('survivalRunway');
  expect(result).toHaveProperty('recommendations');
  expect(result.wealthScore).toBeGreaterThan(0);
  expect(result.wealthScore).toBeLessThanOrEqual(100);
  expect(result.netWorth).toBe(11000 - 2500);
});
