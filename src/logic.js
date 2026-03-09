/**
 * WealthOS Logic Engine — Finora
 * Implements all financial calculations from the Logic spec.
 * Drop this file into src/logic.js and import wherever needed.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const round = (value) => Math.round(value);

// ─── 2. Base Financial Calculations ─────────────────────────────────────────

/**
 * @param {object} assets  { cash, stocks, property, crypto, gold }
 * @returns {number}
 */
export function calcTotalAssets({ cash = 0, stocks = 0, property = 0, crypto = 0, gold = 0 } = {}) {
  return cash + stocks + property + crypto + gold;
}

/**
 * @param {object} debt  { mortgage, loan, credit }
 * @returns {number}
 */
export function calcTotalDebt({ mortgage = 0, loan = 0, credit = 0 } = {}) {
  return mortgage + loan + credit;
}

/**
 * @param {object} assets
 * @param {object} debt
 * @returns {number}
 */
export function calcNetWorth(assets, debt) {
  return calcTotalAssets(assets) - calcTotalDebt(debt);
}

// ─── 3. Core Financial Health Metrics ───────────────────────────────────────

/**
 * Liquidity Score — measures emergency fund strength.
 * Liquid Assets = Cash only.
 * Score = (cash / monthlyExpenses / 6) * 100, clamped 0–100.
 */
export function calcLiquidityScore({ cash = 0 }, monthlyExpenses = 1) {
  if (monthlyExpenses <= 0) return 0;
  const score = (cash / monthlyExpenses / 6) * 100;
  return clamp(score);
}

/**
 * Diversification Score — starts at 100, applies penalties.
 */
export function calcDiversificationScore(assets = {}) {
  const total = calcTotalAssets(assets);
  if (total <= 0) return 0;

  const { cash = 0, stocks = 0, property = 0, crypto = 0, gold = 0 } = assets;
  let score = 100;

  const shares = {
    cash: cash / total,
    stocks: stocks / total,
    property: property / total,
    crypto: crypto / total,
    gold: gold / total,
  };

  // Largest single asset share > 50%
  const largest = Math.max(...Object.values(shares));
  if (largest > 0.5) score -= 20;

  // Crypto share > 30%
  if (shares.crypto > 0.3) score -= 15;

  // Property share > 60%
  if (shares.property > 0.6) score -= 10;

  return clamp(score);
}

/**
 * Volatility Score — measures portfolio risk. Higher = safer.
 * Risk weights: cash 0.1, gold 0.3, property 0.4, stocks 0.6, crypto 0.9
 */
export function calcVolatilityScore(assets = {}) {
  const total = calcTotalAssets(assets);
  if (total <= 0) return 0;

  const { cash = 0, stocks = 0, property = 0, crypto = 0, gold = 0 } = assets;

  const riskExposure =
    (cash / total) * 0.1 +
    (gold / total) * 0.3 +
    (property / total) * 0.4 +
    (stocks / total) * 0.6 +
    (crypto / total) * 0.9;

  const score = 100 - riskExposure * 100;
  return clamp(score);
}

/**
 * Debt Load Score — measures leverage risk.
 * Score = 100 - (totalDebt / totalAssets * 100), clamped 0–100.
 */
export function calcDebtLoadScore(assets = {}, debt = {}) {
  const totalAssets = calcTotalAssets(assets);
  const totalDebt = calcTotalDebt(debt);

  if (totalAssets <= 0) return totalDebt > 0 ? 0 : 100;

  const debtRatio = totalDebt / totalAssets;
  return clamp(100 - debtRatio * 100);
}

/**
 * Protection Score — measures insurance adequacy.
 * coverageRatio = insuranceCoverage / (monthlyIncome * 12)
 * <3 → 40, 3–6 → 70, ≥6 → 90
 */
export function calcProtectionScore({ monthlyIncome = 0, insuranceCoverage = 0 } = {}) {
  const annualIncome = monthlyIncome * 12;
  if (annualIncome <= 0) return 40;

  const coverageRatio = insuranceCoverage / annualIncome;

  if (coverageRatio >= 6) return 90;
  if (coverageRatio >= 3) return 70;
  return 40;
}

/**
 * Behaviour Score — base 80, penalised for risky behaviour.
 * Clamp 30–100.
 */
export function calcBehaviourScore(assets = {}, { riskTolerance = 'Balanced' } = {}) {
  const total = calcTotalAssets(assets);
  const cryptoShare = total > 0 ? (assets.crypto || 0) / total : 0;

  let score = 80;
  if (cryptoShare > 0.3) score -= 10;
  if (riskTolerance === 'Aggressive') score -= 10;

  return clamp(score, 30, 100);
}

/**
 * Income Stability Score — proxy based on risk tolerance.
 * Aggressive → 60, Balanced → 80, Conservative → 85
 */
export function calcIncomeStabilityScore({ riskTolerance = 'Balanced' } = {}) {
  const map = { Aggressive: 60, Balanced: 80, Conservative: 85 };
  return map[riskTolerance] ?? 80;
}

