import React, { useState, useEffect, useCallback } from "react";

// ─── STORAGE KEY ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "wealthwell_v1";

// ─── CURRENCIES ───────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code:"SGD", symbol:"S$", rate:1,    flag:"🇸🇬" },
  { code:"USD", symbol:"$",  rate:0.74, flag:"🇺🇸" },
  { code:"EUR", symbol:"€",  rate:0.68, flag:"🇪🇺" },
  { code:"GBP", symbol:"£",  rate:0.58, flag:"🇬🇧" },
  { code:"JPY", symbol:"¥",  rate:111,  flag:"🇯🇵" },
  { code:"AUD", symbol:"A$", rate:1.12, flag:"🇦🇺" },
  { code:"HKD", symbol:"HK$",rate:5.82, flag:"🇭🇰" },
];

const ASSET_CATS  = ["Cash & Deposits","Stocks & ETFs","Real Estate","Cryptocurrency","Commodities","Private Equity","Retirement (CPF)","Art & Collectibles","Other"];
const LIAB_CATS   = ["Mortgage","Personal Loan","Credit Card","Car Loan","Business Loan","Student Loan","Other"];
const EXP_CATS    = ["Food & Drink","Transport","Groceries","Entertainment","Shopping","Health","Utilities","Education","Other"];
const RISK_OPTS   = ["Conservative","Moderate","Aggressive"];
const NAT_OPTS    = ["Singaporean","Singapore PR","Employment Pass","Dependent Pass","Other"];
const GOALS_OPTS  = ["Retirement","Buying Property","Children's Education","Emergency Fund","Wealth Growth","Travel","Business Funding"];

const ASSET_COLORS = {"Cash & Deposits":"#06b6d4","Stocks & ETFs":"#6366f1","Real Estate":"#10b981","Cryptocurrency":"#f59e0b","Commodities":"#eab308","Private Equity":"#8b5cf6","Retirement (CPF)":"#ec4899","Art & Collectibles":"#f97316","Other":"#94a3b8"};
const ASSET_ICONS  = {"Cash & Deposits":"💵","Stocks & ETFs":"📈","Real Estate":"🏠","Cryptocurrency":"₿","Commodities":"🥇","Private Equity":"🏢","Retirement (CPF)":"🏛️","Art & Collectibles":"🖼️","Other":"💼"};

// Onboarding asset suggestions
const ASSET_SUGGESTIONS = [
  { icon:"🏦", name:"DBS/POSB Savings Account",   category:"Cash & Deposits",   color:"#06b6d4", placeholder:"25000"  },
  { icon:"🏛️", name:"CPF Ordinary Account",        category:"Retirement (CPF)",  color:"#ec4899", placeholder:"85000"  },
  { icon:"🏛️", name:"CPF Special Account",         category:"Retirement (CPF)",  color:"#f472b6", placeholder:"57000"  },
  { icon:"📈", name:"Stocks / ETFs Portfolio",     category:"Stocks & ETFs",     color:"#6366f1", placeholder:"80000"  },
  { icon:"🏠", name:"HDB Flat / Property",         category:"Real Estate",       color:"#10b981", placeholder:"450000" },
  { icon:"₿",  name:"Cryptocurrency Holdings",     category:"Cryptocurrency",    color:"#f59e0b", placeholder:"10000"  },
  { icon:"🥇", name:"Gold / Commodities",          category:"Commodities",       color:"#eab308", placeholder:"8000"   },
  { icon:"🏢", name:"Startup / Private Equity",    category:"Private Equity",    color:"#8b5cf6", placeholder:"10000"  },
];

const LIAB_SUGGESTIONS = [
  { icon:"🏠", name:"HDB Mortgage Loan",     category:"Mortgage",       color:"#ef4444", placeholder:"200000", mpHolder:"1800" },
  { icon:"💳", name:"Credit Card Balance",   category:"Credit Card",    color:"#f97316", placeholder:"5000",   mpHolder:"200"  },
  { icon:"🚗", name:"Car Loan",              category:"Car Loan",       color:"#fb923c", placeholder:"30000",  mpHolder:"800"  },
  { icon:"📚", name:"Student Loan",          category:"Student Loan",   color:"#fbbf24", placeholder:"20000",  mpHolder:"500"  },
  { icon:"🏦", name:"Personal Loan",         category:"Personal Loan",  color:"#f43f5e", placeholder:"10000",  mpHolder:"400"  },
];

const CONNECTED_PLATFORMS = [
  { id:"singpass", icon:"🇸🇬", name:"Singpass MyInfo",       desc:"Auto-fill personal details, CPF & tax data",  color:"#dc2626" },
  { id:"dbs",      icon:"🏦", name:"DBS / POSB",              desc:"Bank accounts, fixed deposits, cards",         color:"#e11d48" },
  { id:"ibkr",     icon:"📊", name:"Interactive Brokers",     desc:"Stocks, ETFs, options portfolio",              color:"#7c3aed" },
  { id:"coinbase", icon:"₿",  name:"Coinbase",                desc:"Crypto wallet balances",                       color:"#0284c7" },
  { id:"cpf",      icon:"🏛️", name:"CPF Board",               desc:"OA, SA, MA balances and history",              color:"#0891b2" },
];

const SCENARIOS_DEF = [
  { id:"crash",      label:"Market Crash",  icon:"📉", color:"#ef4444", bg:"#fff1f0", desc:"Equity & crypto downturn",   ticker:"STI",      delta:"-4.2%",  deltaUp:false },
  { id:"jobloss",    label:"Job Loss",      icon:"💼", color:"#f97316", bg:"#fff7ed", desc:"Months without income",      ticker:"CPF-OA",   delta:"0 inflow",deltaUp:false },
  { id:"rates",      label:"Rate Hike",     icon:"📊", color:"#8b5cf6", bg:"#f5f3ff", desc:"Central bank rate rise",     ticker:"MAS SORA", delta:"+1.5%",  deltaUp:true  },
  { id:"retirement", label:"Retirement",    icon:"🌅", color:"#10b981", bg:"#f0fdf4", desc:"Long-term wealth projection", ticker:"CPF LIFE", delta:"S$2.4K/mo",deltaUp:true},
  { id:"property",   label:"2nd Property",  icon:"🏠", color:"#06b6d4", bg:"#ecfeff", desc:"Additional property purchase",ticker:"ABSD",     delta:"17% duty",deltaUp:false},
];

