# Feedback Agent Research - 2026-02-06

## Executive Summary

**Goal:** Build proactive Feedback Agent that automatically collects, analyzes, and acts on user feedback.

**Key Finding:** The best approach is a **hybrid model**:
1. **Passive collection** via webhooks/integrations (Twitter, App Store, Email)
2. **Active collection** via in-app surveys and feedback widgets
3. **AI analysis** for sentiment, themes, and prioritization

---

## Feedback Collection Strategies

### Strategy 1: In-App Feedback Widget (Highest ROI)
```
┌─────────────────────────────────────────────────────────────┐
│  IN-APP FEEDBACK WIDGET                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • "Was this helpful?" buttons                            │
│  • Contextual popups after actions                        │
│  • Simple 1-click feedback                                │
│  • Screenshot attachments                                 │
│                                                              │
│  Tools:                                                    │
│  • Featurebase - $49+/mo                                   │
│  • Frill - Free tier available                            │
│  • Hotjar - $19+/mo (with recordings)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Why:** Users are most engaged IN the app. Highest response quality.

### Strategy 2: Email Feedback Automation
```
┌─────────────────────────────────────────────────────────────┐
│  EMAIL FEEDBACK TIMELINE                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Day 0: Welcome email (no feedback)                        │
│  Day 1-7: Onboarding check-in                             │
│  Day 14: "How's it going?" survey                         │
│  Day 30: NPS score                                        │
│  Day 90: Quarterly check-in                                │
│                                                              │
│  Key: One question per email, plain text, no HTML          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Why:** Every customer has email. High coverage.

### Strategy 3: Social Listening (Passive)
```
┌─────────────────────────────────────────────────────────────┐
│  SOCIAL CHANNELS TO MONITOR                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • Twitter/X - Brand mentions, #hashtags                   │
│  • Reddit - r/SaaS, r/startups                            │
│  • Product Hunt - Reviews and comments                     │
│  • LinkedIn - Company mentions                              │
│  • App Store - Reviews (iOS + Android)                     │
│                                                              │
│  APIs:                                                      │
│  • Twitter API v2 - $100/mo (basic)                       │
│  • Reddit API - Free (rate limited)                        │
│  • App Store Connect API - Free                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Why:** Catches unsolicited feedback, candid opinions.

### Strategy 4: Support Ticket Integration
```
┌─────────────────────────────────────────────────────────────┐
│  SUPPORT INTEGRATION                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Connect to:                                                │
│  • Intercom - Webhooks available                           │
│  • Zendesk - Trigger-based webhooks                        │
│  • Freshdesk - Automations API                             │
│                                                              │
│  Extract:                                                  │
│  • Conversation transcripts                                │
│  • Resolution tags                                         │
│  • CSAT scores                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Why:** Support tickets = rich feedback. High intent.

---

## AI Analysis Capabilities

### Sentiment Analysis (Real-time)
| Service | Accuracy | Cost | Languages |
|---------|----------|------|-----------|
| Google Cloud NLP | 95% | Pay per use | 100+ |
| AWS Comprehend | 94% | Pay per use | Multiple |
| OpenAI GPT-4 | 97%+ | $0.01/1K tokens | All |
| **Gemini** | 95%+ | Free tier available | All |

**Recommendation:** Use Gemini for cost efficiency.