// ─── 4. Wealth Wellness Score ────────────────────────────────────────────────

/**
 * Composite wealth wellness score (0–100).
 */
export function calcWealthScore(scores = {}) {
  const {
    liquidity = 0,
    diversification = 0,
    volatility = 0,
    debtLoad = 0,
    protection = 0,
    behaviour = 0,
    incomeStability = 0,
  } = scores;

  const raw =
    0.25 * liquidity +
    0.20 * diversification +
    0.15 * volatility +
    0.15 * debtLoad +
    0.10 * protection +
    0.10 * behaviour +
    0.05 * incomeStability;

  return round(clamp(raw));
}

// ─── 5. Financial Resilience Score ──────────────────────────────────────────

/**
 * Composite resilience score (0–100).
 */
export function calcResilienceScore(scores = {}) {
  const {
    liquidity = 0,
    debtLoad = 0,
    diversification = 0,
    incomeStability = 0,
    protection = 0,
    behaviour = 0,
  } = scores;

  const raw =
    0.30 * liquidity +
    0.20 * debtLoad +
    0.20 * diversification +
    0.15 * incomeStability +
    0.10 * protection +
    0.05 * behaviour;

  return round(clamp(raw));
}

// ─── 6. Fragility Classification ────────────────────────────────────────────

/**
 * @param {number} resilienceScore
 * @returns {'Low' | 'Moderate' | 'High'}
 */
export function classifyFragility(resilienceScore) {
  if (resilienceScore >= 75) return 'Low';
  if (resilienceScore >= 50) return 'Moderate';
  return 'High';
}

// ─── 7. Confidence Score ─────────────────────────────────────────────────────

/**
 * Confidence in recommendations based on profile completeness.
 * @param {object} profile  Raw user profile fields
 * @returns {{ score: number, label: 'High' | 'Medium' | 'Low' }}
 */
export function calcConfidenceScore(profile = {}) {
  const {
    monthlyExpenses,
    assets,
    debt,
    insuranceCoverage,
    goal,
    riskTolerance,
  } = profile;

  let score = 100;

  const hasAssets = assets && Object.values(assets).some((v) => v > 0);
  const hasDebt = debt != null;

  if (!monthlyExpenses) score -= 20;
  if (!hasAssets) score -= 20;
  if (!hasDebt) score -= 15;
  if (insuranceCoverage == null) score -= 15;
  if (!goal) score -= 10;
  if (!riskTolerance) score -= 10;

  score = clamp(score);

  let label;
  if (score >= 80) label = 'High';
  else if (score >= 50) label = 'Medium';
  else label = 'Low';

  return { score, label };
}

// ─── 8. Survival Runway Metric ───────────────────────────────────────────────

/**
 * How many months the user can survive without income.
 * Liquid Assets = Cash.
 * @returns {{ months: number, label: string }}
 */
export function calcSurvivalRunway({ cash = 0 }, monthlyExpenses = 1) {
  if (monthlyExpenses <= 0) return { months: Infinity, label: 'Strong runway' };

  const months = cash / monthlyExpenses;

  let label;
  if (months >= 6) label = 'Strong runway';
  else if (months >= 3) label = 'Moderate runway';
  else label = 'Fragile runway';

  return { months, label };
}

// ─── 9. Scenario Engine ──────────────────────────────────────────────────────

/**
 * Apply a scenario shock and return modified { assets, debt, income }.
 * @param {'marketCrash' | 'jobLoss' | 'propertyPurchase'} scenario
 * @param {object} state  { assets, debt, monthlyIncome, monthlyExpenses }
 */