// ─── SCENARIO ACTIONS: 5 unique per scenario, zero overlap across all 5 scenarios ───────
// MAS regulations + finance fundamentals, written in plain English for a layman.
const SCENARIO_ACTIONS = {

  crash: [
    { id:"c1", priority:1, icon:"🏛️", title:"Move 20% of Cash Into Singapore Savings Bonds",
      category:"Capital Preservation", color:"#ef4444", scenarioTag:"Market Crash", impact:"0% loss risk",
      problem:"During a market crash, equity portfolios can fall 30–50% in weeks. Holding too much in stocks right now turns paper losses into real ones.",
      reason:"Singapore Savings Bonds (SSBs) are guaranteed by the Singapore Government and issued via MAS. Your capital cannot go below what you put in — ever. They currently pay ~3.2% p.a. and you can cash out any month with zero penalty. Think of them as a safe harbour while the storm passes.",
      action:"Apply via DBS/POSB, OCBC or UOB internet banking. Individual cap is S$200,000. Applications close on the 3rd last business day of each month — check mas.gov.sg for the exact date. Shift 15–20% of your equity exposure here now.",
      outcome:"Capital is fully protected regardless of what markets do. You earn ~3.2% p.a. guaranteed while waiting to re-enter equities at lower prices — turning a scary moment into a strategic one.",
      masRef:"MAS · Singapore Government Securities Act · Sovereign 100% guarantee · S$200K cap/person" },

    { id:"c2", priority:2, icon:"📅", title:"Start a Regular Savings Plan — Buy More as Prices Fall",
      category:"Dollar-Cost Averaging", color:"#f97316", scenarioTag:"Market Crash", impact:"Lower avg cost",
      problem:"Most investors stop investing during a crash. This is the single biggest mistake — it means you miss the recovery entirely.",
      reason:"Dollar-cost averaging (DCA) means investing a fixed amount each month regardless of price. When prices fall, your fixed amount automatically buys more units. When prices recover, those extra units magnify your gains. It removes emotion from investing and is recommended by MAS's MoneySense financial literacy programme as the most practical strategy for retail investors.",
      action:"Open a Regular Savings Plan (RSP) with POEMS, FSMOne, or OCBC BCIP. Choose the STI ETF (SGX: ES3) or a global index fund. Start from S$100/month — zero brokerage per RSP trade. Keep the plan running through the downturn. Do not stop.",
      outcome:"Historical data shows that investors who continued DCA through every major crash (2008, 2020) recovered faster and often ended up with more wealth than before the crash. The dip is the opportunity.",
      masRef:"MAS-licensed brokers (CMS licence) · Capital Markets Services Act · RSP eligible instruments" },

    { id:"c3", priority:3, icon:"⚖️", title:"Rebalance Portfolio Back to Your Target Allocation",
      category:"Portfolio Rebalancing", color:"#8b5cf6", scenarioTag:"Market Crash", impact:"Recover 15–25% faster",
      problem:"After a crash, your portfolio drifts out of balance — equities shrink, cash grows as a percentage. Left uncorrected, you accidentally become too conservative and miss the rebound.",
      reason:"Rebalancing means selling what has grown above your target and buying what has fallen below it. This systematically forces 'sell high, buy low.' For a Moderate investor (60% equity / 40% bonds), a crash that drops equities to 40% means you should be buying stocks — exactly when everyone else is panicking. That disciplined contrarianism is what builds long-term wealth.",
      action:"Check your Portfolio tab for current allocations. If equities are more than 5% below your target, use available cash to buy STI ETF (ES3) or a diversified global index fund in tranches over 2–4 weeks. Do not try to pick the exact bottom — buy steadily.",
      outcome:"Vanguard research shows that portfolios rebalanced through downturns recover 15–25% faster than static ones. You also build the emotional discipline that separates long-term wealth builders from everyone else.",
      masRef:"MAS Notice SFA04-N12 · Investment suitability rules · MAS-licensed financial advisers" },

    { id:"c4", priority:4, icon:"🏦", title:"Review CPFIS Holdings — Your CPF Floor May Beat the Market",
      category:"CPF Strategy", color:"#dc2626", scenarioTag:"Market Crash", impact:"Protect 2.5% OA floor",
      problem:"CPF funds invested via the CPF Investment Scheme (CPFIS) into stocks or unit trusts are fully exposed to market crashes and can fall far below your principal.",
      reason:"Your CPF Ordinary Account (OA) earns 2.5% p.a. guaranteed — your Special Account earns 4% p.a. Both are guaranteed by the Singapore Government. During crashes, these guaranteed rates often beat the market. Think of the 2.5% OA rate as a government-backed 'safety floor' that most CPFIS investments fail to beat after fees and losses.",
      action:"Log into my.cpf.gov.sg and check your CPFIS portfolio performance. If your CPFIS investments are deeply negative and you don't believe they'll recover quickly, consider liquidating and returning the funds to your OA to earn 2.5% guaranteed. Note: once you exit CPFIS, reinvestment has limits — check cpf.gov.sg for your 'investible savings' amount.",
      outcome:"S$50,000 in CPF OA at 2.5% p.a. grows to S$64,000 over 10 years — guaranteed. Many CPFIS portfolios underperform this after fund fees. In a crash, the guaranteed rate wins by default.",
      masRef:"CPF Act · CPF Investment Scheme rules · MAS-approved CPFIS fund list · cpf.gov.sg" },

    { id:"c5", priority:5, icon:"⏸️", title:"Pause Voluntary CPF Top-Ups to Protect Your Liquidity",
      category:"Cash Flow Management", color:"#f59e0b", scenarioTag:"Market Crash", impact:"Free up S$500–1K/mo",
      problem:"During a crash, liquid cash is your most valuable resource. It lets you pay bills, avoid selling investments at a loss, and buy assets at depressed prices.",
      reason:"Voluntary CPF Retirement Sum Top-Ups (RSTU) are irreversible — you cannot withdraw the money until age 55. The 4% SA return is excellent in normal times, but a cash crunch makes liquidity worth more than locked-away returns. It is better to keep cash flexible during a crisis than to lock it up, however good the interest rate.",
      action:"Temporarily suspend monthly RSTU top-ups. Your mandatory CPF contributions via payroll continue automatically — do not stop those. Redirect the S$500–1,000/month you were topping up to your emergency fund or to invest opportunistically. Resume voluntary top-ups before 31 December to still claim partial-year tax relief.",
      outcome:"Pausing S$1,000/month in top-ups frees S$3,000 per quarter — potentially the difference between riding out a crash with intact investments versus being forced to sell at a loss to pay rent.",
      masRef:"CPF Act Section 13B · RSTU Scheme · CPF Board voluntary top-up guidelines" },
  ],

  jobloss: [
    { id:"j1", priority:1, icon:"🆘", title:"Activate Your Emergency Fund Protocol — Do This Today",
      category:"Financial Triage", color:"#f97316", scenarioTag:"Job Loss", impact:"Survive 6+ months",
      problem:"Without income, every unplanned expense without a buffer accelerates the crisis. Most people underestimate how quickly normal bills drain savings.",
      reason:"MAS's MoneySense programme and the CPF Board both recommend a 6-month emergency fund covering all fixed expenses — rent/mortgage, insurance, utilities, and food. This is the foundational rule of personal finance for a reason: 6 months gives you time to find re-employment without being forced into bad decisions like high-interest loans or panic-selling investments.",
      action:"Step 1: Add up every fixed monthly expense. Step 2: Confirm your emergency fund covers at least 3 months. Step 3: If it doesn't, liquidate in order — low-yield savings accounts first, then SSBs (redeemable within 1 month), then endowment plans (watch for surrender charges). Step 4: Call your mortgage bank today — all MAS-licensed banks have hardship assistance programmes.",
      outcome:"A 6-month buffer reduces panic-driven decisions and gives you the leverage to find the right job — not just the first one available. It is the single most important financial safety net.",
      masRef:"MAS Financial Education · MoneySense.gov.sg · MAS Guidelines on Responsible Lending" },

    { id:"j2", priority:2, icon:"🏛️", title:"Claim Government Support — You've Already Paid For It",
      category:"Government Assistance", color:"#10b981", scenarioTag:"Job Loss", impact:"S$300–800/month",
      problem:"Many Singaporeans are unaware of what government support they are entitled to during job loss, leaving thousands of dollars in assistance unclaimed.",
      reason:"Singapore has a structured safety net that all residents contribute to through taxes and CPF. If retrenched after 2 years at a company with 10+ employees, you may be entitled to retrenchment benefits under the Tripartite Advisory. ComCare provides monthly cash assistance for low-income households. These are not charity — they are systems built for exactly this situation.",
      action:"Apply for ComCare at your nearest Social Service Office or go.gov.sg/comcare. Claim CDC Vouchers at go.gov.sg/cdcv (all households qualify). Check with HR if retrenchment benefit applies under the Employment Act. Register with WSG's Career Matching Services (free job placement) and e2i for industry-specific support.",
      outcome:"These schemes can reduce monthly cash outflow by S$300–S$800, extending your runway by 1–2 months. That time can be the difference between landing the right next role versus accepting a desperate one.",
      masRef:"Employment Act (Cap 91A) · Tripartite Advisory on Retrenchment · ComCare Act · CDC Voucher Scheme" },

    { id:"j3", priority:3, icon:"💊", title:"Protect Your Insurance — Especially MediShield Life",
      category:"Healthcare Protection", color:"#ef4444", scenarioTag:"Job Loss", impact:"Avoid S$10K+ hospital bill",
      problem:"Cancelling insurance to cut costs during job loss is one of the most dangerous financial mistakes. A single hospitalisation without cover can wipe out an entire emergency fund in days.",
      reason:"MediShield Life is mandatory for all Singapore Citizens and PRs, and premiums are paid automatically from your CPF MediSave — so basic coverage continues even without income. The risk is your Integrated Shield Plan (IP) rider, which needs cash. Without an IP, a single Class A hospital stay can cost S$10,000–S$30,000 after subsidies. Reinstating a lapsed IP later requires fresh medical underwriting and may permanently exclude pre-existing conditions.",
      action:"Check MediShield Life status at my.cpf.gov.sg — it auto-continues via MediSave. For your IP rider, call your insurer immediately (AIA, Prudential, Great Eastern, etc.) and request: (1) a payment deferment, (2) a reduced coverage tier, or (3) a grace period. MAS-regulated insurers are required to offer hardship assistance.",
      outcome:"An IP rider costs S$50–S$200/month but protects you from a S$10,000–S$30,000 medical bill that could derail your financial recovery for years. Keep it active at all costs.",
      masRef:"MediShield Life Act 2015 · MOH MediShield Life framework · MAS Insurance Act" },

    { id:"j4", priority:4, icon:"🎓", title:"Reskill With SkillsFuture — Courses From S$100 Out-of-Pocket",
      category:"Income Recovery", color:"#6366f1", scenarioTag:"Job Loss", impact:"18% salary boost on re-entry",
      problem:"Job loss is painful, but it is also an opportunity. The longer you wait to upskill, the harder re-entry becomes — especially as Singapore's job market increasingly favours digital skills.",
      reason:"SkillsFuture Credit gives every Singaporean S$500 (with periodic top-ups) for approved courses. Singaporeans aged 40+ get an additional S$500 Mid-Career Enhanced Subsidy. WSQ courses are 70–95% subsidised by SkillsFuture Singapore — a S$2,000 data analytics course may cost under S$150 out of pocket. WSG's Career Conversion Programmes (CCPs) also pay up to 90% of your salary during retraining with a participating employer.",
      action:"Visit myskillsfuture.gov.sg. Filter for SSG-funded courses in digital skills, data analytics, cybersecurity, or your target field. Prioritise WSQ certifications — these are recognised by MOM-listed employers. Register for WSG Career Matching at wsg.gov.sg.",
      outcome:"MOM 2023 data shows retrenched workers who completed skills upgrading programmes were re-employed within a median of 3 months and earned 18% more than their previous salary on return.",
      masRef:"SkillsFuture Singapore · SSG Act · MOM Career Conversion Programmes · Workforce Singapore" },

    { id:"j5", priority:5, icon:"🏠", title:"Request a Mortgage Payment Holiday — It Won't Hurt Your Credit",
      category:"Debt Relief Strategy", color:"#8b5cf6", scenarioTag:"Job Loss", impact:"Free S$1,500–3,000/mo",
      problem:"Your mortgage is likely your largest monthly expense. Without income, even 2 missed payments triggers credit bureau flags that affect future loan eligibility for years.",
      reason:"Under MAS's Fair Dealing Guidelines, all MAS-licensed banks must provide hardship assistance. Requesting a payment holiday (interest-only or full deferment for 3–6 months) is a formal restructuring — not a default — and does not affect your Credit Bureau Singapore score when arranged proactively before any missed payment. HDB has its own Financial Assistance Scheme for HDB loan holders.",
      action:"Call your bank's hardship team before missing any payment. Bring your retrenchment letter and last 3 CPF statements showing income stopped. For HDB loans, contact HDB directly about the Financial Assistance Scheme (FAS). Banks must respond within 14 business days under MAS guidelines.",
      outcome:"A 3-month mortgage deferment on a S$500,000 loan frees S$1,500–S$3,000/month — cash that stays in your pocket to cover essential living costs while you rebuild your income.",
      masRef:"MAS Fair Dealing Guidelines · Banking Act (Cap 19) · HDB Financial Assistance Scheme · MAS MGL-LM" },
  ],

  rates: [
    { id:"r1", priority:1, icon:"📌", title:"Lock In a Fixed Mortgage Rate Before Rates Rise Further",
      category:"Mortgage Interest Shield", color:"#8b5cf6", scenarioTag:"Rate Hike", impact:"Save S$9–12K over 3 years",
      problem:"Variable-rate mortgages in Singapore are tied to SORA (Singapore Overnight Rate Average). A 1.5% rate increase on a S$600,000 mortgage raises your monthly payment by roughly S$600.",
      reason:"Switching to a fixed-rate mortgage locks your monthly payment for 2–3 years regardless of future rate movements. Think of it as buying certainty: you pay a small premium today (fixed rates are slightly higher) in exchange for knowing exactly what you'll pay every month, no matter what MAS or global central banks do. This is basic risk management — the same reason businesses hedge currency and commodity prices.",
      action:"Contact your bank and ask for fixed-rate package options. Compare packages across all banks at MoneySmart.sg. If your current lock-in period has expired, switching is usually free. If not, calculate whether the penalty (typically 1.5% of outstanding loan) is worth paying versus the savings. A MAS-licensed mortgage broker (not a property agent) can run this analysis for you free of charge.",
      outcome:"Fixing at today's rate versus a potential +2% higher variable rate saves S$9,000–S$12,000 over 3 years on a S$600,000 mortgage — a low-effort, high-certainty saving.",
      masRef:"MAS Notice 632 · SORA transition framework · MAS Total Debt Servicing Ratio (TDSR) rules" },

    { id:"r2", priority:2, icon:"💳", title:"Eliminate Credit Card Debt — 26% Interest vs Any Investment",
      category:"High-Interest Debt Kill", color:"#ef4444", scenarioTag:"Rate Hike", impact:"Guaranteed 26%/yr return",
      problem:"Credit card debt in Singapore compounds at 25–28% per year — the highest rate of any mainstream financial product. Rate hikes make this worse by squeezing household cash flow.",
      reason:"Clearing credit card debt is mathematically a guaranteed 26% annual return, completely tax-free. No investment reliably beats that. The 'avalanche method' — tackling the highest-interest debt first — maximises savings. Every day you carry a credit card balance, you are effectively paying 26% per year for the privilege of spending money you've already spent.",
      action:"List all credit card balances sorted by interest rate. Pay the minimum on lower-rate cards and direct all surplus cash to the highest-rate one. Once cleared, close the card. If your total balance exceeds S$5,000, ask your bank about a balance transfer (0% for 6–12 months, ~1.5% one-time fee) — this buys time to repay without new interest accumulating.",
      outcome:"Clearing S$5,000 in credit card debt at 26% p.a. saves you S$1,300 in annual interest — a guaranteed 26% return with zero market risk. Do this before any investment.",
      masRef:"MAS Notice 635 on Credit Cards · Credit Bureau Singapore · MAS Responsible Lending Guidelines" },

    { id:"r3", priority:3, icon:"🪙", title:"Earn 3.2–3.7% Risk-Free: Move Cash to SSBs and T-Bills",
      category:"Cash Yield Upgrade", color:"#10b981", scenarioTag:"Rate Hike", impact:"3.2% vs 0.05% savings rate",
      problem:"Cash sitting in a standard savings account earns 0.05% while inflation runs at 3–4%. Every month your cash stays idle, its real purchasing power quietly shrinks.",
      reason:"During rate hikes, Singapore Savings Bonds (SSBs) and Treasury Bills (T-bills) actually improve — their yields rise with the market. Both are issued by MAS and 100% backed by the Singapore Government. SSBs offer ~3.1–3.4% p.a. with full liquidity (redeem any month). T-bills offer 3.5–4% p.a. for 6-month or 1-year terms — slightly higher, but with a fixed maturity date.",
      action:"SSBs: Apply via internet banking (DBS, POSB, OCBC, UOB) before the monthly deadline at mas.gov.sg. T-bills: Apply at any major bank using cash or CPF OA funds. T-bill auctions are fortnightly — check mas.gov.sg for the schedule. Start with S$5,000–S$10,000 to learn the process, then scale up.",
      outcome:"Moving S$20,000 from a savings account (0.05%) to T-bills (3.7%) earns S$740 more per year, risk-free. Over 5 years, that's S$3,700 in extra interest for zero additional effort or risk.",
      masRef:"Government Securities Act · MAS SSB framework · MAS T-Bill auction rules · S$200K cap for SSBs" },

    { id:"r4", priority:4, icon:"📉", title:"Shorten Bond Duration to Avoid Rate-Driven Capital Losses",
      category:"Fixed Income Repositioning", color:"#6366f1", scenarioTag:"Rate Hike", impact:"Prevent 10–20% bond loss",
      problem:"When interest rates rise, existing bond prices fall. The longer the bond's maturity, the harder it falls. A 10-year bond loses roughly 9% of its value for every 1% rate increase.",
      reason:"'Duration' measures a bond's sensitivity to rate changes. Think of it this way: a long-duration bond promises to pay you a fixed rate far into the future — so when new bonds offer higher rates, your old bond becomes less attractive and its price drops sharply. Short-duration bonds (1–3 years) barely move because they mature soon and can be reinvested at the new higher rates.",
      action:"Find the 'average duration' of any bond fund or ETF you hold — it's on the fund factsheet on the manager's website. If it's above 5 years, consider shifting to: Singapore T-bills (3–6 months), ABF Singapore Bond Index Fund (shorter duration), or laddering bond maturities across 1, 2, and 3 years for steady reinvestment flexibility.",
      outcome:"During the 2022–2023 global rate hike cycle, long-duration bond funds fell 15–20% while short-duration T-bills held flat or gained. Shortening duration before rates rise is one of the highest-value portfolio moves available.",
      masRef:"SGX-listed bond ETFs · MAS T-Bill auctions · Government Securities Act · SGX bond market rules" },

    { id:"r5", priority:5, icon:"🏗️", title:"Don't Buy a 2nd Property Now — ABSD + TDSR Make It Painful",
      category:"Property Caution Flag", color:"#06b6d4", scenarioTag:"Rate Hike", impact:"Avoid S$85K+ in stamp duty",
      problem:"Rate hikes increase mortgage costs while reducing property values simultaneously. Buying a 2nd property now means higher monthly repayments on a potentially declining asset.",
      reason:"MAS enforces the Total Debt Servicing Ratio (TDSR): all monthly debt repayments must stay below 55% of gross income. As rates rise, your existing mortgage payments increase — eating into your TDSR capacity and potentially disqualifying you from a new loan. On top of that, Additional Buyer's Stamp Duty (ABSD) for a 2nd property is 17% for Singapore Citizens — on a S$500,000 flat, that's S$85,000 paid immediately in cash, non-refundable.",
      action:"Before any property move, recalculate your TDSR using the MAS stress test rate of 4% p.a. (not your actual current rate). Add your ABSD cost to the total cash outlay. Use the MAS Mortgage Calculator at mas.gov.sg. If you're determined to add property exposure, consider Singapore-listed REITs instead — they offer real estate returns with no ABSD, full liquidity, and 5–7% annual distributions.",
      outcome:"Waiting 12–18 months during a rate hike cycle can save tens of thousands in interest and potentially more in avoided stamp duty — patience here is a concrete financial strategy.",
      masRef:"MAS Notice 632 · TDSR Rules 2013 · ABSD (Stamp Duties Act) · MOF cooling measures (April 2023)" },
  ],

  retirement: [
    { id:"ret1", priority:1, icon:"🏛️", title:"Top Up CPF SA Voluntarily — 4% Guaranteed + Tax Relief",
      category:"CPF Power Compounding", color:"#10b981", scenarioTag:"Retirement", impact:"Up to S$8K tax relief/yr",
      problem:"Most Singaporeans only make the mandatory CPF contributions and miss out on the additional voluntary top-up benefits that can substantially boost retirement savings.",
      reason:"The Retirement Sum Topping-Up (RSTU) Scheme lets you voluntarily top up your CPF Special Account (SA) up to the Full Retirement Sum and earn 4% p.a. guaranteed by the government. You also get up to S$8,000 in income tax relief for self top-ups, plus another S$8,000 for topping up a family member's CPF. At the 15% tax bracket, that's S$1,200 saved in tax alone, every year.",
      action:"Log into my.cpf.gov.sg > 'Top Up My CPF'. Check your SA balance versus the Full Retirement Sum (S$205,800 for 2024). Top up the difference each year. Do this before 31 December to claim that year's tax relief. If you've already exceeded the FRS, top up your Retirement Account (RA) instead.",
      outcome:"Contributing S$8,000/year to CPF SA at 4% p.a. for 20 years compounds to ~S$238,000. In a bank account at 1%, the same money grows to only S$194,000. That S$44,000 difference comes purely from the government-guaranteed rate — no market risk required.",
      masRef:"CPF Act · RSTU Scheme (Section 13B) · IRAS Income Tax Relief · CPF Board guidelines" },

    { id:"ret2", priority:2, icon:"💼", title:"Open an SRS Account — Tax-Free Growth Until Retirement",
      category:"Tax-Efficient Retirement Vehicle", color:"#6366f1", scenarioTag:"Retirement", impact:"S$15,300 tax deduction/yr",
      problem:"CPF alone often can't fund the retirement lifestyle you want. Most financial planners target 70–80% of pre-retirement income — CPF LIFE covers only 30–50% for average earners.",
      reason:"The Supplementary Retirement Scheme (SRS) lets you voluntarily contribute up to S$15,300/year (S$35,700 for foreigners) and deduct the full amount from taxable income. Funds grow tax-free inside SRS. When you withdraw after age 63, only 50% of the amount is taxable — halving your effective retirement tax rate. It is one of Singapore's most powerful tax tools, yet massively underused.",
      action:"Open an SRS account online with DBS, OCBC, or UOB — takes 10 minutes. Deposit up to S$15,300 before 31 December to get the tax deduction this year. Crucially: invest the money inside SRS into ETFs, unit trusts, or REITs — the account itself earns near-zero interest. Avoid withdrawing before age 63 (5% penalty + 100% taxable).",
      outcome:"A person in the 11.5% tax bracket saving S$15,300/year in SRS pays S$1,760 less in tax annually. Over 20 years, that's S$35,200 in tax savings before counting the investment returns inside the account.",
      masRef:"Supplementary Retirement Scheme Act · IRAS SRS guidelines · MOF SRS framework · Age 63 withdrawal rule" },

    { id:"ret3", priority:3, icon:"🎯", title:"Understand CPF LIFE — Choose Your Plan Before Age 70",
      category:"Lifetime Income Design", color:"#f59e0b", scenarioTag:"Retirement", impact:"Lifetime monthly income",
      problem:"Most Singaporeans don't realise CPF LIFE has three different plans with very different payout profiles — and that deferring payouts can increase your monthly income by up to 35%.",
      reason:"CPF LIFE provides monthly payouts for life from your CPF Retirement Account. The 3 plans: Standard Plan (highest payout, lower estate), Basic Plan (lower payout, higher estate for family), Escalating Plan (starts lower but grows 2% annually to fight inflation). The Escalating Plan is underused but ideal for anyone expecting a 25–30 year retirement — inflation silently erodes fixed payouts over time. Deferring payouts from age 65 to 70 increases the monthly amount by roughly 7% per year of deferral.",
      action:"Use the CPF LIFE Estimator at my.cpf.gov.sg ('Retirement Income' section) to compare payouts under each plan. Separately nominate your CPF beneficiaries at any CPF Service Centre or at my.cpf.gov.sg — CPF nominations override your Will and must be done explicitly.",
      outcome:"Deferring CPF LIFE from 65 to 70 grows payouts by ~35%. On a S$1,000/month payout, that extra S$350 per month over a 20-year retirement adds up to S$84,000 in additional lifetime income.",
      masRef:"CPF Act · CPF LIFE Scheme · CPF Advisory Panel recommendations · CPF Board payout estimator" },

    { id:"ret4", priority:4, icon:"📜", title:"Write a Will and Set Up a Lasting Power of Attorney (LPA)",
      category:"Estate & Incapacity Protection", color:"#8b5cf6", scenarioTag:"Retirement", impact:"Protect your legacy",
      problem:"Without a Will, Singapore's Intestate Succession Act distributes your estate in a fixed formula that may not match your wishes — and it completely excludes unmarried partners.",
      reason:"Two documents protect your legacy: (1) A Will ensures your assets go to who you choose. Without one, a S$500,000 estate can be distributed against your wishes under the Intestate Succession Act. (2) An LPA (Lasting Power of Attorney) authorises someone you trust to make financial and personal decisions if you lose mental capacity. Without an LPA, your family must apply to court — a process taking 12–24 months and costing S$5,000–S$20,000.",
      action:"Will: Hire a lawyer (from S$200) or use a Law Society-approved will writing service. Important: CPF nominations are completely separate and must be done at the CPF Board — they override your Will for CPF funds. LPA: Apply at the Office of the Public Guardian (opg.gov.sg). Fee is S$75 per donee. A doctor must certify your mental capacity (~S$100–200).",
      outcome:"A Will + LPA + CPF nomination takes one afternoon and costs under S$500 total. Without these, a legal dispute over your estate could cost your family S$10,000–S$50,000 and years of stress.",
      masRef:"Intestate Succession Act (Cap 146) · Mental Capacity Act (Cap 177A) · CPF Act (Nominations) · Office of Public Guardian" },

    { id:"ret5", priority:5, icon:"📊", title:"Adopt a Glide Path — Gradually Shift Equities to Bonds",
      category:"Retirement Asset Allocation", color:"#06b6d4", scenarioTag:"Retirement", impact:"Halve ruin risk",
      problem:"Retirees who hold 80% in equities at retirement face 'sequence of returns risk' — a crash in your first year of retirement permanently impairs a portfolio you're actively drawing down.",
      reason:"A 'glide path' gradually shifts your portfolio from high-growth assets (equities) to defensive ones (bonds, CPF, cash) as you age. Simple rule: allocate (110 minus your age)% to equities. At 60: 50% equities. At 65: 45%. At 70: 40%. This works because equities grow wealth over the long run but cause devastating losses if you need to sell them during a crash — which retirees are forced to do. Singapore has no capital gains tax, so equity holdings in a brokerage account are especially tax-efficient.",
      action:"Open the Portfolio tab and check your current equity percentage. If you're within 10 years of retirement and above your glide path target, shift 5–10% per year into Singapore T-bills, SSBs, or CPF top-ups. Use your SRS account to hold bond ETFs (tax-efficient). Keep REITs as a middle ground — equity-like growth with income stability.",
      outcome:"Shifting to 50% bonds by retirement reduces the worst-case 1-year loss from ~35% to ~17%, lowering the probability of portfolio ruin in a 30-year retirement from 15% to under 3%, per Vanguard research.",
      masRef:"MoneySense Retirement Planning · MAS Investment Horizon guidelines · CPF Board Retirement Adequacy Study" },
  ],

  property: [
    { id:"p1", priority:1, icon:"💰", title:"Calculate Your Real ABSD Cost — It's Not Just the Price Tag",
      category:"Stamp Duty Reality Check", color:"#06b6d4", scenarioTag:"Property", impact:"S$85K–S$510K extra cost",
      problem:"Many buyers focus on the listed property price and forget the Additional Buyer's Stamp Duty (ABSD) — a tax that can add S$85,000 to S$510,000 to the cost, paid in cash within 14 days.",
      reason:"ABSD is a one-time, non-refundable tax introduced by MAS and MOF to cool the property market. Rates for a 2nd property: Singapore Citizens 17%, Singapore PRs 25%, Foreigners 60% (revised April 2023). On a S$500,000 HDB resale flat, a Singapore Citizen pays S$85,000 in ABSD alone — before legal fees, renovation, or furniture. That money is gone from Day 1.",
      action:"Step 1: Use the IRAS Stamp Duty Calculator at iras.gov.sg — enter your citizenship, number of properties owned, and purchase price. Step 2: Ask a property lawyer about 'decoupling' — transferring your existing property to one spouse so the other buys the new property as a first-time buyer (0% ABSD). This has transfer costs and risks. Step 3: Compare the ABSD outlay versus putting the same amount into a Singapore REIT — no stamp duty, 5–7% yield, fully liquid.",
      outcome:"Running this calculation before viewing any property saves you from emotional commitment before knowing the true cost. For many buyers, REITs deliver comparable property exposure without the stamp duty cliff.",
      masRef:"Stamp Duties Act · IRAS ABSD rates (2024) · MOF cooling measures April 2023 · MAS Residential Property Rules" },

    { id:"p2", priority:2, icon:"📐", title:"Check Your TDSR and MSR Before Making Any Offer",
      category:"Mortgage Eligibility First", color:"#8b5cf6", scenarioTag:"Property", impact:"Avoid losing 1% option fee",
      problem:"Many buyers discover they fail MAS's mortgage eligibility tests only after paying a 1% Option to Purchase (OTP) fee — forfeiting S$5,000–S$30,000 with no legal recourse.",
      reason:"MAS enforces two hard limits: (1) TDSR (Total Debt Servicing Ratio) — all monthly debt repayments must be ≤55% of gross monthly income. (2) MSR (Mortgage Servicing Ratio) — for HDB flats and ECs, the mortgage alone must be ≤30% of gross monthly income. Banks apply a stress test at 4% p.a. minimum when calculating these ratios, even if the actual loan rate is lower. Existing car loans, personal loans, and credit card debt all count against your TDSR.",
      action:"Before making any offer: calculate [monthly mortgage at 4% stress rate + all existing monthly debt repayments] ÷ gross monthly income. Must be below 55% (TDSR). For HDB/EC, the mortgage portion alone must be below 30% (MSR). Use the MAS Mortgage Calculator at mas.gov.sg/financial-stability. If you fail, options are: larger down payment, co-borrower, or clear existing debts first.",
      outcome:"A 5-minute TDSR check prevents losing your option fee. More importantly, it stops you from committing to a mortgage you can't service — the primary cause of forced property sales in Singapore.",
      masRef:"MAS TDSR Financial Institutions Rules 2013 · MAS Notice 632 · HDB MSR 30% rule · IRAS OTP stamp duty" },

    { id:"p3", priority:3, icon:"🏗️", title:"Understand the 45% LTV Cap and 25% Minimum Cash Rule",
      category:"Down Payment Planning", color:"#ef4444", scenarioTag:"Property", impact:"Need 25% in cash, not CPF",
      problem:"For a 2nd property, MAS caps the bank loan at only 45% of the price — meaning you must fund 55% yourself, with strict rules on how much must be cash versus CPF.",
      reason:"MAS LTV (Loan-to-Value) limits prevent over-leveraging. For a 2nd residential property: max loan = 45%. Of the 55% you must self-fund: minimum 25% must be cash (not CPF). Up to 30% can come from your CPF Ordinary Account. This is a hard rule — no bank can lend you more than 45%, regardless of your income. Planning 12–18 months ahead is essential to accumulate the cash portion.",
      action:"For a S$1M property: max bank loan = S$450,000, minimum cash = S$250,000, CPF OA usable = up to S$300,000. Verify your CPF OA balance at my.cpf.gov.sg. ABSD is on top of all this — paid in cash within 14 days of exercising the Option to Purchase. Map your total cash requirement 12 months in advance and start directing savings toward it.",
      outcome:"Most buyers who struggle with the cash component either take personal loans to bridge the gap or withdraw retirement CPF they shouldn't — both costly mistakes. 12 months of advance planning avoids both.",
      masRef:"MAS Notice 632 (LTV Limits) · CPF Housing Withdrawal Limits (CPF Act) · IRAS Stamp Duty payment rules" },

    { id:"p4", priority:4, icon:"📊", title:"Calculate Net Rental Yield — Gross Yield Misleads Investors",
      category:"Investment Return Reality", color:"#10b981", scenarioTag:"Property", impact:"Net yield ~2–3% reality",
      problem:"Many property investors quote 'gross rental yield' of 3–4% — but after all costs, net yield is often 1.5–2.5%, less than CPF SA and far below REITs.",
      reason:"Gross yield = annual rent ÷ property price. But you actually earn net yield, which strips out: property tax for non-owner-occupied properties (10–20% of Annual Value), maintenance/sinking fund (S$200–S$800/month), agent commission (1 month rent per new tenancy), vacancy (typically 6–8 weeks/year), mortgage interest, and minor repairs. Singapore's net rental yields typically land at 1.5–2.5% — below SSB rates and far below Singapore REITs.",
      action:"Build a quick P&L: Annual rent − (property tax + 12 months maintenance + 1 month agent fee + 6 weeks vacancy + insurance) = Net operating income. Divide that by your total equity invested (down payment + ABSD + legal fees). Compare to: CPF SA at 4% guaranteed, SSBs at 3.2%, Singapore REITs at 5–7% distribution yield. Be honest with the numbers.",
      outcome:"This analysis reveals that Singapore property's real advantage is capital appreciation — which is tax-free under Singapore's no capital gains tax regime — not rental income. If you're buying purely for yield, a REIT portfolio delivers 2–3× more income with zero ABSD and full liquidity.",
      masRef:"IRAS Property Tax Act · MoneySense Property Investment Guide · SGX REIT regulatory framework" },

    { id:"p5", priority:5, icon:"⚠️", title:"Ring-Fence Your Retirement Savings Before Using CPF for Property",
      category:"Retirement Adequacy Protection", color:"#f59e0b", scenarioTag:"Property", impact:"Protect S$200K+ retirement",
      problem:"Withdrawing all CPF OA savings for a 2nd property down payment is one of Singapore's most common and irreversible retirement planning mistakes.",
      reason:"CPF funds withdrawn for property must be refunded with 2.5% p.a. accrued interest upon sale — reducing your net sale proceeds. More critically, money not in CPF misses decades of compounding at 2.5% guaranteed. MAS retirement adequacy studies show that households over-allocated to property frequently fall below the Basic Retirement Sum (BRS) by age 55, needing government support in old age.",
      action:"Before withdrawing any CPF OA: (1) Check your projected CPF LIFE payout at cpf.gov.sg — is it enough to live on? (2) Ensure your CPF balance is on track for at least the Basic Retirement Sum (S$102,900 in 2024). (3) If using CPF for property leaves you below BRS, consider a smaller property or delay until you have sufficient non-CPF cash savings. (4) Remember: once withdrawn for property, CPF funds must be repaid with accrued interest on sale.",
      outcome:"S$50,000 left in CPF OA at age 35 grows to ~S$130,000 by age 65 at 2.5% guaranteed. Preserving your CPF is not being conservative — it is mathematically optimal for most buyers under 45.",
      masRef:"CPF Act · CPF Housing Withdrawal Policy · Basic Retirement Sum (2024: S$102,900) · MAS Retirement Adequacy" },
  ],
};


const PRO_METRICS = [
  { label:"Sharpe Ratio",      value:"0.84",   sub:"Risk-adj. return",           color:"#06b6d4", good:true,  tooltip:"Above 1.0 is ideal. Your portfolio returns 0.84 units per unit of risk." },
  { label:"Sortino Ratio",     value:"1.21",   sub:"Downside deviation adj.",    color:"#10b981", good:true,  tooltip:"Higher is better. Only penalises negative volatility. Strong result." },
  { label:"Max Drawdown",      value:"-18.4%", sub:"Worst peak-to-trough",       color:"#ef4444", good:false, tooltip:"Your portfolio fell a maximum of 18.4% from peak to trough in last 12mo." },
  { label:"Beta (STI)",        value:"1.12",   sub:"Market sensitivity",         color:"#f59e0b", good:null,  tooltip:"Beta > 1 means your portfolio amplifies market moves by 12%." },
  { label:"Alpha (ann.)",      value:"+2.3%",  sub:"Excess return vs benchmark", color:"#10b981", good:true,  tooltip:"You are generating 2.3% annual returns above the benchmark. Strong." },
  { label:"VaR 95% (1-mo)",    value:"-S$21K", sub:"Statistical downside",       color:"#ef4444", good:false, tooltip:"95% confidence: monthly loss will not exceed S$21,000." },
  { label:"CVaR / ES",         value:"-S$34K", sub:"Avg loss beyond VaR",        color:"#ef4444", good:false, tooltip:"When losses exceed VaR, the average loss is S$34,000." },
  { label:"Treynor Ratio",     value:"0.067",  sub:"Return per market risk unit",color:"#6366f1", good:true,  tooltip:"Measures portfolio return relative to its beta. 0.067 is moderate." },
  { label:"Information Ratio", value:"0.42",   sub:"Active return / error",      color:"#818cf8", good:true,  tooltip:"IR of 0.4–0.6 indicates consistent moderate outperformance." },
  { label:"Calmar Ratio",      value:"0.31",   sub:"CAGR / Max drawdown",        color:"#f59e0b", good:null,  tooltip:"Ratio of annual return to max drawdown. Above 0.5 is strong." },
  { label:"R-Squared (β)",     value:"0.78",   sub:"Correlation to benchmark",   color:"#94a3b8", good:null,  tooltip:"78% of portfolio movement is explained by the benchmark." },
  { label:"Tracking Error",    value:"4.2%",   sub:"Deviation from benchmark",   color:"#94a3b8", good:null,  tooltip:"Your portfolio deviates 4.2% annually from the benchmark index." },
];

