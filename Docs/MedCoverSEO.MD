# MedCover — Template Registry & SEO Specification


This document is the **single source of truth** for all `ContentTemplate` records in the traffic-engine-backend. For every page type on [medcover.com](https://medical-vera.vercel.app/), it specifies the exact template payload, keyword intent, SEO rules, heading structure, clinic-inventory data integration points, and content generation guidance.


> **How templates flow through the system:** 
> `ContentTemplate` (this doc) → linked to `Subject` → resolved by `SeoBriefBuilder` → injected into `GenerationService` → composed by `PromptCompositionEngineService` → stored as `Page.finalContent` → served via `/api/v1/content` to Next.js frontend.


---


## Template Index


| ID | Letter | Name | URL Pattern | `contentType` | `KeywordIntent` | Sitemap Priority |
|----|--------|------|-------------|---------------|-----------------|-----------------|
| 1 | A | Country Destination Guide | `/guides/[country]-ivf-guide/` | `LANDING_PAGE` | `COMMERCIAL` | 0.9 |
| 2 | A2 | City Destination Guide | `/guides/[country]/[city]-ivf-guide/` | `CITY_PAGE` | `COMMERCIAL` | 0.85 |
| 3 | B | Clinic Profile Page | `/clinics/[country]/[city]/[clinic-slug]/` | `LANDING_PAGE` | `COMMERCIAL` | 0.7 |
| 4 | C | Country vs Country Comparison | `/compare/[country-a]-vs-[country-b]-ivf/` | `COMPARISON` | `COMMERCIAL` | 0.8 |
| 5 | D | Cost Transparency Page | `/costs/[country]-ivf-cost-[year]/` | `LANDING_PAGE` | `INFORMATIONAL` | 0.8 |
| 6 | E | Treatment Glossary / Entity | `/treatments/[treatment]/` | `ARTICLE` | `INFORMATIONAL` | 0.8 |
| 7 | F | Origin Patient Journey | `/from/[country]/ivf-abroad/` | `LANDING_PAGE` | `INFORMATIONAL` | 0.8 |
| 8 | G | Truth Report (Auto-Generated) | `/reports/[clinic-slug]-patient-truth-report/` | `ARTICLE` | `NAVIGATIONAL` | 0.6 |
| 9 | H | Patient Story | `/patient-stories/[slug]/` | `BLOG_POST` | `INFORMATIONAL` | 0.6 |
| 10 | J | FAQ Hub | `/faq/` | `FAQ` | `INFORMATIONAL` | 0.9 |
| 11 | K | For Clinics / B2B Landing | `/for-clinics/` | `LANDING_PAGE` | `COMMERCIAL` | 0.3 |


---


## Word Count Targets by Intent


These are enforced in `SeoBriefBuilder.targetWordCountForIntent()`:


| `KeywordIntent` | Target Word Count |
|-----------------|-------------------|
| `INFORMATIONAL` | 1,800 |
| `COMMERCIAL` | 1,500 |
| `TRANSACTIONAL` | 1,200 |
| `NAVIGATIONAL` | 800 |


---


## Template A — Country Destination Guide


**POST `/api/v1/templates`**


```json
{
 "name": "Country Destination Guide",
 "description": "Hub page for an IVF destination country. Aggregates Truth Scores, patient data, clinic links, and cost summaries at the country level.",
 "contentType": "LANDING_PAGE",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + Hero Answer Block",
     "Truth Score Summary Card",
     "Key Statistics Table",
     "AI Interview Insights Block",
     "Marketing vs Patient Reality Table",
     "Top Clinics in Country (linked cards)",
     "Full Cost Breakdown Section",
     "Legal & Ethical Context",
     "Comparison Block",
     "FAQ Accordion",
     "Speakable Summary",
     "Related Pages",
     "CTA Block"
   ]
 },
 "headingStructure": {
   "H1": "IVF in [Country]: What [N] Real Patients Told Us",
   "H1_rule": "Must include patient count and country name. Never a generic title.",
   "H2s": [
     "What MedicalVera Patients Say About IVF in [Country]",
     "IVF Cost in [Country]: What Patients Actually Paid",
     "Top IVF Clinics in [Country] by Truth Score",
     "Legal Rules for Egg Donation in [Country]",
     "[Country] vs US/UK: Cost & Success Rate Comparison",
     "Frequently Asked Questions"
   ],
   "H3_rule": "Each FAQ item is an H3. Each clinic card heading is an H3.",
   "intro_rule": "First 60 words must be a direct answer to 'How much does IVF cost in [Country]?' — no fluff, no preamble."
 },
 "seoRules": [
   "metaTitle format: 'IVF in [Country] [Year] — Costs, Clinics & Patient Truth | MedCover'",
   "metaDescription: 60-word max, include avg cost range, interview count, and country name",
   "canonical: /guides/[country]-ivf-guide/",
   "index: true, priority: 0.9, changefreq: monthly",
   "Schema: MedicalWebPage + FAQPage + BreadcrumbList + AggregateRating + SpeakableSpecification",
   "lastReviewed date in schema must match page update date",
   "AggregateRating.ratingCount must equal actual interview count from clinic-inventory",
   "All patient quotes must include anonymization tag: 'Patient interview, [Month Year], via MedCover'",
   "AEO: Hero Answer Block targets featured snippet — 60 words, no nested lists, direct subject-verb-object sentences",
   "speakable: mark the 2–3 sentence summary at bottom with SpeakableSpecification"
 ],
 "faqStructure": {
   "count": "10–14 questions",
   "source": "Patient-sourced from interview PAA questions",
   "answer_format": "First sentence = direct answer. Total 60–120 words. Include at least 1 internal link per answer.",
   "required_topics": [
     "What is the average IVF cost in [Country]?",
     "Is egg donation legal in [Country]?",
     "How do I choose a clinic in [Country]?",
     "How many trips to [Country] does IVF require?",
     "What is the success rate for IVF in [Country]?",
     "Are there hidden costs I should know about?",
     "Does MedicalVera verify clinics in [Country]?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "/costs/[country]-ivf-cost-[year]/",
     "/compare/[country]-vs-usa-ivf/",
     "Top 5 clinic profiles /clinics/[country]/[city]/[slug]/",
     "/treatments/ivf/",
     "/treatments/egg-donation/ (if applicable)",
     "/faq/"
   ],
   "anchor_text_rule": "Use descriptive anchors: 'IVF cost in Spain' not 'click here'",
   "link_density": "1 internal link per 200 words minimum"
 },
 "ctaPlacement": "Bottom of page. Text: 'Get Your Personalized [Country] IVF Report'. Links to /start/",
 "formattingInstructions": "Use tables for all stat comparisons (min 3 rows). Use accordion for FAQ. Hero Answer Block must be the very first text block after H1 — no images or other elements between H1 and the answer block. All cost figures must use '€' format with range (e.g. €5,500–€8,500). Clinic cards: show Truth Score badge, interview count, and city. Marketing vs Patient table: 2 columns, 4–6 rows, each row contrast marketing claim vs patient-reported reality.",
 "isActive": true
}
```


### Clinic Inventory Data Integration


| Section | Source (clinic-inventory) | Field Path |
|---------|--------------------------|------------|
| Truth Score Summary Card | `ClinicTruthScore` aggregate | `scoreValue` averaged across country's clinics |
| Key Statistics Table | `ClinicPricingPackage` + `PatientInterview` | `price`, `InterviewAnswer.answerText` for wait time/English |
| AI Interview Insights Block | `PatientInterview` + `InterviewAnswer` | Filter by `country`, `dimension`, `isPublished` |
| Top Clinics Cards | `Clinic` + `ClinicTruthScore` | Order by `scoreValue DESC`, limit 5, filter by country |
| Legal Section | `Country.legalNotes` (or hardcoded from docs) | Static — reviewed by legal |
| Interview count in AggregateRating | `PatientInterview` count | `WHERE clinic.city.country = [country] AND status = PUBLISHED` |


---


## Template A2 — City Destination Guide


**POST `/api/v1/templates`**


```json
{
 "name": "City Destination Guide",
 "description": "Spoke page off a country hub. Captures city-specific IVF search intent and aggregates clinics at city level.",
 "contentType": "CITY_PAGE",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + Hero Answer",
     "City Quick Stats Card",
     "Why [City]? Differentiator Section",
     "All Clinics in [City] (linked cards)",
     "Cost Breakdown (city-specific)",
     "Travel & Logistics Guide",
     "[City] vs [Other City] Mini-Comparison",
     "FAQ Accordion",
     "Related Pages",
     "CTA Block"
   ]
 },
 "headingStructure": {
   "H1": "IVF in [City]: [N] Clinics, Real Costs & Patient Insights",
   "H1_rule": "Must include clinic count, city name. City name must be exact (Barcelona not 'barcelona').",
   "H2s": [
     "IVF Clinics in [City] — Ranked by Truth Score",
     "Real IVF Cost in [City] ([Year])",
     "Why Patients Choose [City] for IVF",
     "Getting to [City]: Travel & Logistics",
     "[City] vs [Other City]: Which Is Better for IVF?",
     "Frequently Asked Questions About IVF in [City]"
   ],
   "intro_rule": "60-word direct answer to 'How much does IVF cost in [City]?' — include avg cost range and number of tracked clinics."
 },
 "seoRules": [
   "metaTitle format: 'IVF in [City] [Year] — [N] Clinics, Costs & Verified Reviews | MedCover'",
   "metaDescription: mention city, clinic count, avg cost, and MedCover verification",
   "canonical: /guides/[country]/[city]-ivf-guide/",
   "parent breadcrumb must link to /guides/[country]-ivf-guide/",
   "index: true, priority: 0.85 (top cities) or 0.7 (secondary cities), changefreq: monthly",
   "Schema: MedicalWebPage + FAQPage + BreadcrumbList + SpeakableSpecification",
   "City Quick Stats Card is the SpeakableSpecification target",
   "Pre-interview data: disclose source as 'publicly listed, not MedCover-verified' when using public clinic pricing",
   "AEO: City Quick Stats Card targets 'IVF in [City]' featured snippet"
 ],
 "faqStructure": {
   "count": "8–10 questions",
   "source": "City-specific PAA from SERP + patient interview PAA",
   "required_topics": [
     "How many IVF clinics are in [City]?",
     "Is [City] more expensive than [Other City] for IVF?",
     "What is the success rate for IVF in [City]?",
     "How many trips to [City] does IVF require?",
     "Which is the best IVF clinic in [City]?",
     "Can I get egg donation IVF in [City]?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "/guides/[country]-ivf-guide/ (parent country guide)",
     "/clinics/[country]/[city]/ (city clinic index)",
     "/costs/[city]-ivf-cost-[year]/",
     "/compare/[city-a]-vs-[city-b]-ivf/",
     "3+ clinic profile pages /clinics/[country]/[city]/[slug]/",
     "/faq/"
   ]
 },
 "ctaPlacement": "Two CTAs: (1) 'View all [City] clinics' — links to /clinics/[country]/[city]/. (2) 'Share your [City] IVF experience' — links to /start/",
 "formattingInstructions": "City Quick Stats Card: 4 data points max (avg cost, clinic count, avg wait time, English score). Clinic cards: sorted by Truth Score. Travel section: include airport code, avg flights from US/UK, neighbourhood recommendations. Mini-comparison table: 5 rows, 2 columns (City A vs City B), link to full compare page.",
 "isActive": true
}
```


### Content Before Interview Data Exists (Pre-Launch)


| Data Point | Fallback Source | Disclosure Label |
|------------|----------------|-----------------|
| Avg cost | Publicly listed clinic pricing | "Publicly listed price — not MedCover-verified" |
| Success rate | ESHRE country-level data | "Source: ESHRE [Year]" |
| Clinic count | clinic-inventory `Clinic` count for city | Exact — always live |
| Wait time | Industry reports | "Estimated from industry sources" |
| Reviews/quotes | N/A — show "Data collection in progress" | — |


---


## Template B — Clinic Profile Page


**POST `/api/v1/templates`**


```json
{
 "name": "Clinic Profile Page",
 "description": "Individual clinic verification report. Driven by clinic-inventory data and patient interview answers across 10 Truth Score dimensions.",
 "contentType": "LANDING_PAGE",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + Clinic Identity",
     "MedicalVera Truth Score Badge",
     "Clinic Fast Facts Table",
     "Verified Stats Block (10 dimensions)",
     "Truth vs Marketing Block",
     "Patient Interview Excerpts (3–5)",
     "Hidden Costs Revealed",
     "Procedure Pricing Table",
     "Staff & Lab Quality",
     "Compare with Similar Clinics",
     "FAQ (clinic-specific)",
     "Clinic Response Slot",
     "Methodology Note",
     "CTA: Request Verified Lead"
   ]
 },
 "headingStructure": {
   "H1": "[Clinic Name] — MedCover Truth Report",
   "H1_rule": "Must use exact clinic name as registered in clinic-inventory. Append '— MedCover Truth Report' always.",
   "H2s": [
     "MedCover Truth Score: [Score]/100",
     "What Patients Actually Paid at [Clinic Name]",
     "Hidden Costs at [Clinic Name] — Patient-Reported",
     "Staff Quality & English Proficiency",
     "[Clinic Name] vs [Competitor 1] vs [Competitor 2]",
     "Frequently Asked Questions About [Clinic Name]"
   ],
   "H3_rule": "Each of the 10 Truth Score dimensions is an H3 within the Verified Stats Block."
 },
 "seoRules": [
   "metaTitle: '[Clinic Name] Review [Year] — MedCover Truth Score & Patient Data'",
   "metaDescription: include Truth Score value, interview count, and one key finding (e.g. 'Hidden costs flagged by 67% of patients')",
   "canonical: /clinics/[country]/[city]/[clinic-slug]/",
   "index: true when interview count >= 5, noindex when < 5",
   "priority: 0.7, changefreq: weekly",
   "Schema: MedicalClinic + AggregateRating + Review x3 + FAQPage + BreadcrumbList",
   "MedicalClinic schema must include: name, address, telephone, url, medicalSpecialty: Fertility, openingHoursSpecification, hasMap",
   "AggregateRating.ratingValue = clinic Truth Score / 10 (to scale to 10), ratingCount = interview count, bestRating: 10",
   "Review entities: use 3 interview excerpts, author: { @type: Person, name: 'Anonymous Patient' }, datePublished: interview month/year",
   "CRITICAL: noindex until 5 interviews are collected for this clinic",
   "Entity clarity: H1 must unambiguously name the clinic — no abbreviations on first occurrence"
 ],
 "faqStructure": {
   "count": "6–10 questions",
   "source": "Clinic-specific PAA from SERP + interview-derived questions",
   "required_topics": [
     "Is [Clinic Name] worth it?",
     "What are [Clinic Name]'s real success rates?",
     "What are the hidden costs at [Clinic Name]?",
     "Does [Clinic Name] speak English?",
     "How long is the wait time at [Clinic Name]?",
     "Has [Clinic Name] been verified by MedCover?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "/guides/[country]-ivf-guide/ (parent country guide)",
     "/guides/[country]/[city]-ivf-guide/ (parent city guide)",
     "/reports/[clinic-slug]-patient-truth-report/",
     "2 competitor clinic profiles (contextual, within comparison block)",
     "/truth-score/ (methodology explanation)",
     "/for-clinics/"
   ],
   "competitor_rule": "Competitor clinics must be in same city. Sort by Truth Score proximity (pick clinics with score within ±15 of this clinic's score)."
 },
 "ctaPlacement": "Two CTAs: (1) After Truth Score Badge: 'Read Full Truth Report' → /reports/[clinic-slug]-patient-truth-report/. (2) Bottom: 'Connect with [Clinic Name]' → lead gen form",
 "formattingInstructions": "Truth Score Badge: show score (0–100), grade letter (A=85-100, B=70-84, C=55-69, D=40-54, F<40), interview count, and last updated date. 10-dimension Verified Stats: display as scored bars (CSS progress bars) with interview-sourced data beneath each. Procedure Pricing Table: 3 columns (Procedure / Clinic Quoted Range / MedCover-Verified Range). Hidden Costs section: bulleted list with patient-reported frequency ('flagged by X of Y patients').",
 "isActive": true
}
```


### Clinic Inventory Data Integration (Template B — Critical)


| Section | clinic-inventory model | Fields used |
|---------|----------------------|-------------|
| H1 / Clinic Identity | `Clinic` | `name`, `slug`, `status` |
| Truth Score Badge | `ClinicTruthScore` | `scoreValue`, `gradeLabel`, `interviewCount`, `lastCalculatedAt` |
| Fast Facts Table | `Clinic` + `ClinicAccreditation` | `country`, `city`, `accreditations`, `languagesSpoken`, `foundedYear` |
| 10 Dimensions | `ClinicTruthScore.dimensionScores` | JSON breakdown per `TruthScoreDimension` |
| Patient Excerpts | `PatientInterview` + `InterviewAnswer` | `answerText` where `isPublished = true`, tagged by dimension |
| Hidden Costs | `InterviewAnswer` | Answers to hidden-cost questions, frequency count |
| Pricing Table | `ClinicPricingPackage` | `treatmentType`, `priceMin`, `priceMax`, `currency` |
| Staff & Lab | `ClinicDoctor` + dimension answers | English score from interviews, lab equipment age |
| Competitor Comparison | `Clinic` (city filter) | Same city, nearest Truth Score |
| Clinic Response | `Clinic.officialResponse` (if claimed) | Free text, verified account flag |


---


## Template C — Comparison Page (Country vs Country)


**POST `/api/v1/templates`**


```json
{
 "name": "Country vs Country Comparison",
 "description": "Direct comparison of two IVF destination countries. Targets 'Spain vs Greece IVF' high-intent queries. Data sourced from MedCover patient interviews.",
 "contentType": "COMPARISON",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + Direct Answer / Verdict",
     "Quick Verdict Card",
     "Full Comparison Table",
     "Cost Breakdown (both countries side-by-side)",
     "Patient Quotes from Each Country",
     "Success Rate Comparison",
     "Legal Differences",
     "Which Is Right for You? Decision Guide",
     "FAQ (both countries)",
     "Related Comparisons",
     "CTA"
   ]
 },
 "headingStructure": {
   "H1": "[Country A] vs [Country B] for IVF: Which Should You Choose?",
   "H1_rule": "Phrased as a question. Country A is the higher-traffic country (canonical order). /compare/greece-vs-spain redirects to /compare/spain-vs-greece.",
   "H2s": [
     "Quick Verdict: [Country A] vs [Country B]",
     "Full Comparison: [Country A] vs [Country B] IVF",
     "Cost: [Country A] vs [Country B]",
     "Success Rates: [Country A] vs [Country B]",
     "Egg Donation Law: [Country A] vs [Country B]",
     "Which Country Is Right for You?",
     "Frequently Asked Questions"
   ],
   "intro_rule": "First 60 words = direct verdict. Use 'X has higher costs but better English proficiency...' structure. Never defer the verdict."
 },
 "seoRules": [
   "metaTitle: '[Country A] vs [Country B] IVF [Year] — Cost, Success Rate & Patient Truth | MedCover'",
   "metaDescription: include verdict, both country names, and one decisive data point (cost diff or success rate diff)",
   "canonical: /compare/[country-a]-vs-[country-b]-ivf/ (alphabetical order, higher-traffic country first)",
   "Reverse URL 301-redirects to canonical — configure in Next.js middleware",
   "index: true, priority: 0.8, changefreq: monthly",
   "Schema: Article + FAQPage + BreadcrumbList + SpeakableSpecification on Quick Verdict Card",
   "Article schema: author (MedCover editorial), datePublished, dateModified",
   "AEO: Quick Verdict Card is the SpeakableSpecification target — 3 sentences max, direct comparison language",
   "Every data row in Full Comparison Table must include a citation (MedCover interview count or ESHRE source)"
 ],
 "faqStructure": {
   "count": "8–12 questions",
   "source": "Cross-country PAA from SERP",
   "required_topics": [
     "Is IVF cheaper in [Country A] or [Country B]?",
     "Which country has better IVF success rates?",
     "Is egg donation legal in both countries?",
     "Which country is better for English-speaking patients?",
     "How do wait times compare between [Country A] and [Country B]?",
     "Can I split treatment between [Country A] and home?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "/guides/[country-a]-ivf-guide/",
     "/guides/[country-b]-ivf-guide/",
     "/costs/[country-a]-ivf-cost-[year]/",
     "/costs/[country-b]-ivf-cost-[year]/",
     "/from/usa/ivf-abroad/ (or relevant origin country)",
     "3 related comparison pages"
   ]
 },
 "ctaPlacement": "Bottom: 'Get a Personalized Comparison Report' → /start/. Include origin country in URL param: /start/?from=usa",
 "formattingInstructions": "Quick Verdict Card: 6-row table — Cost / English / Success Rate / Wait Time / Legal / Recommendation — with winner column. Full Comparison Table: 10+ rows, one column per country, badge for 'winner' per row. Patient Quotes: 2 quotes per country, labeled with interview source. Decision Guide: plain text 'if X then choose Country A' format — not interactive in Phase 1.",
 "isActive": true
}
```


---


## Template D — Cost Transparency Page


**POST `/api/v1/templates`**


```json
{
 "name": "Cost Transparency Page",
 "description": "Deep-dive on IVF costs in a country or city, sourced from patient interview data. Targets high-intent 'IVF cost in Spain' queries.",
 "contentType": "LANDING_PAGE",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + Direct Cost Answer",
     "Base Cost Table",
     "Add-On Costs Table",
     "Travel & Logistics Cost Table",
     "Total All-In Cost Scenarios (3 tiers)",
     "Hidden Costs Section",
     "Origin Country vs Destination Cost Comparison",
     "What Affects the Price Section",
     "FAQ",
     "Related Pages",
     "CTA"
   ]
 },
 "headingStructure": {
   "H1": "IVF Cost in [Country/City] [Year]: What [N] Patients Actually Paid",
   "H1_rule": "Must include year and patient count. Do NOT say 'from €X' without citing a source.",
   "H2s": [
     "IVF Package Prices in [Country]: Verified Ranges",
     "Hidden Add-On Costs Patients Didn't Expect",
     "Travel & Accommodation Budget",
     "Total All-In Cost: 3 Scenarios",
     "IVF in [Country] vs [Origin Country]: How Much Can You Save?",
     "What Drives the Price Up or Down?",
     "Frequently Asked Questions About IVF Cost"
   ],
   "intro_rule": "First 60 words: state cost range ('IVF in Spain costs between €3,800–€7,500 per cycle based on [N] patient interviews'). No hedging. No 'it depends' openers."
 },
 "seoRules": [
   "metaTitle: 'IVF Cost in [Country] [Year] — Real Patient Data | MedCover'",
   "metaDescription: include cost range, year, interview count, and hidden costs mention",
   "canonical: /costs/[country]-ivf-cost-[year]/",
   "Year redirect: /costs/[country]-ivf-cost-[prev-year]/ → 301 → current year URL",
   "Update lastmod in sitemap and lastReviewed in schema on each annual refresh",
   "index: true, priority: 0.8, changefreq: monthly",
   "Schema: MedicalWebPage + FAQPage + BreadcrumbList + SpeakableSpecification on total cost summary paragraph",
   "YMYL flag: this is a money-sensitive page — all cost figures must cite source (interview count or public listing)",
   "AEO: Base Cost Table is the primary featured snippet target — format as clean HTML table with headers",
   "Hidden Costs Section is the highest E-E-A-T differentiator — must be sourced from actual interview answers"
 ],
 "faqStructure": {
   "count": "8–10 questions",
   "source": "Cost-specific PAA from SERP and patient interview questions",
   "required_topics": [
     "What is the average IVF cost in [Country]?",
     "Is IVF covered by insurance in [Country]?",
     "What is NOT included in the quoted price?",
     "How much do IVF medications cost in [Country]?",
     "What are the travel and accommodation costs?",
     "Is IVF in [Country] cheaper than in the US/UK?",
     "What hidden fees should I budget for?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "/guides/[country]-ivf-guide/",
     "/guides/[country]/[city]-ivf-guide/ (top city)",
     "Top 3 clinic profiles",
     "/compare/[country]-vs-usa-ivf/",
     "/treatments/ivf/",
     "/faq/#costs"
   ]
 },
 "ctaPlacement": "After Total All-In Scenarios section AND at bottom. Text: 'Get a Full Cost Breakdown for Your Situation' → /start/",
 "formattingInstructions": "Base Cost Table: 3 columns (Procedure / Low Range / High Range), 3 rows minimum (IVF / Egg Donation / PGT-A). Add-On Costs Table: 4 columns (Add-On / Clinic Quoted / Patient Reported / Notes). Total Scenarios Table: 3 columns (Budget / Mid / Premium), rows for each cost category. Hidden Costs: bulleted list with patient-reported frequency. All currency in € with range notation. Always include 'last updated' date below each table.",
 "isActive": true
}
```


### Year Refresh Workflow


1. Create new `/costs/[country]-ivf-cost-[new-year]/` page in the system
2. Set 301 redirect on the old year page (Next.js middleware or nginx config)
3. Update `Page.updatedAt` and `schemaMarkup.lastReviewed` on new page
4. Update `sitemap.xml` `lastmod` entry
5. Republish via webhook to frontend


---


## Template E — Treatment Glossary / Entity Page


**POST `/api/v1/templates`**


```json
{
 "name": "Treatment Glossary / Entity Page",
 "description": "Medical entity definition page for a specific fertility treatment. Builds topical authority and entity recognition. YMYL — requires medical reviewer credit.",
 "contentType": "ARTICLE",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + Definition (answer-first)",
     "HowTo: The Process (step-by-step)",
     "Success Rates by Age (table)",
     "Why Patients Travel Abroad for This Treatment",
     "What MedCover Patients Report",
     "Countries Available (cards)",
     "Glossary of Terms",
     "FAQ",
     "Related Treatments",
     "External Resources (authoritative)",
     "CTA",
     "Medical Reviewer Credit Block"
   ]
 },
 "headingStructure": {
   "H1": "What Is [Treatment]? How It Works, Costs Abroad & Patient Insights",
   "H1_rule": "Lead with 'What Is [Treatment]?' — this is the primary entity query. Include 'abroad' to signal intent.",
   "H2s": [
     "How [Treatment] Works: Step-by-Step",
     "[Treatment] Success Rates by Age Group",
     "Why Patients Travel Abroad for [Treatment]",
     "What MedCover Patients Say About [Treatment]",
     "[Treatment] Abroad: Destinations",
     "Key [Treatment] Terms Explained",
     "Frequently Asked Questions About [Treatment]"
   ],
   "intro_rule": "First 60 words: define the treatment in plain language. No jargon. No deferred definition."
 },
 "seoRules": [
   "metaTitle: 'What Is [Treatment]? Costs, Success Rates & Going Abroad | MedCover'",
   "metaDescription: include definition, abroad angle, and one stat",
   "canonical: /treatments/[treatment]/",
   "index: true, priority: 0.8, changefreq: yearly",
   "Schema: MedicalWebPage + MedicalProcedure + HowTo + FAQPage + BreadcrumbList",
   "MANDATORY: 'Medically reviewed by: [Name, Credentials]. Last reviewed: [Date]' block — required for YMYL E-E-A-T",
   "MedicalProcedure schema: name, description, procedureType, bodyLocation, preparation, followUp",
   "HowTo schema: name, step[] with name and text for each process step",
   "External links (CDC, SART, ESHRE, WHO) must use rel='nofollow' or rel='external'",
   "AEO: HowTo block is the primary snippet target — numbered list, each step 20–40 words"
 ],
 "faqStructure": {
   "count": "10–15 questions",
   "source": "Treatment-specific PAA from SERP + medical FAQ databases",
   "required_topics": [
     "What is the success rate of [Treatment]?",
     "How long does [Treatment] take?",
     "Is [Treatment] painful?",
     "What is the cost of [Treatment] abroad?",
     "Is [Treatment] legal in all countries?",
     "How do I prepare for [Treatment]?",
     "What are the risks of [Treatment]?",
     "How is [Treatment] different from [related treatment]?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "Country guides for each destination (/guides/[country]-ivf-guide/)",
     "/costs/ pages for this treatment",
     "Related treatment pages",
     "/faq/#ivf-basics"
   ]
 },
 "ctaPlacement": "Bottom: 'Compare [Treatment] Options Abroad' → country guide hub. Also link 'Find a Verified Clinic' in Countries section.",
 "formattingInstructions": "HowTo steps: numbered list, 6–8 steps, each step has a title and 1–2 sentence description. Success Rates Table: age bracket column (e.g. <35, 35–37, 38–40, 41–42, >42) + success rate column + source column. Glossary: alphabetical list of terms, each term bolded, 1–2 sentence definition. Medical Reviewer Credit: gray box, top or bottom of article, name + credentials + review date. External Resources: unordered list with source name and URL, labeled 'Authoritative Sources'.",
 "isActive": true
}
```


---


## Template F — Origin Patient Journey Page


**POST `/api/v1/templates`**


```json
{
 "name": "Origin Patient Journey Page",
 "description": "Destination guide for patients from a specific origin country (e.g. USA, UK, Canada). Addresses insurance, legal, logistics, and destination ranking from their home country perspective.",
 "contentType": "LANDING_PAGE",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + Direct Answer",
     "Why [Origin] Patients Travel for IVF (cost table)",
     "Top Destinations for [Origin] Patients (destination cards)",
     "Legal Considerations for [Origin] Patients",
     "Logistics Guide",
     "Patient Stories from [Origin]",
     "FAQ (origin-country-specific)",
     "CTA"
   ]
 },
 "headingStructure": {
   "H1": "IVF Abroad for [Origin Country] Patients: Guide, Costs & Real Experiences",
   "H2s": [
     "Why [Origin] Patients Travel for IVF",
     "Best IVF Destinations for [Origin] Patients",
     "Legal & Insurance Considerations",
     "Logistics: Visa, Travel Insurance & Number of Trips",
     "Real [Origin] Patient Experiences",
     "Frequently Asked Questions"
   ],
   "intro_rule": "60-word answer: state cost comparison (e.g. 'US IVF averages $25,000+ vs €5,500–€8,500 in Spain') and top destination."
 },
 "seoRules": [
   "metaTitle: 'IVF Abroad for [Origin] Patients [Year] — Best Destinations & Real Costs | MedCover'",
   "canonical: /from/[origin-country]/ivf-abroad/",
   "index: true, priority: 0.8, changefreq: monthly",
   "Schema: Article + FAQPage + BreadcrumbList + SpeakableSpecification",
   "Hreflang: en-us for /from/usa/, en-gb for /from/uk/, etc.",
   "Destination cards must be sorted by relevance to origin (flight distance, English proficiency, legal compatibility)",
   "Legal section: clearly disclaim 'This is not legal advice. Consult a qualified attorney for insurance and medical travel law.'"
 ],
 "faqStructure": {
   "count": "10 questions",
   "source": "Origin-country-specific PAA from SERP",
   "required_topics": [
     "Can I use [origin country] insurance for IVF abroad?",
     "How many trips to [destination] does IVF require?",
     "Is IVF in Spain FDA-approved?",
     "What is the time difference and jet lag impact?",
     "Can I bring a partner or support person?",
     "What happens if the cycle fails — do I have to travel again?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "/guides/[country]-ivf-guide/ (top 3 destinations)",
     "/compare/ pages relevant to origin",
     "/faq/"
   ]
 },
 "ctaPlacement": "Bottom: 'Find Your Best Destination' → country guides",
 "formattingInstructions": "Cost comparison table: 3 columns (Location / Avg IVF Cost / With MedCover Top Clinics), rows for US/UK + top 3 destinations. Destination cards: flag, country name, avg cost range, English score, flight time from origin. Logistics section: numbered checklist format (Visa / Travel Insurance / Accommodation / Number of Trips / Time Off Work).",
 "isActive": true
}
```


---


## Template G — Truth Report (Auto-Generated)


**POST `/api/v1/templates`**


```json
{
 "name": "Clinic Truth Report (Auto-Generated)",
 "description": "Programmatically generated deep-dive report on a clinic, triggered when 5+ interviews exist. Aggregates all 10 Truth Score dimensions with full data.",
 "contentType": "ARTICLE",
 "requiredSections": {
   "sections": [
     "Report Header (clinic name, date, interview count, data period)",
     "Truth Score with Dimension Breakdown",
     "Methodology Block",
     "Key Findings Summary (3–5 bullets)",
     "Dimension Deep-Dive (10 sections, one per dimension)",
     "What Patients Loved",
     "What Patients Flagged",
     "Hidden Costs Revealed",
     "MedCover Recommendation",
     "Clinic Official Response (if available)",
     "Data Freshness Notice",
     "CTA"
   ]
 },
 "headingStructure": {
   "H1": "[Clinic Name] Truth Report — Based on [N] Verified Patient Interviews",
   "H2s": [
     "Truth Score Overview: [Score]/100 ([Grade])",
     "Key Findings",
     "Detailed Dimension Analysis",
     "What Patients Loved",
     "What Patients Flagged",
     "Hidden Costs Revealed by Patients",
     "MedCover Recommendation",
     "[Clinic Name]'s Official Response"
   ],
   "H3_rule": "Each of the 10 Truth Score dimensions is an H3 under 'Detailed Dimension Analysis'"
 },
 "seoRules": [
   "metaTitle: '[Clinic Name] Patient Truth Report [Year] — [N] Verified Interviews | MedCover'",
   "metaDescription: include Truth Score, grade, interview count, and top finding",
   "canonical: /reports/[clinic-slug]-patient-truth-report/",
   "CRITICAL: noindex, nofollow when interview count < 5. Switch to index when threshold is met.",
   "index: true (when 5+ interviews), priority: 0.6, changefreq: weekly",
   "Schema: CreativeWork (Report) + AggregateRating + Review x[N] + Organization (clinic) + BreadcrumbList",
   "AggregateRating.ratingValue = Truth Score (0–100 scale), ratingCount = interview count, bestRating: 100",
   "Review entities: anonymized, one per interview excerpt, datePublished = interview month/year",
   "Every report must include 'lastReviewed' date in schema",
   "Methodology link must appear on every report: links to /ai-interviewer/",
   "Patient quotes: 'Patient interview, [Month Year], via MedCover'"
 ],
 "faqStructure": {
   "count": "0 — no FAQ section in Truth Reports",
   "note": "FAQs belong on the Clinic Profile page (Template B). Truth Reports are data reports, not editorial pages."
 },
 "internalLinkingRules": {
   "required": [
     "/clinics/[country]/[city]/[slug]/ (clinic profile)",
     "/guides/[country]-ivf-guide/",
     "/guides/[country]/[city]-ivf-guide/",
     "/ai-interviewer/ (methodology)",
     "/truth-score/ (scoring explanation)"
   ]
 },
 "ctaPlacement": "Two CTAs: (1) 'Connect with [Clinic Name]' (lead gen). (2) 'Add Your Interview' → /start/",
 "formattingInstructions": "Report Header: gray info box with clinic name, report date, interview count (e.g. 'Based on 23 interviews, Jan 2025–May 2026'), and data freshness notice. Dimension scores: scored bars (progress bars) with label and patient count beneath. Key Findings: 3–5 bullet points, each starting with a statistic ('87% of patients said...'). Hidden Costs: bulleted list with frequency. Data Freshness Notice: italic text at bottom 'This report was auto-generated on [date] and updates when new interviews are added.'",
 "isActive": true
}
```


### Auto-Generation Triggers


| Event | Action |
|-------|--------|
| 5th interview published for a clinic | Generate report, switch page to `index` |
| Any new interview published | Queue report regeneration (weekly batch) |
| Clinic submits official response | Force regenerate immediately |
| Interview withdrawn (consent revoked) | Re-check count; if < 5, set `noindex` |


---


## Template H — Patient Story Page


**POST `/api/v1/templates`**


```json
{
 "name": "Patient Story Page",
 "description": "Narrative, interview-sourced patient story. Human-format. Requires explicit written consent before publish. Static after publish.",
 "contentType": "BLOG_POST",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "Story Header (age, origin, destination, treatment, outcome)",
     "Patient Bio (anonymous)",
     "The Full Story (narrative)",
     "Key Data Points callout",
     "What Surprised Them",
     "Would They Do It Again? (direct quote)",
     "Clinic Referenced",
     "Related Stories",
     "CTA"
   ]
 },
 "headingStructure": {
   "H1": "[Outcome/Insight] — An IVF [Treatment] Story from [Origin Country] to [Destination]",
   "H1_example": "'First Cycle Success at 42 — An IVF Story from the US to Barcelona'",
   "H1_rule": "Lead with outcome or compelling detail. Include origin + destination. Never use clinic name in H1 (consent issues).",
   "H2s": [
     "About [Patient — anonymous description]",
     "The Story",
     "What Surprised [Her/Him/Them]",
     "Would [She/He/They] Do It Again?",
     "Related Patient Stories"
   ]
 },
 "seoRules": [
   "metaTitle: '[Outcome] — IVF [Treatment] in [Destination] ([Year]) | MedCover Patient Stories'",
   "canonical: /patient-stories/[descriptive-slug]/",
   "index: true, priority: 0.6, changefreq: never (static after publish)",
   "Schema: Article (PersonalBlogPosting) + Review (if patient gave rating) + BreadcrumbList",
   "Article schema: author: { @type: Person, name: 'Anonymous Patient' }, about: MedicalProcedure (IVF)",
   "CONSENT GATE: page must not be published without consent flag in PatientInterview record",
   "CONSENT REVOKE: if consent withdrawn, delete page entirely — do not replace with anonymized version"
 ],
 "faqStructure": {
   "count": "0 — no FAQ section on patient story pages",
   "note": "Patient stories are narrative, not Q&A format."
 },
 "internalLinkingRules": {
   "required": [
     "Clinic profile page (if consented) OR city guide (if anonymized)",
     "3 related patient stories (same age range + destination)",
     "/guides/[country]-ivf-guide/",
     "/patient-stories/ (hub index)"
   ]
 },
 "ctaPlacement": "Bottom: 'Share Your Story' → /start/",
 "formattingInstructions": "Story Header: structured card — Age Range, Origin Country, Destination Country, Treatment, Outcome (Pregnant Y/N), Cycles. Key Data Points: sidebar-style callout box — cost paid, clinic (if consented), number of cycles, wait time, outcome. Clinic Reference: linked card if consented; 'Clinic name withheld per patient request' if not. Related Stories: 3 cards with story header data.",
 "isActive": true
}
```


---


## Template J — FAQ Hub Page


**POST `/api/v1/templates`**


```json
{
 "name": "FAQ Hub Page",
 "description": "The central AEO hub. All answers anchor-linked. The most important AI Overview target on the site.",
 "contentType": "FAQ",
 "requiredSections": {
   "sections": [
     "Breadcrumb",
     "H1 + intro (2–3 sentences, direct)",
     "#ivf-basics — IVF Abroad Basics (12 questions)",
     "#spain — Spain-Specific (8 questions)",
     "#greece — Greece-Specific (8 questions)",
     "#czech-republic — Czech Republic (6 questions)",
     "#costs — Cost & Hidden Fees (10 questions)",
     "#clinic-selection — Choosing a Clinic (8 questions)",
     "#egg-donation-law — Legal & Ethical (8 questions)",
     "#travel — Travel & Logistics (8 questions)",
     "#success-rates — Success Rates & Lab Quality (8 questions)",
     "#medicalvera — About MedCover Platform (6 questions)"
   ]
 },
 "headingStructure": {
   "H1": "IVF Abroad FAQ — [N]+ Questions Answered with Verified Patient Data",
   "H2s": [
     "IVF Abroad: The Basics",
     "IVF in Spain",
     "IVF in Greece",
     "IVF in Czech Republic",
     "Costs & Hidden Fees",
     "Choosing a Clinic",
     "Egg Donation Law by Country",
     "Travel & Logistics",
     "Success Rates & Lab Quality",
     "About MedCover"
   ],
   "H3_rule": "Every FAQ question is an H3. ID attr must match the anchor pattern: id='what-is-ivf-cost-spain'"
 },
 "seoRules": [
   "metaTitle: 'IVF Abroad FAQ — [N]+ Patient-Sourced Questions Answered | MedCover'",
   "metaDescription: mention number of questions, patient-sourced, and key topics (cost, clinics, legal)",
   "canonical: /faq/",
   "index: true, priority: 0.9, changefreq: monthly",
   "Schema: FAQPage (one per category cluster OR combined) + BreadcrumbList + SpeakableSpecification (top 5 answers)",
   "SpeakableSpecification: mark top 5 answers (most traffic questions) for voice search",
   "AEO rules per answer: (1) First sentence = direct answer. (2) 60–120 words total. (3) At least 1 internal link. (4) Data cited: 'Based on [N] interviews...'",
   "All H3 question IDs must be stable — do not change slugs once live (anchor links in external sites)",
   "Top 5 speakable answers: flag in schema as SpeakableSpecification"
 ],
 "faqStructure": {
   "count": "82 total questions across all categories",
   "answer_format": "Direct answer first sentence. 60–120 words. At least 1 internal link. Cite MedCover data where applicable.",
   "categories": {
     "#ivf-basics": 12,
     "#spain": 8,
     "#greece": 8,
     "#czech-republic": 6,
     "#costs": 10,
     "#clinic-selection": 8,
     "#egg-donation-law": 8,
     "#travel": 8,
     "#success-rates": 8,
     "#medicalvera": 6
   }
 },
 "internalLinkingRules": {
   "rule": "Every answer links to at least one relevant page on the site. FAQ answers are one of the primary internal linking vectors for long-tail pages.",
   "priority_links": [
     "Country guides from country-specific sections",
     "Clinic profiles from clinic-selection section",
     "Cost pages from costs section",
     "Treatment pages from basics section"
   ]
 },
 "ctaPlacement": "No bottom CTA on FAQ hub — it is a utility page. Each section ends with 'Read more: [relevant guide link]'",
 "formattingInstructions": "Each category section has a sticky anchor nav at the top of the page. Questions expand/collapse (accordion). First question in each section is pre-expanded. Speakable answers get a 'Voice Search Optimized' badge (cosmetic only). Answer count visible in each section header (e.g. 'IVF Abroad Basics — 12 questions').",
 "isActive": true
}
```


---


## Template K — For Clinics / B2B Landing Page


**POST `/api/v1/templates`**


```json
{
 "name": "For Clinics B2B Landing Page",
 "description": "B2B landing page targeting clinic administrators and marketing directors. Low SEO priority — conversion-focused, not traffic-focused.",
 "contentType": "LANDING_PAGE",
 "requiredSections": {
   "sections": [
     "Hero: 'Stand Out in a Sea of Fake Reviews'",
     "What MedCover Verified Means",
     "The Problem: Why Fake Reviews Are Destroying Trust",
     "How It Works (3 steps for clinics)",
     "Products: Verified Badge / Lead Gen / VaaS / Truth Report Claim",
     "Pricing overview → /for-clinics/pricing/",
     "Social proof (clinic testimonials)",
     "FAQ (clinic-focused)",
     "CTA: Claim Your Clinic Profile"
   ]
 },
 "headingStructure": {
   "H1": "Stand Out in a Sea of Fake Reviews — Verified Patient Truth for IVF Clinics",
   "H2s": [
     "What 'MedCover Verified' Means for Your Clinic",
     "The Problem: Fake Reviews Are Costing You Patients",
     "How It Works",
     "MedCover Clinic Products",
     "What Clinics Say About MedCover",
     "Frequently Asked Questions for Clinics"
   ]
 },
 "seoRules": [
   "metaTitle: 'Verified Patient Data for IVF Clinics — Stand Out from Fake Reviews | MedCover'",
   "canonical: /for-clinics/",
   "index: true, priority: 0.3, changefreq: rarely",
   "Schema: Service (VaaS + Lead Gen) + FAQPage + Organization + BreadcrumbList",
   "This page is conversion-focused, not traffic-focused — do not over-optimize for search traffic"
 ],
 "faqStructure": {
   "count": "6 questions",
   "source": "Clinic-facing objection handling",
   "required_topics": [
     "Is MedCover a paid review platform?",
     "How does MedCover verify patient interviews?",
     "Can I respond to my clinic's Truth Report?",
     "What is included in the Verified Badge?",
     "How does the lead gen product work?",
     "How much does MedCover cost for clinics?"
   ]
 },
 "internalLinkingRules": {
   "required": [
     "/for-clinics/pricing/",
     "/truth-score/",
     "/ai-interviewer/",
     "Sample clinic profile (strongest Truth Score clinic)"
   ]
 },
 "ctaPlacement": "Hero CTA + bottom CTA: 'Claim Your Clinic Profile' — links to /for-clinics/claim/ or contact form",
 "formattingInstructions": "Hero: large headline + 1 sentence subheadline + single CTA button. Problem section: 2-column 'Fake Review Reality' table (what fake reviews do vs what verified data does). How It Works: 3-step numbered cards. Products: pricing card layout with feature list per tier. Social proof: quote cards from clinic contacts (name, title, clinic name).",
 "isActive": true
}
```


---


## Clinic Inventory Integration Architecture


The `clinic-inventory` app is the **data source** for content on Template B, G, A, A2, and D pages. Here is how data flows from clinic-inventory into the traffic-engine-backend content pipeline:


```
clinic-inventory
 └─ ClinicTruthScore.scoreValue, dimensionScores
 └─ PatientInterview (isPublished=true)
 └─ InterviewAnswer.answerText (by dimension)
 └─ ClinicPricingPackage.priceMin/priceMax
 └─ Clinic.name, slug, city, country
       │
       │  (webhook: POST /api/v1/clinic-inventory/webhook)
       ▼
traffic-engine-backend
 └─ Page.knowledgeFacts (JSON stored from webhook payload)
 └─ SeoBriefBuilder extracts knowledgeFacts from site.config
 └─ GenerationService injects into prompt context
 └─ PromptCompositionEngine composes the final prompt
       │
       ▼
 Page.finalContent → /api/v1/content/by-slug/* → Next.js frontend
```


### Webhook Payload Contract (clinic-inventory → traffic-engine)


When a clinic's Truth Score is recalculated or new interviews are published, clinic-inventory fires a webhook to `/api/v1/clinic-inventory/webhook`. The traffic engine uses this to:


1. Update `site.config.knowledgeBase.[clinic-slug]` with fresh data
2. Re-queue the clinic profile page (`Page`) for content regeneration via `POST /api/v1/pages/:id/generate-content`
3. Re-queue the Truth Report page for regeneration (Template G)


The webhook body should include:


```json
{
 "event": "clinic.truth_score_updated",
 "clinicSlug": "instituto-marques",
 "clinicName": "Instituto Marqués",
 "countryCode": "es",
 "citySlug": "barcelona",
 "truthScore": {
   "scoreValue": 84,
   "gradeLabel": "B",
   "interviewCount": 12,
   "lastCalculatedAt": "2026-05-18T00:00:00Z",
   "dimensionScores": {
     "cost_transparency": 79,
     "english_proficiency": 88,
     "outcome_communication": 82,
     "hidden_fees": 71,
     "staff_quality": 90,
     "lab_transparency": 85,
     "logistics_support": 76,
     "wait_time": 80,
     "emotional_support": 83,
     "value_for_money": 78
   }
 },
 "pricingPackages": [
   { "treatmentType": "IVF", "priceMin": 5500, "priceMax": 7200, "currency": "EUR" },
   { "treatmentType": "EGG_DONATION", "priceMin": 7800, "priceMax": 10500, "currency": "EUR" }
 ],
 "recentInterviewExcerpts": [
   {
     "dimension": "hidden_fees",
     "text": "They quoted us €7,200 all-in. The final bill was €8,950. The clinic never mentioned the anesthesiologist fee.",
     "patientProfile": "34–38, United States",
     "interviewDate": "2025-11"
   }
 ]
}
```


---


## SEO Rules — Global (All Templates)


These rules apply to every page regardless of template:


| Rule | Detail |
|------|--------|
| **AEO Hero Answer** | First 60 words after H1 must answer the primary query directly. No preamble. |
| **YMYL Compliance** | Cost, medical, and legal sections must cite source. Treatment pages require medical reviewer. |
| **E-E-A-T** | Every page must have a clear author/data source attribution. Patient quotes must be dated and tagged. |
| **Patient quote format** | "Patient interview, [Month Year], via MedCover" — never omit. |
| **Schema completeness** | Every page must fire at minimum: BreadcrumbList + the page-type schema. No empty schema objects. |
| **noindex gates** | Clinic Profile and Truth Report pages: `noindex` until 5 interviews collected. Enforced at `Page` record level. |
| **Canonical discipline** | Every page has a canonical. Comparison pages: alphabetical country order is canonical. Year-based cost pages: redirect older years. |
| **Internal link density** | Minimum 1 internal link per 200 words. No orphan pages — every page linked from at least one hub. |
| **Image alt text** | All images require descriptive alt text. Clinic photos: "IVF clinic [name] in [city], [country]". |
| **Last reviewed dates** | Every schema with `lastReviewed` must match the actual page update date — not publication date. |
| **Hreflang** | Origin Journey pages (/from/usa/, /from/uk/) use country-specific hreflang tags. |


---


## Template-to-Subject Mapping


When creating `Subject` records in the traffic engine, link them to the correct `ContentTemplate` ID:


| Subject Type | Template Letter | `contentType` | Example `primaryKeywords` |
|-------------|----------------|---------------|--------------------------|
| Country hub ("IVF in Spain") | A | `LANDING_PAGE` | `["ivf in spain", "spain ivf guide"]` |
| City guide ("IVF Barcelona") | A2 | `CITY_PAGE` | `["ivf in barcelona", "barcelona ivf clinics"]` |
| Clinic profile ("Instituto Marqués review") | B | `LANDING_PAGE` | `["instituto marques review", "instituto marques ivf"]` |
| Country comparison ("Spain vs Greece IVF") | C | `COMPARISON` | `["spain vs greece ivf", "ivf spain or greece"]` |
| Cost page ("IVF cost Spain 2026") | D | `LANDING_PAGE` | `["ivf cost spain 2026", "how much does ivf cost in spain"]` |
| Treatment ("What is IVF?") | E | `ARTICLE` | `["what is ivf", "ivf treatment abroad"]` |
| Origin journey ("IVF abroad USA") | F | `LANDING_PAGE` | `["ivf abroad for us patients", "ivf overseas from usa"]` |
| Truth Report ("Instituto Marqués truth report") | G | `ARTICLE` | `["instituto marques patient review", "instituto marques truth"]` |
| Patient story | H | `BLOG_POST` | `["ivf success story spain", "egg donation barcelona experience"]` |
| FAQ Hub | J | `FAQ` | `["ivf abroad faq", "ivf abroad questions"]` |
| B2B clinics | K | `LANDING_PAGE` | `["ivf clinic review platform", "clinic verification service"]` |



