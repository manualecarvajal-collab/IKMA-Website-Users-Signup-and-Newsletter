# Resend Email Quota — Capacity Report for the IKMA Conference

**Prepared:** 2026-09-29 · **Account sender:** `info@ikmaglobal.com`
**Status of the conference registration flow:** depends entirely on Resend delivering the OTP email.

---

## 1. Correction of an earlier misreading

Earlier in this project I read the API response headers as *remaining* quota and warned
that the registration flow would die after roughly 60 sign-ups. **That was wrong.**

The headers report **used** quota, not remaining. The [official docs](https://resend.com/docs/api-reference/rate-limit)
are explicit:

> | `x-resend-daily-quota` | Your **used** daily email sending quota. Only sent to free plan users. |
> | `x-resend-monthly-quota` | Your **used** monthly email sending quota. |

Four consecutive sends confirm it — every request increments both counters:

```
x-resend-daily-quota:    8 → 9  → 10 → 11
x-resend-monthly-quota: 63 → 64 → 65 → 66
```

The earlier apparent *decrease* (10 → 4) was a UTC midnight rollover of the daily window,
not quota being restored.

**The real picture is the opposite of alarming: the account has plenty of headroom today.**
The problem is not the current usage — it is the **hard daily ceiling** described in section 4.

---

## 2. Official Resend limits

From [Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
and [What is Resend Pricing](https://resend.com/docs/knowledge-base/what-is-resend-pricing):

### Transactional email (this is what the conference uses)

| Plan | Price | Emails / month | Daily limit | Overage |
|---|---|---|---|---|
| **Free** | $0 | 3,000 | **100 / day** | **not available** |
| Pro | $20/mo | 50,000 | none | $0.90 per 1,000 |
| Pro | $35/mo | 100,000 | none | $0.90 per 1,000 |
| Scale | $90/mo | 100,000 | none | $0.90 per 1,000 |
| Scale | $160/mo | 200,000 | none | $0.80 per 1,000 |
| Scale | $350/mo | 500,000 | none | $0.70 per 1,000 |
| Enterprise | custom | custom | none | custom |

### Rules that matter for us

- **The daily limit exists only on the Free plan.** Paid plans have no daily cap, only the
  monthly one. This is the single most important line in this report.
- **The daily window is a UTC calendar day (00:00–24:00 UTC)**, not a rolling 24 hours.
  For Venezuela (UTC−4) that means the counter **resets at 20:00 local time**.
- **Multiple `To`/`CC`/`BCC` recipients count as separate emails.** We send one email per
  recipient, so this does not affect us.
- **Received (inbound) emails also count** against the quota.
- **Overages are only available on paid plans**, capped at 5× the monthly quota. Once that
  is reached, sending is **paused until the next billing cycle**.
- **Rate limit: 10 requests/second per team.** Our sending loop is sequential
  (`await` per recipient), so we stay far below this.

---

## 3. Current measured usage

Measured on 2026-09-29 with a live API call:

| Counter | Value | Free-plan ceiling | Headroom |
|---|---|---|---|
| Used today (UTC) | **11** | 100 | ~89 left today |
| Used this month | **66** | 3,000 | ~2,934 left this month |

The `x-resend-daily-quota` header is only returned to Free plan users, which indicates
**the account is on the Free plan**.

**Both figures mean "used".** The account is nowhere near its limits as of today.

> ⚠️ The API key in use is **restricted to sending only** (`401 restricted_api_key` when
> querying `/domains` or `/emails`). This report therefore **cannot** read the plan from the
> API. The plan was inferred from the presence of the daily-quota header. **Confirm it on the
> [Usage page](https://resend.com/settings/usage).**

---

## 4. The risk on conference day

### What one registration costs

Every registration sends at least one email for the OTP code:

| Event | Emails |
|---|---|
| One new registration | 1 |
| A user who mistypes the code and asks for a resend | +1 each |
| A user who never verifies and tries again later | +1 each |

Plus, on the same day, any campaign sent from the admin panel:

| Event | Emails |
|---|---|
| Reminder broadcast to all registrants | +1 per registrant |
| Membership invitation broadcast | +1 per registrant |

### Where it breaks

On the **Free plan the hard ceiling is 100 emails per UTC day**. Unlike the monthly quota,
**there is no overage on Free** — once the cap is reached, Resend returns `429` and
**sending stops completely until 00:00 UTC**.

Concrete scenarios:

| Scenario | Emails needed that UTC day | Free plan | Outcome |
|---|---|---|---|
| 60 registrations, nothing else | 60 | ✅ | fine |
| 90 registrations + 30 resends | 120 | ❌ | **30 people blocked** |
| 150 registrations | 150 | ❌ | **50 people blocked** |
| 80 registrations + reminder to 300 registrants | 380 | ❌ | blocked early in the day |

**The impact is not a delayed email — it is lost access.** The conference rule is that
`estado = 'confirmado'` is the gate to the live stream, and `confirmado` is only reachable by
entering the emailed code. **If the code email cannot be sent, that person cannot register,
and therefore cannot get in.** There is no fallback path in the current design.

### The timing twist for Venezuela

Because the daily window is UTC, **the quota resets at 20:00 Venezuela time**. Two
consequences:

- A morning/afternoon registration rush can exhaust the 100 and block people **until 8 PM**.
- An evening event gets a fresh 100 **in the middle of the event**, which can mask the
  problem during testing and then bite during the next day's registrations.

### How a failure would look

- **To the attendee:** *"We couldn't send the email. Please try again in a moment."* —
  a generic message that gives no hint of the real cause, and invites a retry that will also
  fail. Several people retrying also consumes cooldown window slots without sending anything.
- **To you:** the admin panel's email section reports `Stopped: Resend quota exhausted. Check
  your plan before retrying.` when it sees a `429`, and the send is logged in
  `conferencia.envios` with the error. **The OTP flow, however, logs only to the server
  console** — it is not visible from the admin panel.

---

## 5. Recommendation

**Upgrade to Resend Pro ($20/month) for the month of the conference.**

Reasoning:

- It removes the daily ceiling entirely, which is the only limit that can realistically break
  the event. 50,000 emails is far beyond what a single conference needs.
- One month costs $20 against the risk of attendees being unable to register and therefore
  unable to join the stream.
- It also enables overages (5× the monthly quota) as a second safety net that the Free plan
  does not have.

If staying on Free is a requirement, then the plan must be:

1. **Never send a broadcast campaign on the same UTC day as a registration push.** One
   100-email day and one campaign day, separated by midnight UTC.
2. **Keep registrations under ~80 per UTC day** to leave room for resends.
3. **Watch the counter** during the day, not after.

---

## 6. Monitoring

- **Usage page** — <https://resend.com/settings/usage> (authoritative; the API cannot be used
  with a send-only key).
- **Logs, filtered to failures** — <https://resend.com/logs?status=429> shows exactly when the
  quota started rejecting sends.
- **In our own data:** `select * from conferencia.envios where ok = false;` lists every failed
  campaign send with the HTTP status and the error body.

### Suggested small improvement (not yet implemented)

Surface quota exhaustion where it is actually actionable:

- Log a distinguishable error when `solicitarCodigo` fails to send because of a `429`, instead
  of falling into the generic `sendFailed` branch, and show a clear notice in
  `/admin/conferencia` — for example *"Resend quota exhausted: N registrations in the last
  hour could not receive their code."*
- Today the OTP failures reach only the server console, so the first symptom of an exhausted
  quota would be attendees complaining.

---

## Sources

- [What are Resend account quotas and limits?](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- [What is Resend Pricing](https://resend.com/docs/knowledge-base/what-is-resend-pricing)
- [Usage Limits (API rate limit & quota headers)](https://resend.com/docs/api-reference/rate-limit)
- [Resend pricing page](https://resend.com/pricing)
