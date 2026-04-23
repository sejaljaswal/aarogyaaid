# Product Requirements Document: AarogyaAid

## 1. Target User
The primary user for AarogyaAid is the urban and semi-urban Indian individual, typically aged 25–55, who is either a first-time insurance buyer or looking to upgrade their family’s protection. 

### Pain Points & Context
*   **The Jargon Barrier:** Terms like "Co-payment," "Restore Benefit," and "Room Rent Capping" are alienating. Users often feel that insurance is designed to be misunderstood.
*   **The Trust Deficit:** There is a deep-seated fear that traditional agents prioritize high-commission products over the user's actual health needs.
*   **Exclusion Anxiety:** A significant "fear of the fine print" exists, specifically regarding pre-existing conditions (PED) like Diabetes or Hypertension. Users worry that a minor disclosure today will lead to a rejected claim tomorrow.
*   **Complexity of Choice:** With 30+ insurers and hundreds of plans, the cognitive load is overwhelming, leading to "analysis paralysis" where users simply defer the decision.
*   **Financial Sensitivity:** Users want maximum "value for money" but lack the tools to understand how a ₹500 difference in monthly premium correlates to actual coverage quality.

---

## 2. Feature Prioritization

| Priority | Feature | Justification |
| :--- | :--- | :--- |
| **1** | **AI Recommendation Engine** | The core value proposition. It transforms the platform from a "directory" into a "consultant," providing immediate, personalized value. |
| **2** | **Profile Form** | The essential data-entry point. It must be designed with extreme empathy (vernacular-friendly, low friction) to ensure high completion rates. |
| **3** | **Chat Explainer** | Simplifies the "Why" behind the "What." It bridges the gap between a cold recommendation and a trust-based decision by explaining clauses in plain English/Hinglish. |
| **4** | **Admin Panel** | Necessary for backend operations, policy updates, and lead management, but secondary to the user-facing "Aha!" moment. |

---

## 3. Recommendation Logic
The engine uses a weighted scoring algorithm to map user inputs to IRDAI-approved insurance products.

### A. Pre-existing Conditions (PED) & Exclusion Matching
*   **Logic:** If a user reports a PED (e.g., Asthma), the engine filters for policies with the shortest waiting periods (e.g., 2 years instead of 4). 
*   **Impact:** Policies that offer "PED Coverage from Day 1" riders are given a +20% score boost for these users.

### B. Income Band & Affordability
*   **Logic:** The recommended total annual premium is capped at ~3-5% of the user's declared annual income.
*   **Impact:** Lower-income bands (₹3L–7L) are shown high-value "Base" plans; high-income bands (₹15L+) are prioritized for "Super Top-up" and "Global Cover" recommendations.

### C. Age & Waiting Period Sensitivity
*   **Logic:** For older users (50+), the engine penalizes policies with high "Co-pay" clauses.
*   **Impact:** For younger users (20s), the engine prioritizes "No Claim Bonus" (NCB) multipliers and "Restoration" benefits, assuming a lower immediate claim probability but a long-term relationship.

### D. City Tier & Network Hospital Scoring
*   **Logic:** Medical inflation in Tier 1 cities (Mumbai, Bangalore) is ~12-15%. 
*   **Impact:** Users in Tier 1 cities are recommended a minimum Sum Insured of ₹10L. The engine cross-references the insurer’s "Cashless Network" density in the user's specific pin code.

### E. Lifestyle & OPD Priority
*   **Logic:** Users indicating high-stress lifestyles or frequent outpatient needs (identified via family size or age) are matched with plans offering "OPD & Wellness" covers.
*   **Impact:** Active "wellness" riders (gym discounts, diagnostic coupons) are prioritized for young, health-conscious profiles to increase app engagement.

---

## 4. Assumptions
1.  **Transparency Preference:** Users are willing to disclose sensitive health data (PEDs) if they believe it ensures "Claim Certainty."
2.  **Digital Trust:** Modern Indian users trust an AI's data-driven logic more than a potentially biased human agent.
3.  **Mobile-First Access:** Over 85% of users will interact with the platform via mobile devices.
4.  **Network Importance:** The availability of "Cashless" treatment at a nearby hospital is a bigger driver of choice than the brand of the insurance company.
5.  **Regulation Stability:** IRDAI regulations regarding portability and waiting periods will remain consistent during the MVP phase.
6.  **Under-Insurance Gap:** Most users are currently under-insured (typically holding only a ₹3L-5L corporate/basic cover) and are looking for "Super Top-up" or "Family Floater" options.
7.  **Language Comfort:** While the UI is in English, users will find "Hinglish" or simple conversational explanations more comforting for complex terms.