const INIT_EXPENSES = [
  { id:1,  name:"Grab (Transport)",    category:"Transport",   amount:12.40, time:"08:30", date:"today"     },
  { id:2,  name:"Hawker Centre Lunch", category:"Food & Drink",amount:6.50,  time:"12:15", date:"today"     },
  { id:3,  name:"Cold Storage",        category:"Groceries",   amount:47.80, time:"14:00", date:"today"     },
  { id:4,  name:"Netflix",             category:"Entertainment",amount:15.98,time:"00:01",date:"today"      },
  { id:5,  name:"Starbucks",           category:"Food & Drink",amount:8.50,  time:"09:00", date:"yesterday" },
  { id:6,  name:"Grab (Transport)",    category:"Transport",   amount:18.20, time:"18:45", date:"yesterday" },
  { id:7,  name:"NTUC FairPrice",      category:"Groceries",   amount:62.30, time:"19:30", date:"yesterday" },
  { id:8,  name:"Gym Membership",      category:"Health",      amount:80.00, time:"01:00", date:"yesterday" },
  { id:9,  name:"Restaurant Dinner",   category:"Food & Drink",amount:88.00, time:"19:00", date:"2 days ago"},
  { id:10, name:"Shopee Order",        category:"Shopping",    amount:34.50, time:"10:00", date:"2 days ago"},
];
const SPENDING_HIST = [
  {day:"Mon",amount:42},{day:"Tue",amount:67},{day:"Wed",amount:195},{day:"Thu",amount:28},
  {day:"Fri",amount:156},{day:"Sat",amount:88},{day:"Today",amount:82.68},
];
const INIT_WEALTH_HIST = [
  {month:"Aug",value:382000},{month:"Sep",value:395000},{month:"Oct",value:388000},
  {month:"Nov",value:402000},{month:"Dec",value:415000},{month:"Jan",value:409000},
  {month:"Feb",value:421000},{month:"Mar",value:428000},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fc = (v, cur, short=false) => {
  const n = Math.abs(v) * cur.rate, s = cur.symbol, neg = v < 0 ? "-" : "";
  if (short) {
    if (n>=1e6) return `${neg}${s}${(n/1e6).toFixed(1)}M`;
    if (n>=1e3) return `${neg}${s}${(n/1e3).toFixed(0)}K`;
    return `${neg}${s}${n.toFixed(0)}`;
  }
  return `${neg}${s}${Math.round(n).toLocaleString()}`;
};
const sc = s => s>=75?"#10b981":s>=55?"#f59e0b":"#ef4444";
const sl = s => s>=75?"Excellent":s>=60?"Good":s>=45?"Fair":"Needs Work";

// ─── DYNAMIC WELLNESS COMPUTATION ─────────────────────────────────────────────
const computeWellness = (assets, liabs, profile) => {
  const totalA  = assets.reduce((s, a) => s + a.value, 0);
  const totalL  = liabs.reduce((s,  l) => s + l.value, 0);
  const cashA   = assets.filter(a => a.category === "Cash & Deposits").reduce((s, a) => s + a.value, 0);
  const retireA = assets.filter(a => a.category === "Retirement (CPF)").reduce((s, a) => s + a.value, 0);
  const salary  = parseFloat(profile.salary) || 6000;
  const expenses= parseFloat(profile.monthlyExpenses) || salary * 0.5;
  const cats    = new Set(assets.map(a => a.category));

  // Liquidity: months covered vs 6-month target
  const liqMonths = expenses > 0 ? (cashA / expenses) : 0;
  const liquidity  = Math.min(100, Math.round((liqMonths / 6) * 100));

  // Diversification: unique asset categories out of 7
  const diversification = Math.min(100, Math.round((cats.size / 7) * 100));

  // Debt-to-asset: 0% = 100, 40%+ = 0
  const debtRatio = totalA > 0 ? totalL / totalA : 1;
  const debt = Math.max(0, Math.round(100 - debtRatio * 250));

  // Resilience: weighted combo
  const resilience = Math.round(liquidity * 0.45 + diversification * 0.3 + debt * 0.25);

  // Protection: static baseline, reduced if no assets
  const protection = assets.length === 0 ? 30 : 63;

  // Behaviour: static
  const behaviour = 72;

  const overall = Math.round((liquidity + diversification + debt + resilience + protection + behaviour) / 6);

  return {
    liquidity, diversification, debt, resilience, protection, behaviour,
    overall: Math.max(1, Math.min(99, overall)),
    liqMonths: liqMonths.toFixed(1),
    debtRatioPct: (debtRatio * 100).toFixed(1),
  };
};

const buildMetrics = (scores, profile) => {
  const salary  = parseFloat(profile.salary) || 6000;
  const expenses= parseFloat(profile.monthlyExpenses) || salary * 0.5;
  return [
    { key:"liquidity",       label:"Liquidity Buffer",          score:scores.liquidity,       color:"#f59e0b",
      desc:`${scores.liqMonths} months covered`,
      tip:`Target: 6 months (${fc(expenses*6, {symbol:"S$",rate:1})}).${scores.liquidity<60?" Build emergency fund urgently.":" Great coverage!"}` },
    { key:"diversification", label:"Sector Diversification",    score:scores.diversification, color:"#6366f1",
      desc:"Asset class spread",
      tip: scores.diversification < 60 ? "Add more asset types to improve this score." : "Good spread. Watch for sector overweight." },
    { key:"debt",            label:"Debt-to-Asset Ratio",       score:scores.debt,            color:"#06b6d4",
      desc:`Ratio: ${scores.debtRatioPct}%`,
      tip:`Target below 15%. ${parseFloat(scores.debtRatioPct) > 15 ? "Pay off high-interest debt first." : "Debt level is healthy."}` },
    { key:"resilience",      label:"Drawdown Resilience",       score:scores.resilience,      color:"#ec4899",
      desc:"Shock absorption capacity",
      tip:"Improving liquidity buffer and diversification helps resilience most." },
    { key:"behaviour",       label:"Emotional Trading Control", score:scores.behaviour,       color:"#10b981",
      desc:"No panic patterns detected",
      tip:"Concentration bias noted. Rebalancing is overdue." },
    { key:"protection",      label:"Insurance Coverage Gap",    score:scores.protection,      color:"#8b5cf6",
      desc:"~S$200K coverage gap",
      tip:"Review term life insurance coverage urgently." },
  ];
};

const buildActions = (scores, assets, liabs, profile) => {
  const salary  = parseFloat(profile.salary) || 6000;
  const expenses= parseFloat(profile.monthlyExpenses) || salary * 0.5;
  const actions = [];
  if (scores.liquidity < 70)
    actions.push({ id:1, priority:1, icon:"🏦", title:"Build Emergency Fund",       category:"Liquidity Buffer",       color:"#f59e0b", scenarioTag:"Job Loss",
      problem:`Only ${scores.liqMonths} months of expenses are liquid`,
      reason:"Financial advisors recommend 6 months of expenses as a safety net against job loss or emergencies",
      action:`Transfer ${fc(expenses*6 - assets.filter(a=>a.category==="Cash & Deposits").reduce((s,a)=>s+a.value,0), {symbol:"S$",rate:1})} to a high-yield savings account such as DBS Multiplier`,
      outcome:`Liquidity Buffer score rises from ${scores.liquidity} → 80`, impact:"+28 pts" });
  const eqPct = assets.length ? Math.round(assets.filter(a=>a.category==="Stocks & ETFs").reduce((s,a)=>s+a.value,0) / assets.reduce((s,a)=>s+a.value,0) * 100) : 0;
  if (eqPct > 35)
    actions.push({ id:2, priority:2, icon:"📊", title:"Reduce Equity Concentration", category:"Sector Diversification", color:"#6366f1", scenarioTag:"Market Crash",
      problem:`${eqPct}% of your portfolio is in stocks/ETFs`,
      reason:"High single-asset concentration amplifies losses during corrections",
      action:"Diversify 20% into global ETFs (VT or VXUS) and bonds for balance",
      outcome:"Portfolio volatility reduced by ~18%", impact:"-18% vol" });
  const ccDebt = liabs.filter(l=>l.category==="Credit Card").reduce((s,l)=>s+l.value,0);
  if (ccDebt > 0)
    actions.push({ id:3, priority:3, icon:"💳", title:"Clear Credit Card Debt",      category:"Debt-to-Asset Ratio",    color:"#ef4444", scenarioTag:"Rate Hike",
      problem:`${fc(ccDebt, {symbol:"S$",rate:1})} credit card balance accruing ~26% annual interest`,
      reason:"High-interest debt erodes wealth faster than most investment assets can grow",
      action:"Pay off the balance in full using your existing cash buffer",
      outcome:`Save ~${fc(ccDebt*0.26, {symbol:"S$",rate:1})} per year in interest charges`, impact:`+${fc(ccDebt*0.26,{symbol:"S$",rate:1})}/yr` });
  if (scores.protection < 70)
    actions.push({ id:4, priority:4, icon:"🛡️", title:"Close Insurance Coverage Gap", category:"Insurance Coverage Gap",  color:"#8b5cf6", scenarioTag:"Protection",
      problem:"~S$200K coverage gap vs total financial obligations",
      reason:"Insufficient coverage leaves dependants exposed in the event of critical illness or death",
      action:"Get a term life insurance quote for S$500K coverage (~S$80/month)",
      outcome:`Insurance Coverage Gap score rises from ${scores.protection} → 85+`, impact:"+22 pts" });
  if (scores.diversification < 60)
    actions.push({ id:5, priority:5, icon:"🌏", title:"Add Geographic Diversification", category:"Sector Diversification", color:"#10b981", scenarioTag:"Market Crash",
      problem:"Portfolio is concentrated in a single geography",
      reason:"Geographic diversification reduces exposure to local economic downturns",
      action:"Allocate 10–15% to international ETFs covering Asia Pacific and Europe",
      outcome:"Diversification score rises significantly", impact:"+15 pts" });
  return actions.length > 0 ? actions : [
    { id:99, priority:1, icon:"🎉", title:"Portfolio Looking Healthy",    category:"General",                color:"#10b981", scenarioTag:"General",
      problem:"No critical issues detected in your portfolio",
      reason:"Your current setup is well-balanced. Keep monitoring regularly.",
      action:"Review your portfolio quarterly and rebalance if any category drifts > 5%",
      outcome:"Maintain current Wealth Wellness Score", impact:"Maintain" }
  ];
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function AN({ val, sym="", dur=1100 }) {
  const [c, setC] = useState(0);
  useEffect(() => {
    let f, s;
    const r = ts => { if(!s) s=ts; const p=Math.min((ts-s)/dur,1), e=1-Math.pow(1-p,3); setC(Math.round(e*val)); if(p<1) f=requestAnimationFrame(r); };
    f = requestAnimationFrame(r);
    return () => cancelAnimationFrame(f);
  }, [val, dur]);
  return <span>{sym}{c.toLocaleString()}</span>;
}

function Ring({ score, size=115, dark=false }) {
  const [a, setA] = useState(0);
  useEffect(() => {
    let f, s;
    const r = ts => { if(!s) s=ts; const p=Math.min((ts-s)/1300,1), e=1-Math.pow(1-p,3); setA(Math.round(e*score)); if(p<1) f=requestAnimationFrame(r); };
    f = requestAnimationFrame(r);
    return () => cancelAnimationFrame(f);
  }, [score]);
  const r=44, circ=2*Math.PI*r, dash=(a/100)*circ, c=sc(score), cx=size/2, cy=size/2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={dark?"#2d1a1a":"#e2e8f0"} strokeWidth="8"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="8"
        strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{transition:"stroke-dasharray 0.04s linear"}}/>
      <text x={cx} y={cy-4}  textAnchor="middle" fontSize="20" fontWeight="800" fill={dark?"#fef2f2":"#0f172a"} fontFamily="'Sora',sans-serif">{a}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="8"  fill={dark?"#fca5a5":"#64748b"} fontFamily="'Sora',sans-serif">WELLNESS</text>
      <text x={cx} y={cy+22} textAnchor="middle" fontSize="8"  fontWeight="700" fill={c} fontFamily="'Sora',sans-serif">{sl(score).toUpperCase()}</text>
    </svg>
  );
}

function Spark({ data, color="#6366f1", h=44, w=155 }) {
  const v=data.map(d=>d.value||d.amount), mn=Math.min(...v), mx=Math.max(...v);
  const pts=v.map((x,i)=>`${3+(i/(v.length-1))*(w-6)},${h-3-((x-mn)/(mx-mn||1))*(h-6)}`).join(" ");
  const lp=pts.split(" ").pop().split(",");
  return <svg width={w} height={h}><polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts}/><circle cx={lp[0]} cy={lp[1]} r="4" fill={color}/></svg>;
}

function EDonut({ assets, liabilities, cur }) {
  const [expanded, setExpanded] = useState(null);
  const [hov, setHov] = useState(null);
  const totalA = assets.reduce((s,a)=>s+a.value,0);
  const totalL = liabilities.reduce((s,l)=>s+l.value,0);
  const catColors = ASSET_COLORS;
  const top = [{ name:"Assets", value:totalA, color:"#6366f1" },{ name:"Liabilities", value:totalL, color:"#ef4444" }];
  const detail = expanded==="assets"
    ? Object.entries(assets.reduce((acc,a)=>({...acc,[a.category]:(acc[a.category]||0)+a.value}),{})).map(([k,v])=>({name:k,value:v,color:catColors[k]||"#94a3b8"}))
    : liabilities.map((l,i)=>({...l,color:["#ef4444","#f97316","#fb923c"][i%3]}));
  const segs=expanded?detail:top, total=expanded?(expanded==="assets"?totalA:totalL):(totalA+totalL);
  const cx=82,cy=82,r=66,inn=44,size=164,toR=d=>d*Math.PI/180;
  let cum=-90;
  const arcs=segs.map(s=>{
    const pct=s.value/total,ang=pct*360,sa=cum,ea=cum+ang; cum+=ang;
    const lg=ang>180?1:0;
    const x1=cx+r*Math.cos(toR(sa)),y1=cy+r*Math.sin(toR(sa));
    const x2=cx+r*Math.cos(toR(ea-.5)),y2=cy+r*Math.sin(toR(ea-.5));
    const ix1=cx+inn*Math.cos(toR(ea-.5)),iy1=cy+inn*Math.sin(toR(ea-.5));
    const ix2=cx+inn*Math.cos(toR(sa)),iy2=cy+inn*Math.sin(toR(sa));
    return{...s,d:`M${x1} ${y1} A${r} ${r} 0 ${lg} 1 ${x2} ${y2} L${ix1} ${iy1} A${inn} ${inn} 0 ${lg} 0 ${ix2} ${iy2} Z`,pct:Math.round(pct*100)};
  });
  return (
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <svg width={size} height={size}>
          {arcs.map((a,i)=>(
            <path key={i} d={a.d} fill={a.color} stroke="white" strokeWidth="2"
              opacity={hov===null||hov===i?1:0.28}
              style={{cursor:"pointer",transition:"all 0.2s",transform:hov===i?"scale(1.05)":"scale(1)",transformOrigin:`${cx}px ${cy}px`}}
              onClick={()=>{if(!expanded&&a.name==="Assets")setExpanded("assets");else if(!expanded&&a.name==="Liabilities")setExpanded("liabilities");else setExpanded(null);}}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}/>
          ))}
          <text x={cx} y={cy-5}  textAnchor="middle" fontSize="9"  fill="#64748b" fontFamily="'Sora',sans-serif">{hov!==null?arcs[hov]?.name:expanded||"Portfolio"}</text>
          <text x={cx} y={cy+10} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a" fontFamily="'Sora',sans-serif">{hov!==null?`${arcs[hov]?.pct}%`:fc(total,cur,true)}</text>
        </svg>
        {expanded&&<button onClick={()=>setExpanded(null)} style={{position:"absolute",top:4,right:4,background:"#f1f5f9",border:"none",borderRadius:99,width:20,height:20,fontSize:10,cursor:"pointer",color:"#64748b"}}>←</button>}
      </div>
      <div style={{flex:1,minWidth:130}}>
        <div style={{fontSize:9,fontWeight:700,color:"#6366f1",marginBottom:7}}>{expanded?`${expanded==="assets"?"Asset Classes":"Liability Types"} — click to go back`:"Click a slice to drill down"}</div>
        {arcs.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,padding:"4px 6px",borderRadius:5,background:hov===i?"#f8fafc":"transparent"}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <div style={{width:8,height:8,borderRadius:"50%",background:a.color,flexShrink:0}}/>
            <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:"#0f172a"}}>{a.name}</div><div style={{height:3,background:"#f1f5f9",borderRadius:99,marginTop:2}}><div style={{height:"100%",width:`${a.pct}%`,background:a.color,borderRadius:99}}/></div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,fontWeight:800,color:a.color}}>{a.pct}%</div><div style={{fontSize:9,color:"#64748b"}}>{fc(a.value,cur,true)}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({ children, color="#6366f1" }) {
  return <span style={{background:`${color}18`,color,padding:"2px 9px",borderRadius:99,fontSize:9,fontWeight:700}}>{children}</span>;
}

function Lbl({ children, style={} }) {
  return <div style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,marginBottom:5,...style}}>{children}</div>;
}