### Theme Detection (Clustering)
```
┌─────────────────────────────────────────────────────────────┐
│  FEEDBACK THEMES DETECTED                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Features          ████████░░ 45%                           │
│  Bug Reports       █████░░░░░ 28%                           │
│  UX/UI            ███░░░░░░ 16%                             │
│  Pricing          █░░░░░░░░ 7%                              │
│  Other            █░░░░░░░░ 4%                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Approach:** Vector embeddings + clustering (already have pgvector).

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FEEDBACK AGENT ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  COLLECTION LAYER                                           │
│  ├── In-app widget (Featurebase/Frill)                    │
│  ├── Email automation (Zapier/Resend)                      │
│  ├── Webhooks (Twitter, App Store)                         │
│  └── Support integration (Intercom, Zendesk)              │
│                                                              │
│  PROCESSING LAYER                                           │
│  ├── Webhook receiver                                      │
│  ├── Deduplication                                          │
│  └── Embedding generation (Gemini)                         │
│                                                              │
│  ANALYSIS LAYER (Gemini AI)                                │
│  ├── Sentiment scoring                                     │
│  ├── Theme clustering (pgvector)                           │
│  ├── Priority scoring                                       │
│  └── Action suggestions                                     │
│                                                              │
│  STORAGE LAYER                                             │
│  └── PostgreSQL + pgvector                                 │
│                                                              │
│  NOTIFICATION LAYER                                        │
│  ├── Critical alerts (negative sentiment)                  │
│  └── Weekly digest                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Priorities

### Phase 1: Manual + Basic (This Week)
- [ ] Keep current manual input form
- [ ] Add "Was this helpful?" widget
- [ ] Add email feedback collection

### Phase 2: Integrations (Next Week)
- [ ] Twitter API webhook
- [ ] App Store Connect API
- [ ] Intercom webhook

### Phase 3: Automation (Month 2)
- [ ] Scheduled social listening
- [ ] Auto-respond to feedback
- [ ] Generate improvement backlog

---

## Tools Comparison

| Tool | Type | Price | Best For |
|------|------|-------|----------|
| **Frill** | In-app widget | Free tier | Simple feedback boards |
| **Featurebase** | In-app + roadmap | $49/mo | Full feedback management |
| **BuildBetter.ai** | AI analysis | $200/mo | Enterprise teams |
| **Zonka Feedback** | Surveys + analysis | $49/mo | Multi-channel |
| **UserVoice** | Feedback + roadmap | $899/mo | Enterprise |
| **AskNicely** | NPS + surveys | $449/mo | B2B |
| **Mopinion** | Feedback collection | $259/mo | Custom surveys |

**Recommendation for Fresh Industries:**
- Start with **Frill** (free) for in-app
- Use **Gemini** for AI analysis (free tier)
- Build custom webhook receiver for Twitter/App Store

---

## Data Flow Examples

### Example 1: Negative Tweet Detection
```
1. User tweets: "@FreshInd This checkout is broken 😡"
2. Twitter webhook → Feedback Agent
3. Gemini analysis: "Negative sentiment, bug report, priority: HIGH"
4. Alert sent: Slack #urgent with transcript
5. Ticket created in project backlog
6. User acknowledged (if public)
```

### Example 2: Positive App Store Review
```
1. 5-star review: "Love this app! Best feature is X"
2. App Store webhook → Feedback Agent
3. Gemini analysis: "Positive sentiment, feature praise, theme: X"
4. Saved to highlights
5. Added to marketing testimonials
```

### Example 3: In-App Feedback
```
1. User clicks "😊" on dashboard
2. Opens feedback modal
3. Types: "Would love dark mode"
4. Gemini analysis: "Feature request, medium priority"
5. Added to product backlog
```

---

## Key Metrics to Track

| Metric | Target | Why |
|--------|--------|-----|
| Response rate | >20% | Engagement quality |
| Sentiment trend | Improving | Product health |
| Resolution time | <48h | Customer satisfaction |
| NPS | >50 | Overall health |

---

## Cost Estimate

| Item | Monthly Cost |
|------|-------------|
| Frill (pro) | $19 |
| Twitter API | $100 |
| Gemini API | ~$10 (usage based) |
| **Total** | **~$129/mo** |

Or use free tiers and stay at $0-50/mo.

---

## Files Created

- `FEEDBACK_AGENT_RESEARCH.md` - This document

---

## Next Steps

1. **Decide on collection sources** - Which channels matter most?
2. **Pick one integration** - Twitter, App Store, or Support?
3. **Build webhook endpoint** - Collect feedback automatically
4. **Set up alerts** - Notify on critical feedback

---

## Sources

- [Sprinklr: Customer Feedback Automation](https://www.sprinklr.com/blog/customer-feedback-automation/)
- [BuildBetter.ai: User Feedback Tools 2025](https://blog.buildbetter.ai/25-best-user-feedback-tools-for-2025-ai-powered-platforms-practices/)
- [Featurebase: In-App Feedback Guide](https://www.featurebase.app/blog/in-app-feedback)
