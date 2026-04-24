# PRD — AarogyaAid: AI-Powered Health Insurance Recommendation Platform

---

## 1. Target User & Pain Points

**Primary User:** Indian adults aged 25–55, navigating health insurance independently 
for the first time or switching plans — typically without an agent or financial advisor.

**Who they are:**
- A 34-year-old software professional in Pune who has just been diagnosed with 
  hypertension and doesn't know if any policy will cover him now.
- A 28-year-old woman in a Tier-2 city supporting her parents, trying to find 
  a family floater within ₹8,000/year — confused by 11 different plans on 
  aggregator sites.
- A 52-year-old with diabetes in a Metro, terrified of exclusion clauses but 
  unable to afford a broker or financial advisor.

**Core pain points:**

**Jargon paralysis.** Terms like "co-pay", "sub-limit", "waiting period", and 
"restoration benefit" are used freely across policy documents with no plain-English 
explanation. Most users abandon the comparison process mid-way.

**Exclusion anxiety.** Users with pre-existing conditions (diabetes, hypertension, 
cardiac history) are deeply worried — often rightly — that the policy they choose 
will exclude their most critical health need. No current tool explains this 
clearly for their specific condition.

**Trust deficit.** Aggregator platforms (PolicyBazaar, Coverfox) are perceived as 
sales-first. Recommendations feel commission-driven, not need-driven. Users want 
to feel understood, not upsold.

**Information overload without personalisation.** Showing 40 plans ranked by 
premium is not helpful. Users need to see 2–3 options that actually fit their 
income, city, age, and health — with a clear explanation of why.

**Dead ends for complex profiles.** High-risk users (older age, multiple conditions, 
low income) are often shown plans that are technically available but practically 
unaffordable or severely limiting. No platform offers an "alternative path" when 
the best-fit option is still imperfect.

---

## 2. Feature Prioritisation & Rationale

| Priority | Feature | Rationale |
|---|---|---|
| P0 | AI Recommendation Engine + RAG Pipeline | This is the core product. Without grounded, personalised recommendations, nothing else has value. Built first. |
| P0 | 6-Field Profile Form | Recommendation quality depends entirely on capturing the right inputs. Built in parallel with the engine. |
| P1 | Chat Explainer (Scoped Chatbot) | Users will not trust a recommendation they don't understand. The chat converts a recommendation into a learning experience. Built immediately after the recommendation output is working. |
| P2 | Admin Panel — Knowledge Base Management | The AI's knowledge must be updateable without code changes. Built after the user-facing flow is stable. |
| P3 | Unit Tests + Error Handling | Ensures correctness of scoring logic and graceful degradation. Added before submission. |

**What was deliberately not built:**
- User account system / login (out of scope — adds complexity without improving 
  the core recommendation experience)
- Payment or purchase flow (would require insurer API integrations)
- Mobile app (responsive web is sufficient for the evaluation scope)

---

## 3. Recommendation Logic

The AI agent matches a user's profile to policies using a combination of 
**RAG-retrieved document data** and **profile-weighted scoring**. No policy 
data is generated from the model's training knowledge — every fact comes from 
the uploaded documents.

### 3.1 How Each Profile Field Drives the Recommendation

**Pre-existing Conditions (highest weight)**
The agent retrieves exclusion and waiting period clauses from all uploaded 
policy documents using the `retrieve_all_policies` tool. Policies that explicitly 
exclude the user's condition (e.g. "diabetes excluded for first 4 years") receive 
a strong negative score adjustment. Policies with shorter waiting periods for 
the user's specific condition are ranked higher. A user with "Cardiac" history 
will see waiting period flagged prominently in the output.

**Age**
Age determines which premium bracket the user falls into (retrieved from policy 
documents) and affects waiting period sensitivity. Older users (45+) are penalised 
more heavily for long waiting periods because they are more likely to need 
coverage sooner. The peer comparison table is sorted to surface this clearly.

**Annual Income Band**
Sets the affordability ceiling for premium recommendations. A user in the 
"Under ₹3L" band will not be recommended policies with premiums above 
~₹6,000/year (5% of income as a heuristic). The suitability score in the 
peer comparison table reflects this — an expensive policy gets a low suitability 
score for a low-income user even if its clinical coverage is excellent.

**Lifestyle**
Active and Athlete users are scored higher for policies that include OPD 
(outpatient department) cover, since they are more likely to need physiotherapy, 
sports injury treatment, and routine consultations. Sedentary users are 
weighted toward higher hospitalisation cover instead.

**City / Tier**
Tier-2 and Tier-3 users are penalised if a policy has a small network of 
hospitals, since cashless claims depend on network availability. Co-pay clauses 
that specifically apply to non-Metro cities (a common clause in Indian health 
policies) are flagged explicitly for Tier-2/3 users. Metro users are scored 
on claim settlement ratio and room rent limits instead.

**Full Name**
Used to personalise all agent responses, the greeting, and the "Why This Policy" 
section. Ensures the recommendation feels addressed to a person, not generated 
for an anonymous user.

### 3.2 Output Structure

Every recommendation produces exactly three sections:

1. **Peer Comparison Table** — recommended policy vs. 2–3 alternatives, 
   with a suitability score that reflects the weighted profile match.
2. **Coverage Detail** — inclusions, exclusions, sub-limits, co-pay, and 
   claim type sourced directly from retrieved document chunks.
3. **Why This Policy** — 150–250 words connecting the policy's specific 
   features to at least 3 of the user's 6 profile fields, written in 
   plain, warm English.

### 3.3 Guardrails

- The agent will not answer medical advice questions ("Should I get this 
  surgery?"). It will politely redirect to a doctor and stay scoped to 
  insurance coverage questions.
- High-cost or low-coverage scenarios always end with an alternative path 
  or a suggestion — never a dead end.
- Every insurance term is defined the first time it appears in any response.

---

## 4. Assumptions

1. **Users are browsing on mobile or low-end laptops.** The UI is designed 
   mobile-first and avoids heavy JavaScript bundles that slow load times 
   on 4G networks.

2. **Policy documents are uploaded by an AarogyaAid admin, not the user.** 
   The knowledge base is curated — users trust that the policies shown are 
   verified and current.

3. **3–5 policy documents in the knowledge base is sufficient for evaluation.** 
   In production this would scale to 50+ policies, but the RAG pipeline is 
   designed to handle that without architectural changes.

4. **Users are disclosing pre-existing conditions honestly.** The platform 
   does not validate this — it trusts the input and optimises for their 
   stated profile.

5. **Indian health insurance domain norms apply.** Waiting periods of 2–4 
   years for pre-existing conditions, IRDAI-regulated co-pay structures, 
   and cashless/reimbursement claim types are treated as standard.

6. **A session lasts one browser session.** No persistent user accounts 
   are required. Profile and chat history are tied to a session ID.

7. **The "best fit" recommendation may still be imperfect for high-risk 
   profiles.** The agent is designed to be honest about this — if no 
   uploaded policy covers the user's condition well, it says so and 
   suggests what to look for rather than fabricating a good match.

8. **Empathy is a product requirement, not a nice-to-have.** Users disclosing 
   health conditions in a digital form are in a vulnerable moment. The agent's 
   tone is warm and human-first at every interaction point.