function Inp({ label, value, onChange, type="text", placeholder="", style={} }) {
  return (
    <div style={{marginBottom:11,...style}}>
      {label && <Lbl>{label}</Lbl>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid #e2e8f0",background:"#f8fafc",color:"#0f172a",fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
    </div>
  );
}

function ExpBar({ data, limit, cur }) {
  const max = Math.max(...data.map(d=>d.amount), limit||1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:5,height:70}}>
      {data.map((d,i)=>{
        const h=Math.round((d.amount/max)*62)+4, over=limit&&d.amount>limit, isToday=d.day==="Today";
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div title={`${cur.symbol}${d.amount}`} style={{width:"100%",height:h,background:over?"linear-gradient(180deg,#ef4444,#f97316)":isToday?"linear-gradient(180deg,#6366f1,#818cf8)":"linear-gradient(180deg,#c7d2fe,#a5b4fc)",borderRadius:"4px 4px 0 0",transition:"height 0.7s cubic-bezier(.34,1.56,.64,1)",cursor:"default",position:"relative"}}>
              {over&&<div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"#ef4444",fontWeight:800}}>!</div>}
            </div>
            <span style={{fontSize:8,fontWeight:isToday?800:500,color:isToday?"#6366f1":"#94a3b8"}}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function Flashcard({ action:a, onDone, cur }) {
  const sections = [
    { label:"⚠ SITUATION", text:a.problem, accent:a.color,    bg:`${a.color}0d`, border:`${a.color}55` },
    { label:"◈ WHY IT MATTERS", text:a.reason,  accent:"#f59e0b", bg:"#fffbeb",     border:"#fde68a" },
    { label:"▶ ACTION STEPS",   text:a.action,  accent:"#2563eb", bg:"#eff6ff",     border:"#bfdbfe" },
    { label:"✦ EXPECTED OUTCOME",text:a.outcome, accent:"#059669", bg:"#f0fdf4",     border:"#86efac" },
  ];
  return (
    <div style={{background:"#fff",borderRadius:0,border:"1px solid #e2e8f0",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",animation:"slideIn 0.3s ease",fontFamily:"'Sora',sans-serif",overflow:"hidden"}}>
      {/* Bloomberg-style header bar */}
      <div style={{background:`linear-gradient(135deg,#0f172a 0%,#1e293b 100%)`,padding:"14px 18px",borderBottom:`3px solid ${a.color}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{background:`${a.color}25`,border:`1px solid ${a.color}66`,borderRadius:6,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{a.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,fontWeight:700,color:a.color,textTransform:"uppercase",letterSpacing:1.2,marginBottom:3}}>{a.category}</div>
            <div style={{fontSize:14,fontWeight:800,color:"#f8fafc",lineHeight:1.3}}>{a.title}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:13,fontWeight:800,color:a.color,fontFamily:"'Courier New',monospace"}}>{a.impact}</div>
            <div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:.8}}>IMPACT EST.</div>
          </div>
        </div>
        {/* Bloomberg ticker row */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          <span style={{fontSize:8,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:.8,padding:"2px 7px",background:"#1e293b",border:"1px solid #334155",borderRadius:3}}>PRIORITY {a.priority}</span>
          <span style={{fontSize:8,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.8,padding:"2px 7px",background:"#1e293b",border:"1px solid #334155",borderRadius:3}}>{a.scenarioTag}</span>
          {a.masRef&&<span style={{fontSize:7,fontWeight:600,color:"#64748b",letterSpacing:.5,padding:"2px 8px",background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:3}}>MAS · {a.masRef.split("·")[0].trim()}</span>}
        </div>
      </div>
      {/* Content sections */}
      <div style={{padding:"0"}}>
        {sections.map((s,i)=>(
          <div key={i} style={{padding:"12px 18px",borderBottom:i<3?"1px solid #f1f5f9":"none",background:s.bg}}>
            <div style={{fontSize:8,fontWeight:800,color:s.accent,textTransform:"uppercase",letterSpacing:1.1,marginBottom:5,display:"flex",alignItems:"center",gap:5}}>
              {s.label}
            </div>
            <div style={{fontSize:11.5,fontWeight:500,color:"#1e293b",lineHeight:1.65}}>{s.text}</div>
          </div>
        ))}
        {/* MAS reference footer */}
        {a.masRef&&(
          <div style={{padding:"8px 18px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:8,color:"#94a3b8"}}>📋</span>
            <span style={{fontSize:8,color:"#94a3b8",fontWeight:600,letterSpacing:.3}}>{a.masRef}</span>
          </div>
        )}
      </div>
      <div style={{padding:"12px 18px",borderTop:"1px solid #e2e8f0",background:"#fff"}}>
        <button onClick={()=>onDone(a.id)} style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${a.color},${a.color}cc)`,color:"white",border:"none",borderRadius:6,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Sora',sans-serif",letterSpacing:.5,textTransform:"uppercase"}}>
          ✓ Mark as Actioned
        </button>
      </div>
    </div>
  );
}

// ─── ONBOARDING WIZARD ────────────────────────────────────────────────────────
const TOTAL_STEPS = 6; // 1-6 (0 = welcome)

function OB_Input({ label, value, onChange, type="text", placeholder="", required=false, hint="" }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:5 }}>
        {label}{required && <span style={{color:"#dc2626"}}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb",
          background:"white", color:"#111827", fontSize:13, fontFamily:"'Sora',sans-serif",
          outline:"none", transition:"border-color 0.2s" }}
        onFocus={e=>e.target.style.borderColor="#dc2626"}
        onBlur={e=>e.target.style.borderColor="#e5e7eb"}
      />
      {hint && <div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>{hint}</div>}
    </div>
  );
}

function OB_Select({ label, value, onChange, options, required=false }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:5 }}>
        {label}{required && <span style={{color:"#dc2626"}}> *</span>}
      </label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb",
          background:"white", color:"#111827", fontSize:13, fontFamily:"'Sora',sans-serif", outline:"none" }}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function OB_ProgressBar({ step }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#dc2626" }}>Step {step} of {TOTAL_STEPS}</span>
        <span style={{ fontSize:10, color:"#9ca3af" }}>{Math.round((step/TOTAL_STEPS)*100)}% complete</span>
      </div>
      <div style={{ height:4, borderRadius:4, background:"#f3f4f6", overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:4, background:"linear-gradient(90deg,#dc2626,#f87171)",
          width:`${(step/TOTAL_STEPS)*100}%`, transition:"width 0.5s ease" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
        {["Identity","Finances","Assets","Liabilities","Connect","Done"].map((s,i)=>(
          <span key={i} style={{ fontSize:9, fontWeight: i<step?"700":"400",
            color: i<step?"#dc2626":i===step-1?"#374151":"#d1d5db" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);

  // Step 1 – Personal
  const [pName, setPName]           = useState("");
  const [pDob, setPDob]             = useState("");
  const [pNat, setPNat]             = useState("Singaporean");
  const [pNric, setPNric]           = useState("");
  const [pPhone, setPPhone]         = useState("");
  const [pEmail, setPEmail]         = useState("");
  const [pAddress, setPAddress]     = useState("");
  const [pPassword, setPPassword]   = useState("");
  const [pPasswordC, setPPasswordC] = useState("");
  const [showPw, setShowPw]         = useState(false);

  // Step 2 – Financial
  const [pSalary, setPSalary]       = useState("");
  const [pExpenses, setPExpenses]   = useState("");
  const [pEmployer, setPEmployer]   = useState("");
  const [pHousehold, setPHousehold] = useState("2");
  const [pRisk, setPRisk]           = useState("Moderate");
  const [pGoals, setPGoals]         = useState(["Retirement","Emergency Fund"]);

  // Step 3 – Assets
  const [assetRows, setAssetRows]   = useState(ASSET_SUGGESTIONS.map(s=>({...s, enabled:false, value:""})));
  const [customAssets, setCustomAssets] = useState([]);
  const [addingCustomA, setAddingCustomA] = useState(false);
  const [newCustA, setNewCustA]     = useState({name:"",category:"Cash & Deposits",value:""});

  // Step 4 – Liabilities
  const [liabRows, setLiabRows]     = useState(LIAB_SUGGESTIONS.map(s=>({...s, enabled:false, value:"", monthly:""})));
  const [customLiabs, setCustomLiabs] = useState([]);
  const [addingCustomL, setAddingCustomL] = useState(false);
  const [newCustL, setNewCustL]     = useState({name:"",category:"Mortgage",value:"",monthly:""});

  // Step 5 – Connect
  const [connected, setConnected]   = useState({singpass:false,dbs:false,ibkr:false,coinbase:false,cpf:false});
  const [connecting, setConnecting] = useState(null);

  const simulateConnect = (id) => {
    setConnecting(id);
    setTimeout(() => { setConnected(c=>({...c,[id]:true})); setConnecting(null); }, 1400);
  };

  const isStep1Valid = () => pName.trim().length > 1 && pEmail.includes("@") && pPassword.length >= 6 && pPassword === pPasswordC;
  const isStep2Valid = () => parseFloat(pSalary) > 0;

  const buildFinalAssets = () => {
    const out = [];
    assetRows.filter(r=>r.enabled && parseFloat(r.value)>0).forEach((r, i) => {
      out.push({ id: Date.now()+i, name:r.name, category:r.category, value:parseFloat(r.value),
        color: ASSET_COLORS[r.category]||"#94a3b8", icon: ASSET_ICONS[r.category]||"💼",
        institution:"Manual Entry", change: 0 });
    });
    customAssets.forEach((a,i) => {
      out.push({ id: Date.now()+100+i, name:a.name, category:a.category, value:parseFloat(a.value)||0,
        color: ASSET_COLORS[a.category]||"#94a3b8", icon: ASSET_ICONS[a.category]||"💼",
        institution:"Manual Entry", change:0 });
    });
    return out;
  };

  const buildFinalLiabs = () => {
    const out = [];
    liabRows.filter(r=>r.enabled && parseFloat(r.value)>0).forEach((r,i) => {
      out.push({ id: Date.now()+i, name:r.name, category:r.category, value:parseFloat(r.value),
        color:"#ef4444", monthly:parseFloat(r.monthly)||0, institution:"Manual Entry" });
    });
    customLiabs.forEach((l,i) => {
      out.push({ id: Date.now()+100+i, name:l.name, category:l.category, value:parseFloat(l.value)||0,
        color:"#ef4444", monthly:parseFloat(l.monthly)||0, institution:"Manual Entry" });
    });
    return out;
  };

  const handleFinish = () => {
    const assets = buildFinalAssets();
    const liabs  = buildFinalLiabs();
    const profile = {
      name:pName.trim(), dob:pDob, nationality:pNat, nric:pNric,
      phone:pPhone, email:pEmail, address:pAddress,
      salary:parseFloat(pSalary)||0, monthlyExpenses:parseFloat(pExpenses)||(parseFloat(pSalary)*0.5),
      employer:pEmployer, household:parseInt(pHousehold)||2, riskTolerance:pRisk,
      goals:pGoals, joinDate: new Date().toISOString(),
      passwordHash: btoa(unescape(encodeURIComponent(pPassword))),
    };
    onComplete({ profile, assets, liabs, connected });
  };

  const firstName = pName.trim().split(" ")[0] || "there";
  const finalScores = step >= 6 ? computeWellness(buildFinalAssets(), buildFinalLiabs(), { salary:pSalary, monthlyExpenses:pExpenses }) : null;

  const cardStyle = { background:"white", borderRadius:24, padding:"36px 40px",
    width:"100%", maxWidth:580, boxShadow:"0 24px 64px rgba(0,0,0,0.12)",
    border:"1px solid #fecaca", animation:"fadeUp 0.35s ease" };

  const btnPrimary = { padding:"12px 28px", borderRadius:12, border:"none",
    background:"linear-gradient(135deg,#dc2626,#b91c1c)", color:"white",
    fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif",
    transition:"opacity 0.2s" };

  const btnSecondary = { padding:"12px 20px", borderRadius:12,
    border:"1px solid #e5e7eb", background:"transparent", color:"#6b7280",
    fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fff5f5 0%,#fef2f2 50%,#fff1f1 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"24px 16px", fontFamily:"'Sora','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
        input:focus,select:focus{border-color:#dc2626!important;outline:none!important;box-shadow:0 0 0 3px rgba(220,38,38,0.12)!important;}
      `}</style>

      {/* Logo strip */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
        <div style={{ width:38, height:38, background:"linear-gradient(135deg,#dc2626,#991b1b)",
          borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, boxShadow:"0 4px 14px rgba(220,38,38,0.35)" }}>⬡</div>
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:"#1a0505" }}>WealthWell</div>
          <div style={{ fontSize:10, color:"#9ca3af" }}>WEALTH WELLNESS HUB · SG</div>
        </div>
      </div>

      {/* ── STEP 0: WELCOME ── */}
      {step === 0 && (
        <div style={{ ...cardStyle, textAlign:"center", maxWidth:520 }}>
          <div style={{ fontSize:48, marginBottom:18, animation:"pulse 2s infinite" }}>⬡</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"#1a0505", marginBottom:10, lineHeight:1.2 }}>
            Your complete financial<br/>command centre
          </h1>
          <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, marginBottom:28, maxWidth:400, margin:"0 auto 28px" }}>
            Track every asset. Measure your wellness. Simulate your future.<br/>
            <strong style={{color:"#dc2626"}}>Built for Singapore. Designed for clarity.</strong>
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:32 }}>
            {[
              { icon:"📊", t:"Unified Portfolio", d:"All assets in one place" },
              { icon:"🧠", t:"AI-Powered Insights", d:"Personalised to you" },
              { icon:"🔬", t:"Scenario Lab", d:"Test before it happens" },
            ].map((f,i)=>(
              <div key={i} style={{ padding:"14px 12px", borderRadius:14, background:"#fff5f5",
                border:"1px solid #fecaca", textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{f.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:"#1a0505", marginBottom:3 }}>{f.t}</div>
                <div style={{ fontSize:10, color:"#9ca3af" }}>{f.d}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setStep(1)} style={{ ...btnPrimary, width:"100%", padding:"14px", fontSize:14,
            boxShadow:"0 6px 20px rgba(220,38,38,0.35)" }}>
            Get Started →
          </button>
          <div style={{ marginTop:14, fontSize:11, color:"#9ca3af" }}>
            Takes about 3 minutes · All data stays on your device
          </div>
        </div>
      )}

      {/* ── STEP 1: PERSONAL DETAILS ── */}
      {step === 1 && (
        <div style={cardStyle}>
          <OB_ProgressBar step={1}/>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#1a0505", marginBottom:4 }}>Let's get to know you</h2>
          <p style={{ fontSize:12, color:"#9ca3af", marginBottom:22 }}>Your information is stored locally and never shared.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
            <div style={{ paddingRight:12 }}>
              <OB_Input label="Full Name" value={pName} onChange={setPName} placeholder="e.g. Alex Tan Wei Ming" required/>
              <OB_Input label="Date of Birth" value={pDob} onChange={setPDob} type="date" required/>
              <OB_Select label="Nationality" value={pNat} onChange={setPNat} options={NAT_OPTS}/>
              <OB_Input label="NRIC / FIN" value={pNric} onChange={setPNric} placeholder="S1234567A" hint="Optional — used for Singpass linking only"/>
            </div>
            <div style={{ paddingLeft:12, borderLeft:"1px solid #f3f4f6" }}>
              <OB_Input label="Mobile Number" value={pPhone} onChange={setPPhone} placeholder="9123 4567" type="tel"/>
              <OB_Input label="Email Address" value={pEmail} onChange={setPEmail} placeholder="alex@email.com" type="email" required/>
              <OB_Input label="Home Address" value={pAddress} onChange={setPAddress} placeholder="123 Tampines Street 21, #08-45"/>
            </div>
          </div>
          {/* ── Password section ── */}
          <div style={{marginTop:16,padding:"14px 16px",background:"#fff5f5",borderRadius:12,border:"1px solid #fecaca"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#dc2626",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
              🔒 Set a Password
              <span style={{fontSize:9,fontWeight:500,color:"#9ca3af"}}>Used to protect your data and confirm resets</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{position:"relative"}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#374151",marginBottom:5}}>
                  Password <span style={{color:"#dc2626"}}>*</span>
                  <span style={{fontSize:9,color:"#9ca3af",fontWeight:400}}> (min. 6 characters)</span>
                </label>
                <div style={{position:"relative"}}>
                  <input type={showPw?"text":"password"} value={pPassword} onChange={e=>setPPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{width:"100%",padding:"9px 36px 9px 11px",borderRadius:9,border:`1px solid ${pPassword.length>0&&pPassword.length<6?"#ef4444":"#e5e7eb"}`,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",background:"white"}}/>
                  <button type="button" onClick={()=>setShowPw(s=>!s)}
                    style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#9ca3af"}}>
                    {showPw?"🙈":"👁"}
                  </button>
                </div>
                {pPassword.length>0&&pPassword.length<6&&<div style={{fontSize:9,color:"#ef4444",marginTop:3}}>Must be at least 6 characters</div>}
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#374151",marginBottom:5}}>
                  Confirm Password <span style={{color:"#dc2626"}}>*</span>
                </label>
                <input type={showPw?"text":"password"} value={pPasswordC} onChange={e=>setPPasswordC(e.target.value)}
                  placeholder="Repeat password"
                  style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1px solid ${pPasswordC.length>0&&pPassword!==pPasswordC?"#ef4444":"#e5e7eb"}`,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",background:"white"}}/>
                {pPasswordC.length>0&&pPassword!==pPasswordC&&<div style={{fontSize:9,color:"#ef4444",marginTop:3}}>Passwords do not match</div>}
                {pPasswordC.length>0&&pPassword===pPasswordC&&pPassword.length>=6&&<div style={{fontSize:9,color:"#10b981",marginTop:3}}>✓ Passwords match</div>}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={()=>setStep(0)} style={btnSecondary}>← Back</button>
            <button onClick={()=>isStep1Valid()&&setStep(2)} style={{ ...btnPrimary, flex:1,
              opacity:isStep1Valid()?1:0.45, cursor:isStep1Valid()?"pointer":"not-allowed" }}>
              Continue →
            </button>
          </div>
          {!isStep1Valid() && <div style={{marginTop:8,fontSize:10,color:"#f87171",textAlign:"center"}}>
            {!pName.trim()||!pEmail.includes("@") ? "Please enter your name and a valid email to continue." :
             pPassword.length<6 ? "Password must be at least 6 characters." :
             pPassword!==pPasswordC ? "Passwords do not match." : ""}
          </div>}
        </div>
      )}

      {/* ── STEP 2: FINANCIAL PROFILE ── */}
      {step === 2 && (
        <div style={cardStyle}>
          <OB_ProgressBar step={2}/>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#1a0505", marginBottom:4 }}>Your Financial Profile</h2>
          <p style={{ fontSize:12, color:"#9ca3af", marginBottom:22 }}>This powers your Wellness Score and scenario simulations.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
            <div style={{ paddingRight:12 }}>
              <OB_Input label="Monthly Gross Salary (SGD)" value={pSalary} onChange={setPSalary} type="number" placeholder="8500" required hint="Before CPF deductions"/>
              <OB_Input label="Monthly Expenses (est. SGD)" value={pExpenses} onChange={setPExpenses} type="number" placeholder="4500" hint="Leave blank to auto-estimate"/>
              <OB_Input label="Employer / Company" value={pEmployer} onChange={setPEmployer} placeholder="Temasek Holdings"/>
            </div>
            <div style={{ paddingLeft:12, borderLeft:"1px solid #f3f4f6" }}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:5 }}>
                  Household Size: <strong style={{color:"#dc2626"}}>{pHousehold} {parseInt(pHousehold)===1?"person":"people"}</strong>
                </label>
                <input type="range" min="1" max="8" value={pHousehold} onChange={e=>setPHousehold(e.target.value)}
                  style={{ width:"100%", accentColor:"#dc2626" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#9ca3af", marginTop:2 }}>
                  <span>1</span><span>8</span>
                </div>
              </div>
              <OB_Select label="Risk Tolerance" value={pRisk} onChange={setPRisk} options={RISK_OPTS}/>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:6 }}>Financial Goals</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {GOALS_OPTS.map(g=>(
                    <button key={g} onClick={()=>setPGoals(gs=>gs.includes(g)?gs.filter(x=>x!==g):[...gs,g])}
                      style={{ padding:"4px 10px", borderRadius:99, border:`1px solid ${pGoals.includes(g)?"#dc2626":"#e5e7eb"}`,
                        background:pGoals.includes(g)?"#fef2f2":"white", color:pGoals.includes(g)?"#dc2626":"#6b7280",
                        fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button onClick={()=>setStep(1)} style={btnSecondary}>← Back</button>
            <button onClick={()=>isStep2Valid()&&setStep(3)} style={{ ...btnPrimary, flex:1,
              opacity:isStep2Valid()?1:0.45, cursor:isStep2Valid()?"pointer":"not-allowed" }}>
              Continue →
            </button>
          </div>
          {!isStep2Valid() && <div style={{marginTop:8,fontSize:10,color:"#f87171",textAlign:"center"}}>Please enter your monthly salary to continue.</div>}
        </div>
      )}

      {/* ── STEP 3: ASSETS ── */}
      {step === 3 && (
        <div style={{ ...cardStyle, maxWidth:640 }}>
          <OB_ProgressBar step={3}/>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#1a0505", marginBottom:4 }}>What do you own?</h2>
          <p style={{ fontSize:12, color:"#9ca3af", marginBottom:18 }}>Toggle any asset you own and enter its current value. You can add more later.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16, maxHeight:340, overflowY:"auto", paddingRight:4 }}>
            {assetRows.map((row, idx) => (
              <div key={idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                borderRadius:12, border:`1px solid ${row.enabled?"#fecaca":"#f3f4f6"}`,
                background:row.enabled?"#fff5f5":"#fafafa", transition:"all 0.2s" }}>
                <button onClick={()=>setAssetRows(rows=>rows.map((r,i)=>i===idx?{...r,enabled:!r.enabled}:r))}
                  style={{ width:22, height:22, borderRadius:6, border:`2px solid ${row.enabled?"#dc2626":"#d1d5db"}`,
                    background:row.enabled?"#dc2626":"white", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {row.enabled && <span style={{color:"white",fontSize:12,fontWeight:800}}>✓</span>}
                </button>
                <span style={{ fontSize:18, flexShrink:0 }}>{row.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#1a0505" }}>{row.name}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{row.category}</div>
                </div>
                {row.enabled && (
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#6b7280", flexShrink:0 }}>S$</span>
                    <input type="number" value={row.value} onChange={e=>setAssetRows(rows=>rows.map((r,i)=>i===idx?{...r,value:e.target.value}:r))}
                      placeholder={row.placeholder}
                      style={{ width:110, padding:"6px 10px", borderRadius:8, border:"1px solid #fecaca",
                        background:"white", fontSize:12, fontFamily:"'Sora',sans-serif", outline:"none",
                        color:"#1a0505" }}/>
                  </div>
                )}
              </div>
            ))}
            {customAssets.map((a, idx) => (
              <div key={"ca"+idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                borderRadius:12, border:"1px solid #fecaca", background:"#fff5f5" }}>
                <span style={{ fontSize:16 }}>{ASSET_ICONS[a.category]||"💼"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#1a0505" }}>{a.name}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{a.category}</div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#dc2626" }}>S${parseFloat(a.value||0).toLocaleString()}</span>
                <button onClick={()=>setCustomAssets(ca=>ca.filter((_,i)=>i!==idx))}
                  style={{ background:"#fee2e2", border:"none", borderRadius:6, width:22, height:22, color:"#dc2626", cursor:"pointer", fontSize:12, fontWeight:800 }}>✕</button>
              </div>
            ))}
          </div>
          {addingCustomA ? (
            <div style={{ padding:"14px", borderRadius:12, border:"1px dashed #fca5a5", background:"#fff5f5", marginBottom:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                <input placeholder="Asset name" value={newCustA.name} onChange={e=>setNewCustA(a=>({...a,name:e.target.value}))}
                  style={{padding:"8px 10px",borderRadius:8,border:"1px solid #fecaca",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                <select value={newCustA.category} onChange={e=>setNewCustA(a=>({...a,category:e.target.value}))}
                  style={{padding:"8px 10px",borderRadius:8,border:"1px solid #fecaca",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none",background:"white"}}>
                  {ASSET_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Value (SGD)" value={newCustA.value} onChange={e=>setNewCustA(a=>({...a,value:e.target.value}))}
                  style={{padding:"8px 10px",borderRadius:8,border:"1px solid #fecaca",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setAddingCustomA(false)} style={{ ...btnSecondary, padding:"7px 14px", fontSize:11 }}>Cancel</button>
                <button onClick={()=>{ if(newCustA.name&&newCustA.value){ setCustomAssets(ca=>[...ca,newCustA]); setNewCustA({name:"",category:"Cash & Deposits",value:""}); setAddingCustomA(false); }}}
                  style={{ ...btnPrimary, padding:"7px 14px", fontSize:11 }}>Add</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setAddingCustomA(true)}
              style={{ width:"100%", padding:"9px", borderRadius:10, border:"1px dashed #fca5a5",
                background:"transparent", color:"#dc2626", fontSize:12, fontWeight:600, cursor:"pointer",
                fontFamily:"'Sora',sans-serif", marginBottom:12 }}>+ Add Custom Asset</button>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setStep(2)} style={btnSecondary}>← Back</button>
            <button onClick={()=>setStep(4)} style={{ ...btnSecondary, flex:1 }}>Skip for now</button>
            <button onClick={()=>setStep(4)} style={{ ...btnPrimary, flex:2 }}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── STEP 4: LIABILITIES ── */}
      {step === 4 && (
        <div style={{ ...cardStyle, maxWidth:640 }}>
          <OB_ProgressBar step={4}/>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#1a0505", marginBottom:4 }}>What do you owe?</h2>
          <p style={{ fontSize:12, color:"#9ca3af", marginBottom:18 }}>Adding liabilities gives you an accurate Net Worth and Debt Score.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {liabRows.map((row, idx) => (
              <div key={idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                borderRadius:12, border:`1px solid ${row.enabled?"#fecaca":"#f3f4f6"}`,
                background:row.enabled?"#fff5f5":"#fafafa", transition:"all 0.2s" }}>
                <button onClick={()=>setLiabRows(rows=>rows.map((r,i)=>i===idx?{...r,enabled:!r.enabled}:r))}
                  style={{ width:22, height:22, borderRadius:6, border:`2px solid ${row.enabled?"#dc2626":"#d1d5db"}`,
                    background:row.enabled?"#dc2626":"white", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {row.enabled && <span style={{color:"white",fontSize:12,fontWeight:800}}>✓</span>}
                </button>
                <span style={{ fontSize:18, flexShrink:0 }}>{row.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#1a0505" }}>{row.name}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{row.category}</div>
                </div>
                {row.enabled && (
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#9ca3af", marginBottom:2 }}>Total (S$)</div>
                      <input type="number" value={row.value} onChange={e=>setLiabRows(rows=>rows.map((r,i)=>i===idx?{...r,value:e.target.value}:r))}
                        placeholder={row.placeholder}
                        style={{ width:95, padding:"6px 8px", borderRadius:8, border:"1px solid #fecaca", background:"white", fontSize:11, fontFamily:"'Sora',sans-serif", outline:"none" }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#9ca3af", marginBottom:2 }}>Monthly (S$)</div>
                      <input type="number" value={row.monthly} onChange={e=>setLiabRows(rows=>rows.map((r,i)=>i===idx?{...r,monthly:e.target.value}:r))}
                        placeholder={row.mpHolder}
                        style={{ width:85, padding:"6px 8px", borderRadius:8, border:"1px solid #fecaca", background:"white", fontSize:11, fontFamily:"'Sora',sans-serif", outline:"none" }}/>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {customLiabs.map((l, idx) => (
              <div key={"cl"+idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                borderRadius:12, border:"1px solid #fecaca", background:"#fff5f5" }}>
                <span style={{ fontSize:16 }}>💳</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#1a0505" }}>{l.name}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{l.category}</div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#ef4444" }}>S${parseFloat(l.value||0).toLocaleString()}</span>
                <button onClick={()=>setCustomLiabs(cl=>cl.filter((_,i)=>i!==idx))}
                  style={{ background:"#fee2e2", border:"none", borderRadius:6, width:22, height:22, color:"#dc2626", cursor:"pointer", fontSize:12, fontWeight:800 }}>✕</button>
              </div>
            ))}
          </div>
          {addingCustomL ? (
            <div style={{ padding:"14px", borderRadius:12, border:"1px dashed #fca5a5", background:"#fff5f5", marginBottom:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                <input placeholder="Name" value={newCustL.name} onChange={e=>setNewCustL(l=>({...l,name:e.target.value}))}
                  style={{padding:"8px 10px",borderRadius:8,border:"1px solid #fecaca",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                <select value={newCustL.category} onChange={e=>setNewCustL(l=>({...l,category:e.target.value}))}
                  style={{padding:"8px 10px",borderRadius:8,border:"1px solid #fecaca",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none",background:"white"}}>
                  {LIAB_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Total (S$)" value={newCustL.value} onChange={e=>setNewCustL(l=>({...l,value:e.target.value}))}
                  style={{padding:"8px 10px",borderRadius:8,border:"1px solid #fecaca",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                <input type="number" placeholder="Monthly (S$)" value={newCustL.monthly} onChange={e=>setNewCustL(l=>({...l,monthly:e.target.value}))}
                  style={{padding:"8px 10px",borderRadius:8,border:"1px solid #fecaca",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setAddingCustomL(false)} style={{ ...btnSecondary, padding:"7px 14px", fontSize:11 }}>Cancel</button>
                <button onClick={()=>{ if(newCustL.name&&newCustL.value){ setCustomLiabs(cl=>[...cl,newCustL]); setNewCustL({name:"",category:"Mortgage",value:"",monthly:""}); setAddingCustomL(false); }}}
                  style={{ ...btnPrimary, padding:"7px 14px", fontSize:11 }}>Add</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setAddingCustomL(true)}
              style={{ width:"100%", padding:"9px", borderRadius:10, border:"1px dashed #fca5a5",
                background:"transparent", color:"#dc2626", fontSize:12, fontWeight:600, cursor:"pointer",
                fontFamily:"'Sora',sans-serif", marginBottom:12 }}>+ Add Custom Liability</button>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setStep(3)} style={btnSecondary}>← Back</button>
            <button onClick={()=>setStep(5)} style={{ ...btnSecondary, flex:1 }}>Skip for now</button>
            <button onClick={()=>setStep(5)} style={{ ...btnPrimary, flex:2 }}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── STEP 5: CONNECT ACCOUNTS ── */}
      {step === 5 && (
        <div style={cardStyle}>
          <OB_ProgressBar step={5}/>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#1a0505", marginBottom:4 }}>Connect your accounts</h2>
          <p style={{ fontSize:12, color:"#9ca3af", marginBottom:6 }}>Securely link accounts for automatic updates. All connections are <strong>read-only</strong> — we can never execute trades or move funds.</p>
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            {["🔒 256-bit encrypted","👁️ Read-only access","🚫 No trading","🗑️ Delete anytime"].map((t,i)=>(
              <div key={i} style={{ padding:"4px 8px", borderRadius:8, background:"#fff5f5",
                border:"1px solid #fecaca", fontSize:9, fontWeight:700, color:"#dc2626" }}>{t}</div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {CONNECTED_PLATFORMS.map(p=>(
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                borderRadius:14, border:`1px solid ${connected[p.id]?"#bbf7d0":"#f3f4f6"}`,
                background:connected[p.id]?"#f0fdf4":"white", transition:"all 0.3s" }}>
                <div style={{ width:40, height:40, borderRadius:12, background:`${p.color}14`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{p.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1a0505" }}>{p.name}</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{p.desc}</div>
                </div>
                {connected[p.id] ? (
                  <span style={{ padding:"4px 12px", borderRadius:99, background:"#dcfce7",
                    color:"#16a34a", fontSize:11, fontWeight:700 }}>✓ Connected</span>
                ) : (
                  <button onClick={()=>simulateConnect(p.id)}
                    disabled={connecting===p.id}
                    style={{ padding:"7px 16px", borderRadius:9, border:`1px solid ${p.color}`,
                      background:"transparent", color:p.color, fontSize:11, fontWeight:700,
                      cursor:connecting===p.id?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif",
                      opacity: connecting===p.id ? 0.5 : 1 }}>
                    {connecting===p.id ? "Connecting…" : "Connect"}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setStep(4)} style={btnSecondary}>← Back</button>
            <button onClick={()=>setStep(6)} style={{ ...btnSecondary, flex:1 }}>Skip for now</button>
            <button onClick={()=>setStep(6)} style={{ ...btnPrimary, flex:2 }}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── STEP 6: DONE ── */}
      {step === 6 && (() => {
        const fa = buildFinalAssets(), fl = buildFinalLiabs();
        const scores = computeWellness(fa, fl, { salary:pSalary, monthlyExpenses:pExpenses });
        const totalA = fa.reduce((s,a)=>s+a.value,0), totalL = fl.reduce((s,l)=>s+l.value,0);
        return (
          <div style={{ ...cardStyle, textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#dc2626", letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Setup Complete!</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:"#1a0505", marginBottom:4 }}>Welcome to WealthWell, {firstName}!</h2>
            <p style={{ fontSize:12, color:"#9ca3af", marginBottom:24 }}>Here's your initial Wealth Wellness snapshot.</p>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
              <Ring score={scores.overall} size={130} dark={false}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
              {[
                { l:"Net Worth",    v: `S$${(totalA-totalL).toLocaleString()}`, c:"#1a0505" },
                { l:"Total Assets", v: `S$${totalA.toLocaleString()}`,          c:"#10b981" },
                { l:"Total Debts",  v: `-S$${totalL.toLocaleString()}`,          c:"#ef4444" },
              ].map((s,i)=>(
                <div key={i} style={{ padding:"14px 12px", borderRadius:14, background:"#fff5f5", border:"1px solid #fecaca" }}>
                  <div style={{ fontSize:10, color:"#9ca3af", marginBottom:4 }}>{s.l}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
            {scores.liquidity < 60 && (
              <div style={{ padding:"10px 14px", borderRadius:10, background:"#fff1f0",
                border:"1px solid #fca5a5", marginBottom:16, fontSize:11, color:"#b91c1c", textAlign:"left" }}>
                ⚠️ <strong>Priority action:</strong> Your emergency fund covers only {scores.liqMonths} months of expenses. The app will guide you to fix this first.
              </div>
            )}
            <button onClick={handleFinish}
              style={{ ...btnPrimary, width:"100%", padding:"14px", fontSize:14,
                boxShadow:"0 6px 20px rgba(220,38,38,0.35)" }}>
              Enter WealthWell →
            </button>
            <div style={{ marginTop:12, fontSize:10, color:"#9ca3af" }}>Your data is saved locally. You can edit everything inside the app.</div>
          </div>
        );
      })()}
    </div>
  );
}

// Scenario tag → scenario id mapping for action prioritisation
const SCENARIO_ACTION_MAP = {
  crash:      "Market Crash",
  jobloss:    "Job Loss",
  rates:      "Rate Hike",
  retirement: "Retirement",
  property:   "Protection",
};

const buildActionsForScenario = (scenarioId, baseActions) => {
  // If a scenario is selected, return its unique dedicated actions (never mixed with other scenarios)
  if (scenarioId && SCENARIO_ACTIONS[scenarioId]) {
    return SCENARIO_ACTIONS[scenarioId];
  }
  // Default (no scenario): return base dynamic actions
  return baseActions;
};

// ─── ADD ASSET PANEL (standalone — uncontrolled refs, no per-keystroke re-render) ───
function AddAssetPanel({ onAdd, onClose, cur, accentPrimary, card, bdr, txt, sub }) {
  const nameRef  = React.useRef();
  const instRef  = React.useRef();
  const valRef   = React.useRef();
  const [cat,    setCat]    = React.useState("Cash & Deposits");
  const [error,  setError]  = React.useState("");
  const [preview,setPreview]= React.useState(null);

  // Live preview — only updates when value/category select changes
  const refreshPreview = () => {
    const v = parseFloat(valRef.current?.value);
    setPreview(isNaN(v)||v<=0 ? null : v);
  };

  const handleSubmit = () => {
    const name = nameRef.current?.value?.trim();
    const val  = parseFloat(valRef.current?.value);
    if (!name)        { setError("Please enter an asset name."); nameRef.current?.focus(); return; }
    if (!val || val<=0){ setError("Please enter a value greater than 0."); valRef.current?.focus(); return; }
    onAdd({
      name, category: cat,
      value: val / cur.rate,
      institution: instRef.current?.value?.trim() || "Manual Entry",
    });
  };

  const catColor = ASSET_COLORS[cat] || "#94a3b8";
  const catIcon  = ASSET_ICONS[cat]  || "💼";

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:card,borderRadius:22,width:480,border:`1px solid ${bdr}`,animation:"fadeUp 0.28s ease",boxShadow:"0 24px 64px rgba(0,0,0,0.18)",overflow:"hidden",fontFamily:"'Sora',sans-serif"}}>

        {/* Header strip */}
        <div style={{background:`linear-gradient(135deg,${catColor}22,${catColor}08)`,padding:"20px 24px 16px",borderBottom:`1px solid ${catColor}33`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${catColor}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`2px solid ${catColor}44`}}>
              {catIcon}
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:txt}}>Add New Asset</div>
              <div style={{fontSize:10,color:sub,marginTop:1}}>Value in {cur.code} · {cur.flag}</div>
            </div>
            <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",fontSize:20,cursor:"pointer",color:sub,lineHeight:1}}>×</button>
          </div>
        </div>

        <div style={{padding:"20px 24px 24px"}}>
          {/* Category picker — visual chips */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Category</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {ASSET_CATS.map(c=>(
                <button key={c} onClick={()=>setCat(c)}
                  style={{padding:"5px 11px",borderRadius:99,border:`1.5px solid ${cat===c?(ASSET_COLORS[c]||"#94a3b8"):"#e2e8f0"}`,
                    background:cat===c?`${ASSET_COLORS[c]||"#94a3b8"}18`:"white",
                    color:cat===c?(ASSET_COLORS[c]||"#94a3b8"):sub,
                    fontSize:10,fontWeight:cat===c?800:500,cursor:"pointer",
                    fontFamily:"'Sora',sans-serif",transition:"all 0.15s",
                    display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11}}>{ASSET_ICONS[c]||"💼"}</span> {c}
                </button>
              ))}
            </div>
          </div>

          {/* Fields — native inputs with refs, zero re-render on typing */}
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Asset Name *</label>
            <input ref={nameRef} defaultValue="" placeholder="e.g. S&P 500 ETF, DBS Savings, Gold Bar..."
              onChange={()=>setError("")}
              style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",boxSizing:"border-box"}}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Value ({cur.code}) *</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700,color:catColor}}>{cur.symbol}</span>
                <input ref={valRef} type="number" min="0" defaultValue="" placeholder="0.00"
                  onChange={refreshPreview}
                  style={{width:"100%",padding:"10px 13px 10px 30px",borderRadius:10,border:`1.5px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Institution</label>
              <input ref={instRef} defaultValue="" placeholder="e.g. DBS, IBKR, Manual..."
                style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Live preview pill */}
          {preview&&(
            <div style={{background:`${catColor}12`,border:`1px solid ${catColor}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>{catIcon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:catColor,fontWeight:700}}>Preview</div>
                <div style={{fontSize:12,fontWeight:800,color:txt}}>{cur.symbol}{(preview).toLocaleString("en-SG",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              </div>
              <div style={{fontSize:10,color:sub}}>{cat}</div>
            </div>
          )}

          {error&&<div style={{fontSize:10,color:"#ef4444",fontWeight:600,marginBottom:10,padding:"8px 12px",background:"#fff1f0",borderRadius:8,border:"1px solid #fca5a5"}}>{error}</div>}

          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"11px",background:"transparent",border:`1.5px solid ${bdr}`,borderRadius:10,color:sub,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"all 0.15s"}}>Cancel</button>
            <button onClick={handleSubmit}
              style={{flex:2,padding:"11px",background:`linear-gradient(135deg,${accentPrimary},#10b981)`,color:"white",border:"none",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:`0 4px 14px ${accentPrimary}44`,transition:"all 0.15s"}}>
              ＋ Add Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADD LIABILITY PANEL (standalone — uncontrolled refs) ────────────────────
function AddLiabPanel({ onAdd, onClose, cur, card, bdr, txt, sub }) {
  const nameRef    = React.useRef();
  const instRef    = React.useRef();
  const totalRef   = React.useRef();
  const monthlyRef = React.useRef();
  const [cat,      setCat]    = React.useState("Mortgage");
  const [error,    setError]  = React.useState("");
  const [preview,  setPreview]= React.useState(null);

  const LIAB_ICONS = {"Mortgage":"🏠","Personal Loan":"🏦","Credit Card":"💳","Car Loan":"🚗","Business Loan":"🏢","Student Loan":"📚","Other":"📋"};
  const LIAB_COLORS= {"Mortgage":"#ef4444","Personal Loan":"#f43f5e","Credit Card":"#f97316","Car Loan":"#fb923c","Business Loan":"#dc2626","Student Loan":"#fbbf24","Other":"#94a3b8"};
  const catColor   = LIAB_COLORS[cat] || "#ef4444";
  const catIcon    = LIAB_ICONS[cat]  || "📋";

  const refreshPreview = () => {
    const v = parseFloat(totalRef.current?.value);
    setPreview(isNaN(v)||v<=0 ? null : v);
  };

  const handleSubmit = () => {
    const name  = nameRef.current?.value?.trim();
    const total = parseFloat(totalRef.current?.value);
    if (!name)          { setError("Please enter a liability name."); nameRef.current?.focus(); return; }
    if (!total||total<=0){ setError("Please enter a total amount greater than 0."); totalRef.current?.focus(); return; }
    onAdd({
      name, category: cat,
      value:   total / cur.rate,
      monthly: parseFloat(monthlyRef.current?.value)||0,
      institution: instRef.current?.value?.trim() || "Manual Entry",
    });
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:card,borderRadius:22,width:480,border:`1px solid ${bdr}`,animation:"fadeUp 0.28s ease",boxShadow:"0 24px 64px rgba(0,0,0,0.18)",overflow:"hidden",fontFamily:"'Sora',sans-serif"}}>

        {/* Header strip */}
        <div style={{background:`linear-gradient(135deg,${catColor}18,${catColor}06)`,padding:"20px 24px 16px",borderBottom:`1px solid ${catColor}33`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${catColor}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`2px solid ${catColor}44`}}>
              {catIcon}
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:txt}}>Add New Liability</div>
              <div style={{fontSize:10,color:sub,marginTop:1}}>Value in {cur.code} · {cur.flag}</div>
            </div>
            <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",fontSize:20,cursor:"pointer",color:sub,lineHeight:1}}>×</button>
          </div>
        </div>

        <div style={{padding:"20px 24px 24px"}}>
          {/* Category picker */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Liability Type</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {LIAB_CATS.map(c=>(
                <button key={c} onClick={()=>setCat(c)}
                  style={{padding:"5px 11px",borderRadius:99,border:`1.5px solid ${cat===c?(LIAB_COLORS[c]||"#ef4444"):"#e2e8f0"}`,
                    background:cat===c?`${LIAB_COLORS[c]||"#ef4444"}18`:"white",
                    color:cat===c?(LIAB_COLORS[c]||"#ef4444"):sub,
                    fontSize:10,fontWeight:cat===c?800:500,cursor:"pointer",
                    fontFamily:"'Sora',sans-serif",transition:"all 0.15s",
                    display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11}}>{LIAB_ICONS[c]||"📋"}</span> {c}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Liability Name *</label>
            <input ref={nameRef} defaultValue="" placeholder="e.g. HDB Mortgage, OCBC Car Loan..."
              onChange={()=>setError("")}
              style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",boxSizing:"border-box"}}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Total ({cur.code}) *</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:11,fontWeight:700,color:"#ef4444"}}>{cur.symbol}</span>
                <input ref={totalRef} type="number" min="0" defaultValue="" placeholder="0"
                  onChange={refreshPreview}
                  style={{width:"100%",padding:"10px 10px 10px 26px",borderRadius:10,border:`1.5px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Monthly ({cur.code})</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:11,fontWeight:700,color:"#f97316"}}>{cur.symbol}</span>
                <input ref={monthlyRef} type="number" min="0" defaultValue="" placeholder="0"
                  style={{width:"100%",padding:"10px 10px 10px 26px",borderRadius:10,border:`1.5px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:sub,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Institution</label>
              <input ref={instRef} defaultValue="" placeholder="e.g. DBS, OCBC"
                style={{width:"100%",padding:"10px 10px",borderRadius:10,border:`1.5px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Live preview */}
          {preview&&(
            <div style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>{catIcon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"#dc2626",fontWeight:700}}>Preview · {cat}</div>
                <div style={{fontSize:12,fontWeight:800,color:"#ef4444"}}>−{cur.symbol}{(preview).toLocaleString("en-SG",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              </div>
            </div>
          )}

          {error&&<div style={{fontSize:10,color:"#ef4444",fontWeight:600,marginBottom:10,padding:"8px 12px",background:"#fff1f0",borderRadius:8,border:"1px solid #fca5a5"}}>{error}</div>}

          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"11px",background:"transparent",border:`1.5px solid ${bdr}`,borderRadius:10,color:sub,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Cancel</button>
            <button onClick={handleSubmit}
              style={{flex:2,padding:"11px",background:"linear-gradient(135deg,#ef4444,#f97316)",color:"white",border:"none",borderRadius:10,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 14px rgba(239,68,68,0.35)"}}>
              ＋ Add Liability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  {id:"home",      label:"Home",         icon:"⬡"},
  {id:"portfolio", label:"Portfolio",    icon:"◈"},
  {id:"insights",  label:"Insights",     icon:"◎"},
  {id:"scenarios", label:"Scenario Lab", icon:"⟁"},
  {id:"actions",   label:"Actions",      icon:"✦"},
  {id:"trust",     label:"Trust Centre", icon:"◉"},
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Onboarding gate ──
  const [onboarded, setOnboarded] = useState(false);
  const [loading,   setLoading]   = useState(true);

  // ── Core state ──
  const [profile,  setProfile]  = useState(null);
  const [assets,   setAssets]   = useState([]);
  const [liabs,    setLiabs]    = useState([]);
  const [connected,setConnected]= useState({});
  const [expenses, setExpenses] = useState(INIT_EXPENSES);
  const [spendLimit,setSpendLimit] = useState(100);
  const [done,     setDone]     = useState([]);
  const [params,   setParams]   = useState({crash:{equityDrop:20,cryptoDrop:40},jobloss:{months:12},rates:{hikePct:2},retirement:{years:26,monthly:500},property:{price:600000}});

  // ── UI state ──
  const [screen,   setScreen]   = useState("home");
  const [pro,      setPro]      = useState(false);
  const [cur,      setCur]      = useState(CURRENCIES[0]);
  const [showCurPicker, setShowCurPicker] = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [profileEdit,   setProfileEdit]   = useState(false);
  const [editP,         setEditP]         = useState({});
  const [revealPhone,   setRevealPhone]   = useState(false);
  const [editAssets,    setEditAssets]    = useState(false);
  const [editLiabs,     setEditLiabs]     = useState(false);
  const [addAssetOpen,  setAddAssetOpen]  = useState(false);
  const [addLiabOpen,   setAddLiabOpen]   = useState(false);
  const [newA, setNewA] = useState({name:"",category:"Cash & Deposits",value:"",institution:""});
  const [newL, setNewL] = useState({name:"",category:"Mortgage",value:"",monthly:"",institution:""});
  const [cardIdx,  setCardIdx]  = useState(0);
  const [histTab,  setHistTab]  = useState(false);
  const [scenario, setScenario] = useState(null);
  const [newExpense,    setNewExpense]    = useState({name:"",category:"Food & Drink",amount:""});
  const [addExpOpen,    setAddExpOpen]    = useState(false);
  const [editLimit,     setEditLimit]     = useState(false);
  const [hovTooltip,    setHovTooltip]    = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPwInput,    setResetPwInput]    = useState("");
  const [resetPwError,    setResetPwError]    = useState("");

  // ── Load from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.profile && d.profile.name) {
          setProfile(d.profile);
          setAssets(d.assets   || []);
          setLiabs(d.liabs     || []);
          setConnected(d.connected || {});
          setExpenses(d.expenses   || INIT_EXPENSES);
          setSpendLimit(d.spendLimit || 100);
          setDone(d.done           || []);
          setParams(d.params       || params);
          setOnboarded(true);
        }
      }
    } catch(e) { /* silent fail */ }
    setLoading(false);
  }, []);

  // ── Persist to localStorage on every change ──
  useEffect(() => {
    if (!onboarded || !profile) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile, assets, liabs, connected, expenses, spendLimit, done, params
      }));
    } catch(e) {}
  }, [profile, assets, liabs, connected, expenses, spendLimit, done, params, onboarded]);

  // ── Onboarding complete callback ──
  const handleOnboardingComplete = useCallback((data) => {
    setProfile(data.profile);
    setAssets(data.assets   || []);
    setLiabs(data.liabs     || []);
    setConnected(data.connected || {});
    setOnboarded(true);
    setEditP(data.profile);
  }, []);

  // ── Keep editP in sync with profile ──
  useEffect(() => { if (profile) setEditP({...profile}); }, [profile]);

  // ── Computed values ──
  const totalA   = assets.reduce((s,a)=>s+a.value,0);
  const totalL   = liabs.reduce((s,l)=>s+l.value,0);
  const netWorth = totalA - totalL;
  const scores   = profile ? computeWellness(assets, liabs, profile) : null;
  const wellness = scores ? scores.overall : 0;
  const METRICS  = scores && profile ? buildMetrics(scores, profile) : [];
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (scores && assets !== undefined && liabs !== undefined && profile) {
      setActions(buildActions(scores, assets, liabs, profile));
      setCardIdx(0);
    }
  }, [assets, liabs, profile]);

  const todayExp = expenses.filter(e=>e.date==="today").reduce((s,e)=>s+e.amount,0);

  // ── Theme ──
  // ── Theme (static — pro toggle only affects the Insights tab) ──
  const bg           = "#f1f5f9";
  const card         = "#ffffff";
  const bdr          = "#e2e8f0";
  const txt          = "#0f172a";
  const sub          = "#64748b";
  const sidebarBg    = "#1e3a8a";
  const topBand      = "linear-gradient(135deg,#1d4ed8 0%,#3b82f6 60%,#60a5fa 100%)";
  const accentPrimary = "#1d4ed8";

  // ── Scenario impact ──
  const calcImpact = () => {
    if (!scenario || !profile) return null;
    const p  = params;
    const eV = assets.filter(a=>a.category==="Stocks & ETFs").reduce((s,a)=>s+a.value,0);
    const cV = assets.filter(a=>a.category==="Cryptocurrency").reduce((s,a)=>s+a.value,0);
    const pV = assets.filter(a=>a.category==="Real Estate").reduce((s,a)=>s+a.value,0);
    const gV = assets.filter(a=>a.category==="Commodities").reduce((s,a)=>s+a.value,0);
    if (scenario==="crash") {
      const ei=-eV*(p.crash.equityDrop/100), ci=-cV*(p.crash.cryptoDrop/100), gi=gV*0.06;
      return{nw:Math.round(ei+ci+gi),sc:-Math.round(p.crash.equityDrop/20*8),details:[`Stocks/ETFs: ${fc(ei,cur)}`,`Crypto: ${fc(ci,cur)}`,`Gold hedge: +${fc(gi,cur,true)}`,`Property: minimal impact`]};
    }
    if (scenario==="jobloss") {
      const salary = profile.salary || 6000;
      const burn = salary * p.jobloss.months;
      return{nw:-Math.round(burn),sc:-12,details:[`Monthly salary lost: ${fc(salary,cur)}`,`Total over ${p.jobloss.months} months: ${fc(burn,cur)}`,`Emergency fund depleted in ${scores?.liqMonths||2.4} months`,`Forced investment liquidation at month 3`]};
    }
    if (scenario==="rates") {
      const pi=-pV*0.02*p.rates.hikePct, li=-totalL*0.01*p.rates.hikePct;
      return{nw:Math.round(pi+li),sc:-Math.round(p.rates.hikePct*2),details:[`Property value: ${fc(pi,cur)}`,`Mortgage cost: +${fc(totalL*0.01*p.rates.hikePct,cur,true)}/yr`,`Cash yield: +${fc(totalA*0.003*p.rates.hikePct,cur,true)}/yr`,`Bond prices: down moderately`]};
    }
    if (scenario==="retirement") {
      const growth = netWorth*(Math.pow(1.065,p.retirement.years)-1)+p.retirement.monthly*12*p.retirement.years*1.5;
      return{nw:Math.round(growth),sc:12,details:[`Portfolio growth (6.5% p.a.): ${fc(netWorth*(Math.pow(1.065,p.retirement.years)-1),cur,true)}`,`CPF payouts: +${fc(142000*1.4,cur,true)}`,`Savings boost: +${fc(p.retirement.monthly*12*p.retirement.years,cur,true)}`,`Retirement in ${p.retirement.years} years`]};
    }
    if (scenario==="property") {
      return{nw:Math.round(p.property.price*0.15),sc:-6,details:[`New mortgage: −${fc(p.property.price*0.8,cur)}`,`Down payment: −${fc(p.property.price*0.2,cur)}`,`Equity gained: +${fc(p.property.price*0.2,cur,true)}`,`Liquidity score drops to ~28`]};
    }
    return null;
  };
  const impact = calcImpact();
  const sd     = SCENARIOS_DEF.find(s=>s.id===scenario);

  // ── Asset / Liability CRUD ──
  const addAsset = ({ name, category, value, institution }) => {
    setAssets(a=>[...a,{id:Date.now(), name, category,
      value, color:ASSET_COLORS[category]||"#94a3b8",
      icon:ASSET_ICONS[category]||"💼", institution, change:0}]);
    setAddAssetOpen(false);
    setAddAssetOpen(false);
  };
  const addLiab = ({ name, category, value, monthly, institution }) => {
    setLiabs(l=>[...l,{id:Date.now(), name, category,
      value, color:"#ef4444",
      monthly, institution}]);
    setAddLiabOpen(false);
    setAddLiabOpen(false);
  };
  const markDone = id => {
    const a = actions.find(x=>x.id===id);
    if (a) { setDone(d=>[{...a,doneAt:new Date().toLocaleDateString("en-SG")},...d].slice(0,10)); setActions(ac=>ac.filter(x=>x.id!==id)); setCardIdx(0); }
  };
  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    setExpenses(ex=>[{id:Date.now(),name:newExpense.name,category:newExpense.category,
      amount:parseFloat(newExpense.amount),
      time:new Date().toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"}),date:"today"},...ex]);
    setNewExpense({name:"",category:"Food & Drink",amount:""});
    setAddExpOpen(false);
  };
  const resetApp = () => {
    if (window.confirm("Reset all data and return to onboarding? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const expCatColors = {"Food & Drink":"#f59e0b","Transport":"#06b6d4","Groceries":"#10b981","Entertainment":"#8b5cf6","Shopping":"#ec4899","Health":"#ef4444","Utilities":"#94a3b8","Education":"#6366f1","Other":"#475569"};

  // ── Modal helper ──
  const Modal = ({title,subtitle,onClose,children}) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:card,borderRadius:20,padding:26,width:430,border:`1px solid ${bdr}`,animation:"fadeUp 0.28s ease",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{fontSize:15,fontWeight:800,color:txt,marginBottom:2}}>{title}</div>
        <div style={{fontSize:11,color:sub,marginBottom:18}}>{subtitle}</div>
        {children}
      </div>
    </div>
  );

  // ── Loading / Onboarding gate ──
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#fff5f5",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:32,animation:"pulse 1.2s infinite"}}>⬡</div>
    </div>
  );
  if (!onboarded) return <OnboardingWizard onComplete={handleOnboardingComplete}/>;
  if (!profile)   return <OnboardingWizard onComplete={handleOnboardingComplete}/>;

  const firstName = (profile.name||"").split(" ")[0] || "User";

  return (
    <div style={{fontFamily:"'Sora','Segoe UI',sans-serif",minHeight:"100vh",width:"100%",background:bg,position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(13px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
        @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
        .sc{animation:fadeUp 0.3s ease;}
        .hov:hover{transform:translateY(-2px)!important;box-shadow:0 8px 26px rgba(0,0,0,0.09)!important;transition:all 0.2s!important;}
        .nb:hover{background:rgba(255,255,255,0.14)!important;}
        input:focus,select:focus{border-color:#6366f1!important;outline:none!important;}
      `}</style>

      <div style={{position:"fixed",top:0,left:220,right:0,height:195,background:topBand,zIndex:0,pointerEvents:"none",transition:"background 0.4s"}}/>

      {/* ── SIDEBAR ── */}
      <div style={{position:"fixed",left:0,top:0,bottom:0,width:220,background:sidebarBg,display:"flex",flexDirection:"column",zIndex:100,transition:"background 0.4s"}}>
        <div style={{padding:"18px 14px 12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:15}}>
            <div style={{width:32,height:32,background:"rgba(255,255,255,0.16)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>⬡</div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"white"}}>WealthWell</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>Financial Hub · SG</div>
            </div>
          </div>

        </div>
        <nav style={{flex:1,padding:"0 9px",display:"flex",flexDirection:"column",gap:1}}>
          {NAV.map(n=>(
            <button key={n.id} className="nb" onClick={()=>setScreen(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:8,border:"none",background:screen===n.id?"rgba(255,255,255,0.18)":"transparent",color:screen===n.id?"white":"rgba(255,255,255,0.52)",fontWeight:screen===n.id?700:400,fontSize:12,fontFamily:"'Sora',sans-serif",cursor:"pointer",transition:"all 0.16s",borderLeft:screen===n.id?"3px solid rgba(255,255,255,0.7)":"3px solid transparent"}}>
              <span style={{fontSize:13}}>{n.icon}</span>
              <strong style={{fontWeight:screen===n.id?800:600}}>{n.label}</strong>
              {n.id==="actions"&&actions.length>0&&<span style={{marginLeft:"auto",background:"#fbbf24",color:"#0f172a",borderRadius:99,width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800}}>{actions.length}</span>}
            </button>
          ))}
        </nav>

        {/* Currency */}
        <div style={{padding:"0 9px 7px",position:"relative"}}>
          <button onClick={()=>setShowCurPicker(s=>!s)} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 11px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:8,color:"white",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
            <span>{cur.flag}</span><strong>{cur.code}</strong><span style={{marginLeft:"auto",opacity:.5,fontSize:10}}>⇅</span>
          </button>
          {showCurPicker&&(
            <div style={{position:"absolute",bottom:"100%",left:6,right:6,background:card,borderRadius:11,border:`1px solid ${bdr}`,padding:5,marginBottom:3,boxShadow:"0 8px 30px rgba(0,0,0,0.2)",zIndex:200}}>
              {CURRENCIES.map(c=>(
                <button key={c.code} onClick={()=>{setCur(c);setShowCurPicker(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:7,border:"none",background:cur.code===c.code?"#f1f5f9":"transparent",cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
                  <span style={{fontSize:14}}>{c.flag}</span>
                  <strong style={{fontSize:11,color:txt}}>{c.code}</strong>
                  <span style={{fontSize:10,color:sub,marginLeft:"auto"}}>{c.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile + Reset area */}
        <div style={{padding:"0 9px 16px"}}>
          {/* Profile row */}
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            <button onClick={()=>setProfileOpen(true)} style={{flex:1,display:"flex",alignItems:"center",gap:9,padding:"9px 11px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:10,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"background 0.2s"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:accentPrimary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"white",flexShrink:0}}>
                {(profile.name||"U").charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontSize:11,fontWeight:700,color:"white"}}>{firstName}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>{profile.riskTolerance||"Moderate"} · {profile.nationality?.split(" ")[0]||"SG"}</div>
              </div>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>⚙</span>
            </button>
          </div>

          {/* New Profile / Reset button */}
          {!showResetConfirm ? (
            <button
              onClick={()=>{setShowResetConfirm(true);setResetPwInput("");setResetPwError("");}}
              style={{width:"100%",padding:"7px 11px",borderRadius:9,border:"1px solid rgba(255,255,255,0.18)",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.6)",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,38,38,0.25)";e.currentTarget.style.borderColor="rgba(220,38,38,0.5)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.borderColor="rgba(255,255,255,0.18)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}
            >
              <span style={{fontSize:12}}>↩</span> New Profile / Reset
            </button>
          ) : (
            <div style={{background:"rgba(220,38,38,0.18)",border:"1px solid rgba(220,38,38,0.45)",borderRadius:10,padding:"10px 11px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#fca5a5",marginBottom:6,lineHeight:1.4}}>
                🔒 Enter your password to confirm reset
              </div>
              <div style={{fontSize:9,color:"rgba(255,200,200,0.7)",marginBottom:8,lineHeight:1.4}}>
                ⚠️ This will permanently clear all your data.
              </div>
              <div style={{position:"relative",marginBottom:6}}>
                <input
                  type="password"
                  value={resetPwInput}
                  onChange={e=>{setResetPwInput(e.target.value);setResetPwError("");}}
                  placeholder="Your password"
                  style={{width:"100%",padding:"7px 10px",borderRadius:7,border:`1px solid ${resetPwError?"#f87171":"rgba(255,255,255,0.2)"}`,background:"rgba(0,0,0,0.3)",color:"white",fontSize:11,fontFamily:"'Sora',sans-serif",outline:"none"}}
                />
                {resetPwError&&<div style={{fontSize:9,color:"#f87171",marginTop:3}}>{resetPwError}</div>}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button
                  onClick={()=>{setShowResetConfirm(false);setResetPwInput("");setResetPwError("");}}
                  style={{flex:1,padding:"6px 0",borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.7)",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}
                >Cancel</button>
                <button
                  onClick={()=>{
                    const stored = profile?.passwordHash;
                    const entered = btoa(unescape(encodeURIComponent(resetPwInput)));
                    if(!stored){ localStorage.removeItem(STORAGE_KEY); window.location.reload(); return; }
                    if(entered===stored){ localStorage.removeItem(STORAGE_KEY); window.location.reload(); }
                    else { setResetPwError("Incorrect password. Try again."); }
                  }}
                  style={{flex:2,padding:"6px 0",borderRadius:7,border:"none",background:"#dc2626",color:"white",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}
                >Confirm Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{marginLeft:220,minHeight:"100vh",display:"flex",flexDirection:"column",width:"calc(100% - 220px)",boxSizing:"border-box"}}>
        <div style={{padding:"22px 24px 0",position:"relative",zIndex:10}}>

          {/* ══ HOME ══ */}
          {screen==="home"&&(
            <div className="sc">
              <div style={{marginBottom:13}}>
                <Lbl style={{color:"rgba(255,255,255,0.65)"}}>Good morning, {firstName} 👋</Lbl>
                <h1 style={{fontSize:23,fontWeight:800,color:"white"}}>Wealth Dashboard</h1>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11,marginBottom:13}}>
                {[
                  {l:"Net Worth",     v:fc(netWorth,cur),     c:"#0f172a", hi:netWorth>=0,  sp:INIT_WEALTH_HIST},
                  {l:"Total Assets",  v:fc(totalA,cur),       c:"#10b981", hi:true,          sp:INIT_WEALTH_HIST},
                  {l:"Total Liabilities",v:`-${fc(totalL,cur)}`,c:"#ef4444",hi:false,        sp:null},
                ].map((x,i)=>(
                  <div key={i} className="hov" style={{background:card,borderRadius:15,padding:18,border:`1px solid ${bdr}`,transition:"all .3s"}}>
                    <Lbl>{x.l}</Lbl>
                    <div style={{fontSize:22,fontWeight:800,color:x.c,marginBottom:6}}>{x.v}</div>
                    {x.sp&&<Spark data={x.sp} color={x.hi?"#10b981":"#6366f1"} w={130}/>}
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
                <div className="hov" style={{background:card,borderRadius:15,padding:18,border:`1px solid ${bdr}`,display:"flex",gap:16,alignItems:"center",transition:"all .3s"}}>
                  <Ring score={wellness} size={115} dark={false}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:txt,marginBottom:3}}>Wealth Wellness Score</div>
                    <div style={{fontSize:11,color:sub,marginBottom:9}}>Based on {METRICS.length} financial health metrics</div>
                    {METRICS.slice(0,3).map((m,i)=>(
                      <div key={i} style={{marginBottom:6}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:9,fontWeight:700,color:sub}}>{m.label}</span>
                          <strong style={{fontSize:9,color:m.color}}>{m.score}</strong>
                        </div>
                        <div style={{height:3,background:"#f1f5f9",borderRadius:99}}><div style={{height:"100%",width:`${m.score}%`,background:m.color,borderRadius:99}}/></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hov" style={{background:card,borderRadius:15,padding:18,border:`1px solid ${bdr}`,transition:"all .3s"}}>
                  <div style={{fontSize:12,fontWeight:800,color:txt,marginBottom:11}}>Portfolio Composition</div>
                  <EDonut assets={assets} liabilities={liabs} cur={cur}/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                {METRICS.slice(0,3).map((m,i)=>(
                  <div key={i} className="hov" style={{background:card,borderRadius:13,padding:14,border:`1px solid ${bdr}`,borderLeft:`4px solid ${m.color}`,transition:"all .3s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <div style={{fontSize:11,fontWeight:800,color:txt}}>{m.label}</div>
                      <strong style={{fontSize:17,color:m.color}}>{m.score}</strong>
                    </div>
                    <div style={{height:4,background:"#f1f5f9",borderRadius:99,marginBottom:5}}><div style={{height:"100%",width:`${m.score}%`,background:m.color,borderRadius:99}}/></div>
                    <div style={{fontSize:9,fontWeight:700,color:m.color,background:`${m.color}14`,padding:"3px 7px",borderRadius:5}}>{m.tip}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PORTFOLIO ══ */}
          {screen==="portfolio"&&(
            <div className="sc">
              <div style={{marginBottom:13,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div><Lbl style={{color:"rgba(255,255,255,0.65)"}}>Balance Sheet</Lbl><h1 style={{fontSize:23,fontWeight:800,color:"white"}}>Portfolio</h1></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setAddAssetOpen(true)} style={{padding:"7px 14px",background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.28)",color:"white",borderRadius:9,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>+ Asset</button>
                  <button onClick={()=>setAddLiabOpen(true)} style={{padding:"7px 14px",background:"rgba(239,68,68,0.3)",border:"1px solid rgba(239,68,68,0.5)",color:"white",borderRadius:9,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>+ Liability</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11,marginBottom:11}}>
                {[
                  {l:"Total Assets",      v:fc(totalA,cur),       c:"#10b981"},
                  {l:"Total Liabilities", v:`-${fc(totalL,cur)}`, c:"#ef4444"},
                  {l:"Net Worth",         v:fc(netWorth,cur),     c:accentPrimary},
                ].map((x,i)=>(
                  <div key={i} style={{background:card,borderRadius:13,padding:16,border:`1px solid ${bdr}`,textAlign:"center"}}>
                    <Lbl>{x.l}</Lbl>
                    <div style={{fontSize:22,fontWeight:800,color:x.c}}>{x.v}</div>
                  </div>
                ))}
              </div>
              <div className="hov" style={{background:card,borderRadius:15,padding:18,border:`1px solid ${bdr}`,marginBottom:10,transition:"all .3s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:800,color:txt}}>Assets <span style={{fontSize:10,color:sub,fontWeight:500}}>({assets.length} positions)</span></div>
                  <button onClick={()=>setEditAssets(e=>!e)} style={{padding:"5px 13px",background:editAssets?"#ef4444":"#f1f5f9",border:`1px solid ${editAssets?"#ef4444":bdr}`,borderRadius:8,color:editAssets?"white":sub,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"all 0.2s"}}>
                    {editAssets?"✓ Done":"✏ Edit"}
                  </button>
                </div>
                {assets.length === 0 ? (
                  <div style={{textAlign:"center",padding:"24px",color:sub,fontSize:11}}>
                    No assets yet. <button onClick={()=>setAddAssetOpen(true)} style={{color:accentPrimary,background:"none",border:"none",cursor:"pointer",fontWeight:700,fontSize:11,fontFamily:"'Sora',sans-serif"}}>Add your first asset →</button>
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {assets.map(a=>(
                      <div key={a.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",background:editAssets?"#fff5f5":"#f8fafc",borderRadius:10,border:`1px solid ${editAssets?"#fca5a5":bdr}`,transition:"all .2s"}}>
                        <div style={{width:36,height:36,borderRadius:9,background:`${a.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{a.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:800,color:txt}}>{a.name}</div>
                          <div style={{fontSize:9,color:sub,fontWeight:600}}>{a.category} · {a.institution}</div>
                        </div>
                        <div style={{textAlign:"right",marginRight:7}}>
                          <div style={{fontSize:12,fontWeight:800,color:txt}}>{fc(a.value,cur)}</div>
                          <div style={{fontSize:9,fontWeight:700,color:a.change>=0?"#10b981":"#ef4444"}}>{a.change>=0?"↑":"↓"}{Math.abs(a.change||0)}%</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <div style={{width:40,height:3,background:"#e2e8f0",borderRadius:99}}><div style={{height:"100%",width:`${totalA>0?(a.value/totalA)*100:0}%`,background:a.color,borderRadius:99}}/></div>
                          <span style={{fontSize:9,color:sub,width:22,textAlign:"right",fontWeight:700}}>{totalA>0?Math.round(a.value/totalA*100):0}%</span>
                        </div>
                        {editAssets&&<button onClick={()=>setAssets(as=>as.filter(x=>x.id!==a.id))} style={{marginLeft:4,background:"#ef4444",border:"none",color:"white",borderRadius:6,width:22,height:22,fontSize:12,cursor:"pointer",fontWeight:800,flexShrink:0}}>✕</button>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="hov" style={{background:card,borderRadius:15,padding:18,border:`1px solid ${bdr}`,transition:"all .3s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:800,color:txt}}>Liabilities <span style={{fontSize:10,color:sub,fontWeight:500}}>({liabs.length} items)</span></div>
                  <button onClick={()=>setEditLiabs(e=>!e)} style={{padding:"5px 13px",background:editLiabs?"#ef4444":"#f1f5f9",border:`1px solid ${editLiabs?"#ef4444":bdr}`,borderRadius:8,color:editLiabs?"white":sub,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"all 0.2s"}}>
                    {editLiabs?"✓ Done":"✏ Edit"}
                  </button>
                </div>
                {liabs.length === 0 ? (
                  <div style={{textAlign:"center",padding:"24px",color:sub,fontSize:11}}>
                    No liabilities recorded. <button onClick={()=>setAddLiabOpen(true)} style={{color:"#ef4444",background:"none",border:"none",cursor:"pointer",fontWeight:700,fontSize:11,fontFamily:"'Sora',sans-serif"}}>Add a liability →</button>
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {liabs.map(l=>(
                      <div key={l.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",background:editLiabs?"#fff5f5":"#fff5f5",borderRadius:10,border:`1px solid ${editLiabs?"#fca5a5":"#fecaca"}`,transition:"all .2s"}}>
                        <div style={{width:36,height:36,borderRadius:9,background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💳</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:800,color:txt}}>{l.name}</div>
                          <div style={{fontSize:9,color:sub,fontWeight:600}}>{l.category} · <strong>Monthly: {fc(l.monthly,cur)}</strong></div>
                        </div>
                        <div style={{fontSize:12,fontWeight:800,color:"#ef4444"}}>−{fc(l.value,cur)}</div>
                        {editLiabs&&<button onClick={()=>setLiabs(lb=>lb.filter(x=>x.id!==l.id))} style={{marginLeft:4,background:"#ef4444",border:"none",color:"white",borderRadius:6,width:22,height:22,fontSize:12,cursor:"pointer",fontWeight:800,flexShrink:0}}>✕</button>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ INSIGHTS ══ */}
          {screen==="insights"&&(
            <div className="sc">
              <div style={{marginBottom:13,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div>
                  <Lbl style={{color:"rgba(255,255,255,0.65)"}}>Why Your Score Is {wellness}</Lbl>
                  <h1 style={{fontSize:23,fontWeight:800,color:"white"}}>Insights</h1>
                </div>
                {/* Investor / Pro toggle — top-right of Insights only */}
                <div style={{display:"flex",background:"rgba(0,0,0,0.22)",borderRadius:9,padding:3,gap:2}}>
                  {["Investor","Pro"].map(m=>(
                    <button key={m} onClick={()=>setPro(m==="Pro")}
                      style={{padding:"6px 16px",borderRadius:7,border:"none",fontSize:10,fontWeight:700,
                        fontFamily:"'Sora',sans-serif",cursor:"pointer",transition:"all 0.2s",
                        background:(m==="Pro")===pro?"rgba(255,255,255,0.9)":"transparent",
                        color:(m==="Pro")===pro?"#dc2626":"rgba(255,255,255,0.7)"}}>
                      {m==="Pro"?"⬡ Pro":"◎ Investor"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:11}}>
                {METRICS.map((m,i)=>(
                  <div key={i} className="hov" style={{background:card,borderRadius:13,padding:16,border:`1px solid ${bdr}`,borderLeft:`4px solid ${m.color}`,transition:"all .3s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <div style={{fontSize:11,fontWeight:800,color:txt}}>{m.label}</div>
                      <strong style={{fontSize:18,color:m.color}}>{m.score}</strong>
                    </div>
                    <div style={{height:5,background:"#f1f5f9",borderRadius:99,marginBottom:6}}><div style={{height:"100%",width:`${m.score}%`,background:m.color,borderRadius:99}}/></div>
                    <div style={{fontSize:9,fontWeight:600,color:sub,marginBottom:4}}>{m.desc}</div>
                    <div style={{fontSize:9,fontWeight:700,color:m.color,background:`${m.color}14`,padding:"4px 7px",borderRadius:5}}>{m.tip}</div>
                  </div>
                ))}
              </div>
              {pro&&(
                <>
                  {/* Bloomberg Pro analytics panel */}
                  <div style={{background:"linear-gradient(135deg,#1a0505,#2d0808)",borderRadius:15,padding:20,border:"1px solid #7f1d1d",marginBottom:11}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                      <div style={{background:"linear-gradient(135deg,#dc2626,#9f1239)",borderRadius:5,padding:"2px 9px",fontSize:9,fontWeight:800,color:"white",letterSpacing:1}}>⬡ PRO</div>
                      <div style={{fontSize:12,fontWeight:800,color:"#fef2f2"}}>Advanced Risk & Performance Analytics</div>
                      <div style={{fontSize:9,color:"#fca5a5",marginLeft:"auto"}}>Hover metrics for explanation</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {PRO_METRICS.map((m,i)=>(
                        <div key={i} onMouseEnter={()=>setHovTooltip(i)} onMouseLeave={()=>setHovTooltip(null)}
                          style={{background:"#0f0000",borderRadius:10,padding:12,border:"1px solid",cursor:"default",position:"relative",transition:"border-color 0.2s",borderColor:hovTooltip===i?"#dc2626":"#3d0a0a"}}>
                          <div style={{fontSize:8,color:"#fca5a5",fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:.7}}>{m.label}</div>
                          <div style={{fontSize:18,fontWeight:800,color:m.color,fontFamily:"'Courier New',monospace"}}>{m.value}</div>
                          <div style={{fontSize:8,color:"#7f1d1d",marginTop:3,fontWeight:600}}>{m.sub}</div>
                          {m.good===true&&<div style={{position:"absolute",top:7,right:8,width:6,height:6,borderRadius:"50%",background:"#10b981"}}/>}
                          {m.good===false&&<div style={{position:"absolute",top:7,right:8,width:6,height:6,borderRadius:"50%",background:"#ef4444"}}/>}
                          {hovTooltip===i&&(
                            <div style={{position:"absolute",bottom:"110%",left:"50%",transform:"translateX(-50%)",background:"#1a0505",border:"1px solid #dc2626",borderRadius:8,padding:"8px 11px",fontSize:10,color:"#fef2f2",lineHeight:1.5,width:200,zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
                              {m.tooltip}
                              <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",border:"5px solid transparent",borderTopColor:"#dc2626"}}/>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Balance Sheet Generator */}
                  {(()=>{
                    const bsDate = new Date().toLocaleDateString("en-SG",{day:"2-digit",month:"long",year:"numeric"});
                    const assetsByCategory = Object.entries(
                      assets.reduce((acc,a)=>({...acc,[a.category]:(acc[a.category]||0)+a.value}),{})
                    ).sort((a,b)=>b[1]-a[1]);
                    const liabsByCategory = Object.entries(
                      liabs.reduce((acc,l)=>({...acc,[l.category]:(acc[l.category]||0)+l.value}),{})
                    ).sort((a,b)=>b[1]-a[1]);
                    const savingsRate = Math.max(0,Math.round((1-(profile.monthlyExpenses||0)/(profile.salary||1))*100));
                    const monthlySavings = Math.max(0,(profile.salary||0)-(profile.monthlyExpenses||0));
                    return (
                      <div style={{background:"white",borderRadius:15,padding:24,border:"2px solid #dc2626",marginBottom:11,fontFamily:"'Sora',sans-serif"}}>
                        {/* Header */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:14,borderBottom:"2px solid #1d4ed8"}}>
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                              <div style={{background:"linear-gradient(135deg,#dc2626,#9f1239)",borderRadius:5,padding:"2px 9px",fontSize:9,fontWeight:800,color:"white",letterSpacing:1}}>⬡ PRO</div>
                              <span style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:1,textTransform:"uppercase"}}>Statement of Financial Position</span>
                            </div>
                            <div style={{fontSize:20,fontWeight:800,color:"#0f172a"}}>{profile.name||"WealthWell User"}</div>
                            <div style={{fontSize:10,color:"#64748b",marginTop:2}}>As at {bsDate} · All figures in {cur.code}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:10,color:"#64748b",marginBottom:2}}>Net Worth</div>
                            <div style={{fontSize:26,fontWeight:800,color:netWorth>=0?"#10b981":"#ef4444"}}>{fc(netWorth,cur)}</div>
                            <div style={{fontSize:9,color:"#64748b"}}>Wellness Score: <strong style={{color:"#dc2626"}}>{wellness}/100</strong></div>
                          </div>
                        </div>

                        {/* Two-column balance sheet */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
                          {/* ASSETS */}
                          <div>
                            <div style={{fontSize:11,fontWeight:800,color:"#10b981",textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:"1px solid #e2e8f0"}}>Assets</div>
                            {assetsByCategory.length===0
                              ? <div style={{fontSize:10,color:"#94a3b8",fontStyle:"italic"}}>No assets recorded</div>
                              : assetsByCategory.map(([cat,val],i)=>(
                                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px dotted #f1f5f9"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <div style={{width:8,height:8,borderRadius:2,background:ASSET_COLORS[cat]||"#94a3b8",flexShrink:0}}/>
                                    <span style={{fontSize:10,color:"#374151",fontWeight:600}}>{cat}</span>
                                  </div>
                                  <span style={{fontSize:10,fontWeight:700,color:"#0f172a",fontFamily:"'Courier New',monospace"}}>{fc(val,cur)}</span>
                                </div>
                              ))
                            }
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:"2px solid #10b981"}}>
                              <span style={{fontSize:11,fontWeight:800,color:"#10b981"}}>TOTAL ASSETS</span>
                              <span style={{fontSize:12,fontWeight:800,color:"#10b981",fontFamily:"'Courier New',monospace"}}>{fc(totalA,cur)}</span>
                            </div>
                          </div>

                          {/* LIABILITIES + EQUITY */}
                          <div>
                            <div style={{fontSize:11,fontWeight:800,color:"#ef4444",textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:"1px solid #e2e8f0"}}>Liabilities</div>
                            {liabsByCategory.length===0
                              ? <div style={{fontSize:10,color:"#94a3b8",fontStyle:"italic"}}>No liabilities recorded</div>
                              : liabsByCategory.map(([cat,val],i)=>(
                                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px dotted #f1f5f9"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <div style={{width:8,height:8,borderRadius:2,background:"#ef4444",flexShrink:0}}/>
                                    <span style={{fontSize:10,color:"#374151",fontWeight:600}}>{cat}</span>
                                  </div>
                                  <span style={{fontSize:10,fontWeight:700,color:"#ef4444",fontFamily:"'Courier New',monospace"}}>({fc(val,cur)})</span>
                                </div>
                              ))
                            }
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:"2px solid #ef4444"}}>
                              <span style={{fontSize:11,fontWeight:800,color:"#ef4444"}}>TOTAL LIABILITIES</span>
                              <span style={{fontSize:12,fontWeight:800,color:"#ef4444",fontFamily:"'Courier New',monospace"}}>({fc(totalL,cur)})</span>
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:"2px solid #1d4ed8",background:"#fff5f5",borderRadius:6,padding:"8px 10px",marginTop:10}}>
                              <span style={{fontSize:11,fontWeight:800,color:"#dc2626"}}>NET WORTH (EQUITY)</span>
                              <span style={{fontSize:12,fontWeight:800,color:netWorth>=0?"#10b981":"#ef4444",fontFamily:"'Courier New',monospace"}}>{fc(netWorth,cur)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Income & cash flow summary */}
                        <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid #e2e8f0"}}>
                          <div style={{fontSize:11,fontWeight:800,color:"#0f172a",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Monthly Cash Flow Summary</div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                            {[
                              {l:"Gross Income",  v:fc(profile.salary||0,cur),    c:"#10b981"},
                              {l:"Total Expenses",v:fc(profile.monthlyExpenses||(profile.salary||0)*0.5,cur), c:"#ef4444"},
                              {l:"Net Savings",   v:fc(monthlySavings,cur),       c:monthlySavings>=0?"#10b981":"#ef4444"},
                              {l:"Savings Rate",  v:`${savingsRate}%`,            c:savingsRate>=20?"#10b981":"#f59e0b"},
                            ].map((x,i)=>(
                              <div key={i} style={{background:"#f8fafc",borderRadius:9,padding:"10px 12px",border:"1px solid #e2e8f0",borderTop:`3px solid ${x.c}`}}>
                                <div style={{fontSize:9,fontWeight:700,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{x.l}</div>
                                <div style={{fontSize:14,fontWeight:800,color:x.c,fontFamily:"'Courier New',monospace"}}>{x.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer note */}
                        <div style={{marginTop:14,paddingTop:10,borderTop:"1px solid #e2e8f0",fontSize:9,color:"#94a3b8",display:"flex",justifyContent:"space-between"}}>
                          <span>Generated by WealthWell Pro · {bsDate}</span>
                          <span>All figures are self-reported estimates · Not a substitute for professional financial advice</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                <div className="hov" style={{background:card,borderRadius:13,padding:18,border:`1px solid ${bdr}`,transition:"all .3s"}}>
                  <div style={{fontSize:12,fontWeight:800,color:txt,marginBottom:11}}>Portfolio Composition by Category</div>
                  {Object.entries(assets.reduce((acc,a)=>({...acc,[a.category]:(acc[a.category]||0)+a.value}),{}))
                    .sort((a,b)=>b[1]-a[1])
                    .map(([cat,val],i)=>(
                    <div key={i} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:10,fontWeight:600,color:txt}}>{cat}</span>
                        <strong style={{fontSize:10,color:ASSET_COLORS[cat]||"#94a3b8"}}>{totalA>0?Math.round(val/totalA*100):0}%</strong>
                      </div>
                      <div style={{height:5,background:"#f1f5f9",borderRadius:99}}><div style={{height:"100%",width:`${totalA>0?(val/totalA*100):0}%`,background:ASSET_COLORS[cat]||"#94a3b8",borderRadius:99}}/></div>
                    </div>
                  ))}
                  {assets.length===0&&<div style={{textAlign:"center",padding:"20px",color:sub,fontSize:11}}>Add assets in Portfolio to see breakdown</div>}
                </div>
                <div className="hov" style={{background:card,borderRadius:13,padding:18,border:`1px solid ${bdr}`,transition:"all .3s"}}>
                  <div style={{fontSize:12,fontWeight:800,color:txt,marginBottom:11}}>Financial Health Summary</div>
                  {[
                    {l:"Monthly Salary",    v:fc(profile.salary||0,cur),                                  c:accentPrimary},
                    {l:"Monthly Expenses",  v:fc(profile.monthlyExpenses||(profile.salary||0)*0.5,cur),    c:"#ef4444"},
                    {l:"Savings Rate",      v:`${Math.max(0,Math.round((1-(profile.monthlyExpenses||0)/(profile.salary||1))*100))}%`, c:"#10b981"},
                    {l:"Debt-to-Asset",     v:`${scores?.debtRatioPct||0}%`,                              c:parseFloat(scores?.debtRatioPct||0)>15?"#ef4444":"#10b981"},
                    {l:"Emergency Fund",    v:`${scores?.liqMonths||0} months`,                            c:parseFloat(scores?.liqMonths||0)>=6?"#10b981":"#ef4444"},
                    {l:"Risk Tolerance",    v:profile.riskTolerance||"Moderate",                           c:"#8b5cf6"},
                  ].map((f,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<5?`1px solid ${bdr}`:"none"}}>
                      <span style={{fontSize:10,fontWeight:700,color:sub}}>{f.l}</span>
                      <strong style={{fontSize:11,color:f.c}}>{f.v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ SCENARIOS ══ */}
          {screen==="scenarios"&&(
            <div className="sc">
              {/* Bloomberg-style header with live ticker bar */}
              <div style={{marginBottom:11}}>
                <Lbl style={{color:"rgba(255,255,255,0.65)"}}>Stress-Test Your Portfolio</Lbl>
                <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
                  <h1 style={{fontSize:23,fontWeight:800,color:"white",margin:0}}>Scenario Lab</h1>
                  <div style={{display:"flex",gap:6,alignItems:"center",background:"rgba(0,0,0,0.3)",borderRadius:6,padding:"5px 10px",border:"1px solid rgba(255,255,255,0.08)"}}>
                    <span style={{fontSize:8,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>MAS SORA</span>
                    <span style={{fontSize:10,fontWeight:800,color:"#10b981",fontFamily:"'Courier New',monospace"}}>3.82%</span>
                    <span style={{fontSize:8,color:"rgba(255,255,255,0.25)",margin:"0 2px"}}>|</span>
                    <span style={{fontSize:8,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>CPF-OA</span>
                    <span style={{fontSize:10,fontWeight:800,color:"#f59e0b",fontFamily:"'Courier New',monospace"}}>2.50%</span>
                    <span style={{fontSize:8,color:"rgba(255,255,255,0.25)",margin:"0 2px"}}>|</span>
                    <span style={{fontSize:8,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>ABSD 2nd</span>
                    <span style={{fontSize:10,fontWeight:800,color:"#ef4444",fontFamily:"'Courier New',monospace"}}>17%</span>
                  </div>
                </div>
              </div>
              {/* Bloomberg-style scenario selector tiles */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
                {SCENARIOS_DEF.map(s=>{
                  const active = scenario===s.id;
                  return (
                  <button key={s.id} onClick={()=>{
                    const newId = active ? null : s.id;
                    setScenario(newId);
                    const base = buildActions(scores, assets, liabs, profile);
                    setActions(buildActionsForScenario(newId, base));
                    setCardIdx(0);
                  }} style={{padding:0,borderRadius:0,border:`1px solid ${active?s.color:"#334155"}`,background:active?"#0f172a":"#fff",cursor:"pointer",transition:"all 0.18s",display:"flex",flexDirection:"column",fontFamily:"'Sora',sans-serif",overflow:"hidden",boxShadow:active?`0 0 18px ${s.color}44`:"none"}}>
                    {/* Colour accent bar */}
                    <div style={{height:3,background:active?s.color:"#334155",transition:"background 0.18s"}}/>
                    <div style={{padding:"11px 10px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:18}}>{s.icon}</span>
                        <span style={{fontSize:8,fontWeight:700,color:active?s.color:"#64748b",background:active?`${s.color}18`:"#f1f5f9",padding:"2px 6px",borderRadius:2,fontFamily:"'Courier New',monospace"}}>{s.ticker}</span>
                      </div>
                      <strong style={{fontSize:10,color:active?s.color:"#1e293b",display:"block",marginBottom:3,textAlign:"left"}}>{s.label}</strong>
                      <div style={{fontSize:8.5,color:active?"#94a3b8":"#64748b",textAlign:"left",lineHeight:1.4,marginBottom:6}}>{s.desc}</div>
                      <div style={{fontSize:11,fontWeight:800,color:s.deltaUp?"#10b981":"#ef4444",fontFamily:"'Courier New',monospace",textAlign:"left"}}>{s.delta}</div>
                    </div>
                  </button>
                  );
                })}
              </div>
              {scenario&&sd&&impact&&(
                <div style={{display:"grid",gridTemplateColumns:"270px 1fr",gap:11,animation:"fadeUp 0.3s ease"}}>
                  <div style={{background:card,borderRadius:14,padding:18,border:`2px solid ${sd.color}44`}}>
                    <div style={{fontSize:12,fontWeight:800,color:txt,marginBottom:12,display:"flex",gap:7,alignItems:"center"}}><span>{sd.icon}</span><strong>Adjust Parameters</strong></div>
                    {scenario==="crash"&&[{l:"Equity drop",k:"equityDrop",min:5,max:60,step:5,u:"%"},{l:"Crypto drop",k:"cryptoDrop",min:10,max:90,step:10,u:"%"}].map(sl=>(
                      <div key={sl.k} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,fontWeight:700,color:sub}}>{sl.l}</span><strong style={{fontSize:11,color:sd.color}}>{params.crash[sl.k]}{sl.u}</strong></div>
                        <input type="range" min={sl.min} max={sl.max} step={sl.step} value={params.crash[sl.k]} onChange={e=>setParams(p=>({...p,crash:{...p.crash,[sl.k]:+e.target.value}}))} style={{width:"100%",accentColor:sd.color}}/>
                      </div>
                    ))}
                    {scenario==="jobloss"&&<div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,fontWeight:700,color:sub}}>Months without income</span><strong style={{fontSize:11,color:sd.color}}>{params.jobloss.months} mo.</strong></div>
                      <input type="range" min={1} max={24} value={params.jobloss.months} onChange={e=>setParams(p=>({...p,jobloss:{months:+e.target.value}}))} style={{width:"100%",accentColor:sd.color}}/>
                      <div style={{marginTop:9,background:`${sd.color}12`,borderRadius:7,padding:"7px 9px",fontSize:10,fontWeight:700,color:sd.color}}>Monthly salary: <strong>{fc(profile.salary||0,cur)}</strong></div>
                    </div>}
                    {scenario==="rates"&&<div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,fontWeight:700,color:sub}}>Rate increase</span><strong style={{fontSize:11,color:sd.color}}>{params.rates.hikePct}%</strong></div>
                      <input type="range" min={0.25} max={5} step={0.25} value={params.rates.hikePct} onChange={e=>setParams(p=>({...p,rates:{hikePct:+e.target.value}}))} style={{width:"100%",accentColor:sd.color}}/>
                    </div>}
                    {scenario==="retirement"&&[{l:"Years to retirement",k:"years",min:5,max:40,fmt:v=>`${v} yrs`},{l:`Monthly savings (${cur.code})`,k:"monthly",min:100,max:5000,step:100,fmt:v=>fc(v,cur,true)}].map(sl=>(
                      <div key={sl.k} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,fontWeight:700,color:sub}}>{sl.l}</span><strong style={{fontSize:11,color:sd.color}}>{sl.fmt(params.retirement[sl.k])}</strong></div>
                        <input type="range" min={sl.min||5} max={sl.max} step={sl.step||1} value={params.retirement[sl.k]} onChange={e=>setParams(p=>({...p,retirement:{...p.retirement,[sl.k]:+e.target.value}}))} style={{width:"100%",accentColor:sd.color}}/>
                      </div>
                    ))}
                    {scenario==="property"&&<div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,fontWeight:700,color:sub}}>Property price</span><strong style={{fontSize:11,color:sd.color}}>{fc(params.property.price,cur,true)}</strong></div>
                      <input type="range" min={300000} max={3000000} step={50000} value={params.property.price} onChange={e=>setParams(p=>({...p,property:{price:+e.target.value}}))} style={{width:"100%",accentColor:sd.color}}/>
                    </div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                      <div style={{background:sd.bg,borderRadius:13,padding:16,border:`2px solid ${sd.color}33`,textAlign:"center"}}>
                        <Lbl style={{marginBottom:5}}>Portfolio Impact</Lbl>
                        <div style={{fontSize:21,fontWeight:800,color:impact.nw<0?"#ef4444":"#10b981",marginBottom:3}}>{impact.nw>0?"+":""}{fc(impact.nw,cur)}</div>
                        <div style={{fontSize:9,fontWeight:700,color:sub}}>{fc(netWorth,cur,true)} → {fc(netWorth+impact.nw,cur,true)}</div>
                      </div>
                      <div style={{background:card,borderRadius:13,padding:16,border:`1px solid ${bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                        <Lbl style={{marginBottom:0}}>Wellness Score</Lbl>
                        {(() => {
                          const newScore = Math.max(0, Math.min(100, wellness + impact.sc));
                          const r=34, circ=2*Math.PI*r, sz=90;
                          const dashOld=(wellness/100)*circ, dashNew=(newScore/100)*circ;
                          const col = newScore>=75?"#10b981":newScore>=55?"#f59e0b":"#ef4444";
                          return (
                            <div style={{position:"relative",width:sz,height:sz}}>
                              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7"/>
                                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7"
                                  strokeDasharray={`${dashOld} ${circ-dashOld}`} strokeLinecap="round"
                                  transform={`rotate(-90 ${sz/2} ${sz/2})`} opacity="0.35"/>
                                <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={col} strokeWidth="7"
                                  strokeDasharray={`${dashNew} ${circ-dashNew}`} strokeLinecap="round"
                                  transform={`rotate(-90 ${sz/2} ${sz/2})`}
                                  style={{transition:"stroke-dasharray 0.8s ease"}}/>
                                <text x={sz/2} y={sz/2-3} textAnchor="middle" fontSize="18" fontWeight="800"
                                  fill={col} fontFamily="'Sora',sans-serif">{newScore}</text>
                                <text x={sz/2} y={sz/2+11} textAnchor="middle" fontSize="7" fill="#94a3b8"
                                  fontFamily="'Sora',sans-serif">/ 100</text>
                              </svg>
                            </div>
                          );
                        })()}
                        <div style={{fontSize:11,fontWeight:800,color:impact.sc<0?"#ef4444":"#10b981"}}>
                          {impact.sc>0?"+":""}{impact.sc} pts
                        </div>
                        <div style={{fontSize:9,color:sub,textAlign:"center"}}>
                          {wellness} → {Math.max(0,Math.min(100,wellness+impact.sc))}
                        </div>
                      </div>
                      <div style={{background:card,borderRadius:13,padding:16,border:`1px solid ${bdr}`}}>
                        <div style={{fontSize:10,fontWeight:800,color:txt,marginBottom:7}}>Breakdown</div>
                        {impact.details.map((d,i)=>(
                          <div key={i} style={{fontSize:9,fontWeight:700,color:d.includes("−")||d.includes("-")||d.includes("depleted")?"#ef4444":"#10b981",padding:"3px 0",borderBottom:i<impact.details.length-1?`1px solid ${bdr}`:"none"}}>{d}</div>
                        ))}
                      </div>
                    </div>
                    {/* Bloomberg-style analysis panel — unique content per scenario */}
                    <div style={{background:"#0f172a",border:`1px solid ${sd.color}44`,borderLeft:`3px solid ${sd.color}`,overflow:"hidden"}}>
                      {/* Panel header */}
                      <div style={{padding:"10px 16px",background:"#1e293b",borderBottom:"1px solid #334155",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 6px #10b981"}}/>
                          <span style={{fontSize:9,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1.2}}>WealthWell Analysis Engine</span>
                          <span style={{fontSize:8,color:"#475569",fontFamily:"'Courier New',monospace"}}>· LIVE</span>
                        </div>
                        <button onClick={()=>setScreen("actions")} style={{padding:"5px 13px",background:`linear-gradient(135deg,${sd.color},${sd.color}aa)`,color:"white",border:"none",borderRadius:3,fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Sora',sans-serif",letterSpacing:.8,textTransform:"uppercase"}}>
                          View 5 Actions →
                        </button>
                      </div>
                      {/* Unique per-scenario analysis */}
                      <div style={{padding:"14px 16px"}}>
                        {scenario==="crash"&&(
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",lineHeight:1.7,marginBottom:10}}>
                              A <strong style={{color:"#ef4444"}}>{params.crash.equityDrop}% equity drop</strong> and <strong style={{color:"#f97316"}}>{params.crash.cryptoDrop}% crypto crash</strong> is materialising. Portfolios with more than 50% in stocks and crypto face the highest drawdown risk. The MAS-recommended approach for retail investors during a crash is <strong style={{color:"#10b981"}}>capital preservation first, opportunistic buying second</strong>.
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                              {[{l:"MAS Guidance",v:"Hold S'pore Savings Bonds for 100% capital safety",c:"#10b981"},{l:"Smart Move",v:"Dollar-cost average into STI ETF (ES3) via RSP",c:"#06b6d4"},{l:"Avoid",v:"Panic-selling converts paper losses to real losses",c:"#ef4444"}].map((t,i)=>(
                                <div key={i} style={{background:"#1e293b",borderTop:`2px solid ${t.c}`,padding:"9px 11px",borderRadius:2}}>
                                  <div style={{fontSize:8,fontWeight:800,color:t.c,textTransform:"uppercase",letterSpacing:.9,marginBottom:4}}>{t.l}</div>
                                  <div style={{fontSize:10,color:"#cbd5e1",lineHeight:1.5}}>{t.v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {scenario==="jobloss"&&(
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",lineHeight:1.7,marginBottom:10}}>
                              <strong style={{color:"#f97316"}}>{params.jobloss.months} months without income</strong> — your emergency fund covers <strong style={{color:parseFloat(scores?.liqMonths||0)>=params.jobloss.months?"#10b981":"#ef4444"}}>{scores?.liqMonths||0} months currently</strong>. {parseFloat(scores?.liqMonths||0)<params.jobloss.months ? "Your fund is insufficient for this scenario." : "Your fund covers this scenario."} MAS MoneySense recommends <strong style={{color:"#f59e0b"}}>6 months as the minimum</strong>. Do not cancel MediShield Life or Integrated Shield Plan — a single hospitalisation costs more than 3 months of premiums.
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                              {[{l:"Immediate",v:"Call bank for mortgage payment holiday — no credit impact",c:"#f97316"},{l:"This Week",v:"Apply for ComCare & CDC Vouchers at go.gov.sg",c:"#10b981"},{l:"This Month",v:"Enrol in SkillsFuture — 90% course subsidies available",c:"#6366f1"}].map((t,i)=>(
                                <div key={i} style={{background:"#1e293b",borderTop:`2px solid ${t.c}`,padding:"9px 11px",borderRadius:2}}>
                                  <div style={{fontSize:8,fontWeight:800,color:t.c,textTransform:"uppercase",letterSpacing:.9,marginBottom:4}}>{t.l}</div>
                                  <div style={{fontSize:10,color:"#cbd5e1",lineHeight:1.5}}>{t.v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {scenario==="rates"&&(
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",lineHeight:1.7,marginBottom:10}}>
                              A <strong style={{color:"#8b5cf6"}}>{params.rates.hikePct}% SORA rate increase</strong> raises mortgage costs, reduces bond prices, and tightens household cash flow. MAS uses the S$NEER exchange rate mechanism rather than rates directly, but Singapore rates track global cycles. The winning strategy: <strong style={{color:"#10b981"}}>short duration, fixed rate, eliminate high-interest debt first</strong>.
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                              {[{l:"Fix Your Mortgage",v:"Switch to fixed rate — saves S$9–12K over 3 years",c:"#8b5cf6"},{l:"Upgrade Your Cash",v:"T-bills at 3.7% p.a. vs 0.05% in savings account",c:"#10b981"},{l:"Avoid New Property",v:"ABSD 17% + higher rates = double cost now",c:"#ef4444"}].map((t,i)=>(
                                <div key={i} style={{background:"#1e293b",borderTop:`2px solid ${t.c}`,padding:"9px 11px",borderRadius:2}}>
                                  <div style={{fontSize:8,fontWeight:800,color:t.c,textTransform:"uppercase",letterSpacing:.9,marginBottom:4}}>{t.l}</div>
                                  <div style={{fontSize:10,color:"#cbd5e1",lineHeight:1.5}}>{t.v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {scenario==="retirement"&&(
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",lineHeight:1.7,marginBottom:10}}>
                              With <strong style={{color:"#10b981"}}>{params.retirement.years} years to retirement</strong>, your projected savings at <strong style={{color:"#06b6d4"}}>{fc(params.retirement.monthly,cur,true)}/month</strong> are <strong style={{color:"#10b981"}}>{fc(params.retirement.monthly*12*params.retirement.years,cur,true)}</strong> before investment returns. The CPF LIFE Full Retirement Sum is S$205,800 (2024). Top up your SRS (S$15,300 tax deduction/year) and CPF SA (4% guaranteed) to compound efficiently within Singapore's tax framework.
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                              {[{l:"CPF SA",v:"Top up for 4% guaranteed + S$8K tax relief per year",c:"#10b981"},{l:"Open SRS",v:"S$15,300 tax deduction — invest inside SRS in ETFs",c:"#6366f1"},{l:"CPF LIFE",v:"Defer payouts to 70 for +35% monthly income for life",c:"#f59e0b"}].map((t,i)=>(
                                <div key={i} style={{background:"#1e293b",borderTop:`2px solid ${t.c}`,padding:"9px 11px",borderRadius:2}}>
                                  <div style={{fontSize:8,fontWeight:800,color:t.c,textTransform:"uppercase",letterSpacing:.9,marginBottom:4}}>{t.l}</div>
                                  <div style={{fontSize:10,color:"#cbd5e1",lineHeight:1.5}}>{t.v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {scenario==="property"&&(
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"#f1f5f9",lineHeight:1.7,marginBottom:10}}>
                              A <strong style={{color:"#06b6d4"}}>{fc(params.property.price,cur,true)} property</strong> as a 2nd purchase triggers <strong style={{color:"#ef4444"}}>ABSD of {fc(params.property.price*0.17,cur,true)} (17%)</strong> — paid in cash within 14 days. MAS's TDSR rule caps your total monthly debt at 55% of income, and the LTV limit means the bank lends only 45% of the purchase price. Check your numbers carefully before signing any Option to Purchase.
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                              {[{l:"ABSD Cost",v:`${fc(params.property.price*0.17,cur,true)} non-refundable tax — calculate before committing`,c:"#ef4444"},{l:"Run TDSR",v:"Use MAS mortgage calculator at mas.gov.sg first",c:"#06b6d4"},{l:"Consider REITs",v:"Same exposure, no ABSD, 5–7% yield, full liquidity",c:"#10b981"}].map((t,i)=>(
                                <div key={i} style={{background:"#1e293b",borderTop:`2px solid ${t.c}`,padding:"9px 11px",borderRadius:2}}>
                                  <div style={{fontSize:8,fontWeight:800,color:t.c,textTransform:"uppercase",letterSpacing:.9,marginBottom:4}}>{t.l}</div>
                                  <div style={{fontSize:10,color:"#cbd5e1",lineHeight:1.5}}>{t.v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!scenario&&<div style={{textAlign:"center",padding:"44px",background:card,borderRadius:16,border:`1px solid ${bdr}`}}>
                <div style={{fontSize:36,marginBottom:9}}>⟁</div>
                <strong style={{fontSize:13,color:txt}}>Select a scenario above to begin</strong>
                <div style={{fontSize:11,color:sub,marginTop:5}}>Adjust parameters with sliders and see real-time financial impact</div>
              </div>}
            </div>
          )}

          {/* ══ ACTIONS ══ */}
          {screen==="actions"&&(
            <div className="sc">
              <div style={{marginBottom:13,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div>
                  <Lbl style={{color:"rgba(255,255,255,0.65)"}}>What To Do Next</Lbl>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <h1 style={{fontSize:23,fontWeight:800,color:"white",margin:0}}>Action Centre</h1>
                    {scenario&&SCENARIOS_DEF.find(s=>s.id===scenario)&&(
                      <span style={{fontSize:9,fontWeight:800,color:SCENARIOS_DEF.find(s=>s.id===scenario).color,background:"rgba(0,0,0,0.35)",border:`1px solid ${SCENARIOS_DEF.find(s=>s.id===scenario).color}66`,borderRadius:3,padding:"3px 10px",letterSpacing:.9,textTransform:"uppercase",fontFamily:"'Courier New',monospace"}}>
                        {SCENARIOS_DEF.find(s=>s.id===scenario).icon} {SCENARIOS_DEF.find(s=>s.id===scenario).label}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>setHistTab(false)} style={{padding:"6px 13px",borderRadius:3,border:`1px solid ${!histTab?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.1)"}`,background:!histTab?"rgba(255,255,255,0.18)":"transparent",color:"white",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Sora',sans-serif",textTransform:"uppercase",letterSpacing:.8}}>Active ({actions.length})</button>
                  <button onClick={()=>setHistTab(true)}  style={{padding:"6px 13px",borderRadius:3,border:`1px solid ${histTab?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.1)"}`,background:histTab?"rgba(255,255,255,0.18)":"transparent",color:"white",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Sora',sans-serif",textTransform:"uppercase",letterSpacing:.8}}>History ({done.length})</button>
                </div>
              </div>
              {!histTab&&(
                actions.length===0
                  ?<div style={{textAlign:"center",padding:"55px",background:card,borderRadius:18,border:`1px solid ${bdr}`}}><div style={{fontSize:40,marginBottom:9}}>🎉</div><strong style={{fontSize:15,color:txt}}>All caught up!</strong><div style={{fontSize:11,color:sub,marginTop:5}}>You've completed all recommended actions.</div></div>
                  :<div style={{maxWidth:490,margin:"0 auto"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:12}}>
                      {actions.map((a,i)=>(<button key={a.id} onClick={()=>setCardIdx(i)} style={{width:i===cardIdx?20:6,height:6,borderRadius:99,border:"none",background:i===cardIdx?accentPrimary:bdr,cursor:"pointer",transition:"all 0.3s"}}/>))}
                    </div>
                    {actions.map((a,i)=>i===cardIdx&&<Flashcard key={a.id} action={a} onDone={markDone} cur={cur}/>)}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
                      <button onClick={()=>setCardIdx(i=>Math.max(0,i-1))} disabled={cardIdx===0} style={{padding:"8px 16px",background:card,border:`1px solid ${bdr}`,borderRadius:9,color:cardIdx===0?sub:txt,fontSize:11,fontWeight:700,cursor:cardIdx===0?"not-allowed":"pointer",fontFamily:"'Sora',sans-serif"}}>← Prev</button>
                      <span style={{fontSize:10,fontWeight:700,color:sub}}>{cardIdx+1} of {actions.length}</span>
                      <button onClick={()=>setCardIdx(i=>Math.min(actions.length-1,i+1))} disabled={cardIdx===actions.length-1} style={{padding:"8px 16px",background:card,border:`1px solid ${bdr}`,borderRadius:9,color:cardIdx===actions.length-1?sub:txt,fontSize:11,fontWeight:700,cursor:cardIdx===actions.length-1?"not-allowed":"pointer",fontFamily:"'Sora',sans-serif"}}>Next →</button>
                    </div>
                  </div>
              )}
              {histTab&&(
                <div style={{maxWidth:540,margin:"0 auto"}}>
                  {done.length===0
                    ?<div style={{textAlign:"center",padding:"44px",background:card,borderRadius:16,border:`1px solid ${bdr}`}}><div style={{fontSize:30,marginBottom:9}}>📋</div><strong style={{fontSize:12,color:txt}}>No completed actions yet</strong></div>
                    :done.slice(0,5).map((a,i)=>(
                      <div key={i} style={{display:"flex",gap:11,padding:"13px 16px",background:card,borderRadius:13,border:`1px solid ${bdr}`,marginBottom:7,animation:"fadeUp 0.3s ease"}}>
                        <div style={{width:38,height:38,borderRadius:10,background:`${a.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{a.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}><strong style={{fontSize:12,color:txt}}>{a.title}</strong><Tag color="#10b981">✓ Done</Tag></div>
                          <div style={{fontSize:9,fontWeight:600,color:sub,marginTop:2}}>{a.category} · {a.doneAt}</div>
                          <div style={{fontSize:10,fontWeight:800,color:a.color,marginTop:3}}>{a.impact}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* ══ TRUST CENTRE ══ */}
          {screen==="trust"&&(
            <div className="sc">
              <div style={{marginBottom:13}}><Lbl style={{color:"rgba(255,255,255,0.65)"}}>Security & Transparency</Lbl><h1 style={{fontSize:23,fontWeight:800,color:"white"}}>Trust Centre</h1></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
                <div className="hov" style={{background:card,borderRadius:14,padding:18,border:`1px solid ${bdr}`,transition:"all .3s"}}>
                  <div style={{fontSize:13,fontWeight:800,color:txt,marginBottom:13}}>🔗 Connected Accounts</div>
                  {CONNECTED_PLATFORMS.map(p=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${bdr}`}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${p.color}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{p.icon}</div>
                      <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:txt}}>{p.name}</div><div style={{fontSize:9,color:sub}}>{p.desc}</div></div>
                      <div style={{display:"flex",align:"center",gap:6}}>
                        {connected[p.id]
                          ?<span style={{fontSize:10,fontWeight:700,color:"#16a34a",background:"#dcfce7",padding:"3px 10px",borderRadius:99}}>✓ Connected</span>
                          :<span style={{fontSize:10,fontWeight:700,color:sub,background:"#f1f5f9",padding:"3px 10px",borderRadius:99}}>Not linked</span>
                        }
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:11,fontSize:10,color:sub}}>Read-only access only. No trading or transfers permitted.</div>
                </div>
                <div className="hov" style={{background:card,borderRadius:14,padding:18,border:`1px solid ${bdr}`,transition:"all .3s"}}>
                  <div style={{fontSize:13,fontWeight:800,color:txt,marginBottom:13}}>🔒 Security Architecture</div>
                  {[
                    {icon:"🔐",t:"AES-256 Encryption",d:"All data encrypted in transit and at rest"},
                    {icon:"🔑",t:"OAuth 2.0 Auth",d:"Industry-standard token-based access"},
                    {icon:"🏗️",t:"Zero-Knowledge Design",d:"We cannot see your raw financial data"},
                    {icon:"📋",t:"Full Audit Logs",d:"Every data access is logged and visible to you"},
                    {icon:"🗑️",t:"Right to Delete",d:"Permanently erase your data instantly"},
                  ].map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:11}}>
                      <span style={{fontSize:18,marginTop:1,flexShrink:0}}>{s.icon}</span>
                      <div><div style={{fontSize:11,fontWeight:700,color:txt}}>{s.t}</div><div style={{fontSize:9,color:sub,marginTop:2}}>{s.d}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hov" style={{background:"#fff1f0",borderRadius:14,padding:18,border:"1px solid #fecaca",transition:"all .3s"}}>
                <div style={{fontSize:13,fontWeight:800,color:"#7f1d1d",marginBottom:9}}>⚠️ Data Control</div>
                <div style={{display:"flex",gap:11,alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#1a0505",marginBottom:3}}>Reset & Clear All Data</div>
                    <div style={{fontSize:10,color:"#7f1d1d"}}>Permanently delete your profile, assets, and settings. Returns you to onboarding. This cannot be undone.</div>
                  </div>
                  <button onClick={resetApp} style={{padding:"9px 20px",background:"#dc2626",color:"white",border:"none",borderRadius:10,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",flexShrink:0}}>Reset App</button>
                </div>
              </div>
            </div>
          )}

          <div style={{height:24}}/>
        </div>
      </div>

      {/* ══ PROFILE MODAL ══ */}
      {profileOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"flex-end"}} onClick={()=>{setProfileOpen(false);setProfileEdit(false);}}>
          <div onClick={e=>e.stopPropagation()} style={{width:340,height:"100vh",background:card,overflowY:"auto",boxShadow:"-8px 0 40px rgba(0,0,0,0.2)",padding:22,animation:"slideIn 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:800,color:txt}}>My Profile</div>
              <div style={{display:"flex",gap:7}}>
                {!profileEdit&&<button onClick={()=>setProfileEdit(true)} style={{padding:"5px 11px",background:"#f1f5f9",border:`1px solid ${bdr}`,borderRadius:7,color:sub,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>✏ Edit</button>}
                <button onClick={()=>{setProfileOpen(false);setProfileEdit(false);}} style={{background:"transparent",border:"none",fontSize:18,cursor:"pointer",color:sub}}>×</button>
              </div>
            </div>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${accentPrimary},#6366f1)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"white",margin:"0 auto 8px"}}>
                {(profile.name||"U").charAt(0).toUpperCase()}
              </div>
              <div style={{fontSize:16,fontWeight:800,color:txt}}>{profile.name}</div>
              <div style={{fontSize:10,color:sub}}>{profile.riskTolerance} Investor · {profile.nationality}</div>
              <Tag color={accentPrimary}>Wellness Score: {wellness}</Tag>
            </div>
            {profileEdit ? (
              <>
                <Lbl style={{marginBottom:9}}>Edit Details</Lbl>
                {[
                  {l:"Full Name",        k:"name",             t:"text"},
                  {l:"Date of Birth",    k:"dob",              t:"date"},
                  {l:"Email",           k:"email",            t:"email"},
                  {l:"Phone",           k:"phone",            t:"tel"},
                  {l:"Employer",        k:"employer",         t:"text"},
                  {l:"Monthly Salary",  k:"salary",           t:"number"},
                  {l:"Monthly Expenses",k:"monthlyExpenses",  t:"number"},
                  {l:"Address",         k:"address",          t:"text"},
                ].map(f=>(
                  <div key={f.k} style={{marginBottom:10}}>
                    <Lbl>{f.l}</Lbl>
                    <input type={f.t} value={editP[f.k]||""} onChange={e=>setEditP(p=>({...p,[f.k]:f.t==="number"?parseFloat(e.target.value)||0:e.target.value}))}
                      style={{width:"100%",padding:"8px 11px",borderRadius:9,border:`1px solid ${bdr}`,background:"#f8fafc",color:txt,fontSize:12,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                  </div>
                ))}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
                  <button onClick={()=>setProfileEdit(false)} style={{padding:"9px",background:"transparent",border:`1px solid ${bdr}`,borderRadius:9,color:sub,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Cancel</button>
                  <button onClick={()=>{setProfile({...editP});setProfileEdit(false);}} style={{padding:"9px",background:`linear-gradient(135deg,${accentPrimary},#6366f1)`,color:"white",border:"none",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Save Changes</button>
                </div>
              </>
            ) : (
              <>
                <Lbl style={{marginBottom:9}}>Personal Details</Lbl>
                {[
                  {l:"Full Name",    v:profile.name},
                  {l:"Date of Birth",v:profile.dob?new Date(profile.dob).toLocaleDateString("en-SG",{day:"numeric",month:"long",year:"numeric"}):"—"},
                  {l:"Phone",        v:profile.phone||"—", sensitive:true},
                  {l:"Email",        v:profile.email||"—"},
                  {l:"Nationality",  v:profile.nationality||"—"},
                  {l:"Employer",     v:profile.employer||"—"},
                  {l:"Goals",        v:(profile.goals||[]).join(", ")||"—"},
                ].map((f,i)=>(
                  <div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:9}}>
                    <div style={{fontSize:9,fontWeight:700,color:sub,flexShrink:0}}>{f.l}</div>
                    <div style={{fontSize:11,fontWeight:700,color:txt,textAlign:"right"}}>
                      {f.sensitive
                        ?<span onClick={()=>setRevealPhone(r=>!r)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                            {revealPhone?f.v:`${(f.v||"").slice(0,4)} ••••`}
                            <span style={{fontSize:11,color:accentPrimary}}>{revealPhone?"🙈":"👁"}</span>
                          </span>
                        :f.v}
                    </div>
                  </div>
                ))}
                <div style={{marginTop:13,paddingTop:13,borderTop:`1px solid ${bdr}`}}>
                  <Lbl style={{marginBottom:9}}>Financial Summary</Lbl>
                  {[
                    {l:"Monthly Salary",    v:fc(profile.salary||0, cur)},
                    {l:"Monthly Expenses",  v:fc(profile.monthlyExpenses||(profile.salary||0)*0.5, cur)},
                    {l:"Household Members", v:`${profile.household||1} people`},
                    {l:"Net Worth",         v:fc(netWorth, cur)},
                    {l:"Savings Rate",      v:`${Math.max(0,Math.round((1-(profile.monthlyExpenses||0)/(profile.salary||1))*100))}%`},
                  ].map((f,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${bdr}`}}>
                      <span style={{fontSize:9,fontWeight:700,color:sub}}>{f.l}</span>
                      <strong style={{fontSize:10,color:txt}}>{f.v}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ ADD ASSET PANEL ══ */}
      {addAssetOpen&&(
        <AddAssetPanel
          onAdd={addAsset}
          onClose={()=>setAddAssetOpen(false)}
          cur={cur}
          accentPrimary={accentPrimary}
          card={card} bdr={bdr} txt={txt} sub={sub}
        />
      )}

      {/* ══ ADD LIABILITY PANEL ══ */}
      {addLiabOpen&&(
        <AddLiabPanel
          onAdd={addLiab}
          onClose={()=>setAddLiabOpen(false)}
          cur={cur}
          card={card} bdr={bdr} txt={txt} sub={sub}
        />
      )}
    </div>
  );
}