export function applyScenario(scenario, state = {}) {
  const assets = { ...state.assets };
  const debt = { ...state.debt };
  let monthlyIncome = state.monthlyIncome ?? 0;
  const monthlyExpenses = state.monthlyExpenses ?? 0;

  switch (scenario) {
    case 'marketCrash':
      assets.stocks = (assets.stocks || 0) * 0.8;
      assets.crypto = (assets.crypto || 0) * 0.7;
      assets.gold = (assets.gold || 0) * 1.05;
      return {
        assets,
        debt,
        monthlyIncome,
        message: 'Market-linked assets amplify downside risk.',
      };

    case 'jobLoss':
      monthlyIncome = 0;
      assets.cash = Math.max(0, (assets.cash || 0) - 3 * monthlyExpenses);
      return {
        assets,
        debt,
        monthlyIncome,
        message: 'Loss of income weakens liquidity and resilience.',
      };

    case 'propertyPurchase':
      assets.cash = Math.max(0, (assets.cash || 0) - 15000);
      debt.mortgage = (debt.mortgage || 0) + 50000;
      assets.property = (assets.property || 0) + 50000;
      return {
        assets,
        debt,
        monthlyIncome,
        message: 'Large purchases reduce liquidity and increase debt pressure.',
      };

    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}

// ─── 10. Decision Simulator ──────────────────────────────────────────────────

/**
 * Apply a positive financial decision and return modified state.
 * @param {'emergencyFund' | 'diversify' | 'reduceDebt'} decision
 * @param {object} state  { assets, debt }
 */
export function applyDecision(decision, state = {}) {
  const assets = { ...state.assets };
  const debt = { ...state.debt };

  switch (decision) {
    case 'emergencyFund':
      assets.cash = (assets.cash || 0) + 8000;
      return { assets, debt, outcome: 'Improves liquidity and resilience.' };

    case 'diversify':
      assets.stocks = (assets.stocks || 0) * 0.9;
      assets.gold = (assets.gold || 0) * 1.2;
      assets.cash = (assets.cash || 0) * 1.1;
      return { assets, debt, outcome: 'Reduces concentration risk and volatility.' };

    case 'reduceDebt':
      debt.loan = Math.max(0, (debt.loan || 0) - 10000);
      debt.credit = Math.max(0, (debt.credit || 0) - 5000);
      return { assets, debt, outcome: 'Improves debt load and resilience.' };

    default:
      throw new Error(`Unknown decision: ${decision}`);
  }
}

// ─── 11. Recommendation Engine ───────────────────────────────────────────────

/**
 * Returns an array of triggered recommendations.
 * @param {object} scores  { liquidity, diversification, debtLoad, protection }
 * @returns {Array<{ id: string, condition: string, action: string }>}
 */
export function getRecommendations(scores = {}) {
  const { liquidity = 100, diversification = 100, debtLoad = 100, protection = 100 } = scores;
  const recommendations = [];

  if (liquidity < 60) {
    recommendations.push({
      id: 'rec-liquidity',
      condition: 'Liquidity Score < 60',
      action: 'Increase emergency fund.',
    });
  }

  if (diversification < 70) {
    recommendations.push({
      id: 'rec-diversification',
      condition: 'Diversification Score < 70',
      action: 'Diversify holdings.',
    });
  }

  if (debtLoad < 70) {
    recommendations.push({
      id: 'rec-debt',
      condition: 'Debt Load Score < 70',
      action: 'Reduce debt.',
    });
  }

  if (protection < 60) {
    recommendations.push({
      id: 'rec-protection',
      condition: 'Protection Score < 60',
      action: 'Review or increase insurance coverage.',
    });
  }

  return recommendations;
}

// ─── Master Compute Function ─────────────────────────────────────────────────

/**
 * Single entry point: computes ALL scores from raw profile data.
 *
 * @param {object} profile
 * @param {object}  profile.assets         { cash, stocks, property, crypto, gold }
 * @param {object}  profile.debt           { mortgage, loan, credit }
 * @param {number}  profile.monthlyIncome
 * @param {number}  profile.monthlyExpenses
 * @param {number}  profile.insuranceCoverage
 * @param {string}  profile.riskTolerance   'Conservative' | 'Balanced' | 'Aggressive'
 * @param {string}  profile.goal
 * @param {string}  profile.portfolioFocus
 *
 * @returns {object}  Full analytics object
 */
export function computeAll(profile = {}) {
  const {
    assets = {},
    debt = {},
    monthlyIncome = 0,
    monthlyExpenses = 1,
    insuranceCoverage = 0,
    riskTolerance = 'Balanced',
    goal = null,
    portfolioFocus = 'Balanced',
  } = profile;

  // Base
  const totalAssets = calcTotalAssets(assets);
  const totalDebt = calcTotalDebt(debt);
  const netWorth = totalAssets - totalDebt;

  // Individual scores
  const liquidity = calcLiquidityScore(assets, monthlyExpenses);
  const diversification = calcDiversificationScore(assets);
  const volatility = calcVolatilityScore(assets);
  const debtLoad = calcDebtLoadScore(assets, debt);
  const protection = calcProtectionScore({ monthlyIncome, insuranceCoverage });
  const behaviour = calcBehaviourScore(assets, { riskTolerance });
  const incomeStability = calcIncomeStabilityScore({ riskTolerance });

  const scores = { liquidity, diversification, volatility, debtLoad, protection, behaviour, incomeStability };

  // Composite scores
  const wealthScore = calcWealthScore(scores);
  const resilienceScore = calcResilienceScore(scores);
  const fragility = classifyFragility(resilienceScore);

  // Meta
  const confidence = calcConfidenceScore({ monthlyExpenses, assets, debt, insuranceCoverage, goal, riskTolerance });
  const survivalRunway = calcSurvivalRunway(assets, monthlyExpenses);

  // Recommendations
  const recommendations = getRecommendations(scores);

  return {
    // Base
    totalAssets,
    totalDebt,
    netWorth,
    // Individual scores
    scores,
    // Composite
    wealthScore,
    resilienceScore,
    fragility,
    // Meta
    confidence,
    survivalRunway,
    // Actions
    recommendations,
    // Pass-through for convenience
    profile: { assets, debt, monthlyIncome, monthlyExpenses, insuranceCoverage, riskTolerance, goal, portfolioFocus },
  };
}
