export interface QualificationData {
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  jobTitle: string | null
  industry: string | null
  monthlyRevenue: number | null
  businessGoals: string | null
  challenges: string | null
  budget: string | null
  timeframe: string | null
  leadSource: string | null
  conversationSummary: string
  interestLevel: "HIGH" | "MEDIUM" | "LOW"
  bookedAppointment: boolean
  needHumanHandoff: boolean
}

export interface ScoreBreakdown {
  industryFit: number
  budgetMatch: number
  timeframe: number
  needClarity: number
  decisionRole: number
  engagement: number
  total: number
}

const TARGET_INDUSTRIES = [
  "technology", "saas", "software", "finance", "financial", "real estate",
  "healthcare", "consulting", "marketing", "ecommerce", "retail", "manufacturing",
  "construction", "legal", "professional services",
]

const DECISION_MAKER_TITLES = [
  "ceo", "cfo", "cto", "coo", "cmo", "founder", "owner", "principal",
  "president", "director", "vp", "vice president", "partner", "executive",
  "managing director", "head of",
]

const MANAGER_TITLES = ["manager", "lead", "supervisor", "coordinator"]

export function scoreLead(data: Partial<QualificationData>): {
  score: number
  status: "HOT" | "WARM" | "COLD"
  breakdown: ScoreBreakdown
} {
  let industryFit = 0
  let budgetMatch = 0
  let timeframeScore = 0
  let needClarity = 0
  let decisionRole = 0
  let engagement = 0

  if (data.industry) {
    const industry = data.industry.toLowerCase()
    if (TARGET_INDUSTRIES.some((t) => industry.includes(t))) {
      industryFit = 15
    } else {
      industryFit = 5
    }
  }

  if (data.monthlyRevenue) {
    if (data.monthlyRevenue >= 10000) budgetMatch = 20
    else if (data.monthlyRevenue >= 5000) budgetMatch = 15
    else if (data.monthlyRevenue >= 1000) budgetMatch = 10
    else budgetMatch = 5
  } else if (data.budget) {
    const budget = data.budget.toLowerCase()
    if (budget.includes("$1000") || budget.includes("1000+") || budget.includes("high")) budgetMatch = 20
    else if (budget.includes("500") || budget.includes("mid")) budgetMatch = 15
    else if (budget.includes("under") || budget.includes("low")) budgetMatch = 5
    else budgetMatch = 10
  }

  if (data.timeframe) {
    const timeframe = data.timeframe.toLowerCase()
    if (timeframe.includes("immediate") || timeframe.includes("now") || timeframe.includes("asap")) {
      timeframeScore = 20
    } else if (timeframe.includes("week")) {
      timeframeScore = 20
    } else if (timeframe.includes("month") || timeframe.includes("quarter")) {
      timeframeScore = 15
    } else if (timeframe.includes("year")) {
      timeframeScore = 5
    } else {
      timeframeScore = 10
    }
  }

  if (data.businessGoals || data.challenges) {
    const goals = (data.businessGoals || "").toLowerCase()
    const challenges = (data.challenges || "").toLowerCase()
    if (goals.length > 20 || challenges.length > 20) needClarity = 15
    else if (goals.length > 0 || challenges.length > 0) needClarity = 10
  }

  if (data.jobTitle) {
    const title = data.jobTitle.toLowerCase()
    if (DECISION_MAKER_TITLES.some((t) => title.includes(t))) {
      decisionRole = 15
    } else if (MANAGER_TITLES.some((t) => title.includes(t))) {
      decisionRole = 10
    } else {
      decisionRole = 5
    }
  }

  if (data.name || data.email || data.phone) engagement += 5
  if (data.interestLevel === "HIGH") engagement += 5
  if (data.bookedAppointment) engagement += 5

  const total = Math.min(
    100,
    industryFit + budgetMatch + timeframeScore + needClarity + decisionRole + engagement
  )

  let status: "HOT" | "WARM" | "COLD"
  if (total >= 80) status = "HOT"
  else if (total >= 50) status = "WARM"
  else status = "COLD"

  return {
    score: total,
    status,
    breakdown: {
      industryFit,
      budgetMatch,
      timeframe: timeframeScore,
      needClarity,
      decisionRole,
      engagement,
      total,
    },
  }
}
