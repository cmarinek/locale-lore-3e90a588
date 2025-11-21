# Legal Information Required for Production

Before launching LocaleLore to production, you need to fill in legal placeholders in several files.

## Required Information

### 1. BUSINESS_NAME (Legal Entity Name)
**What it is:** Your official legal business entity name as registered with your state/country.

**Examples:**
- LLC: "LocaleLore LLC"
- Corporation: "LocaleLore Inc."
- Sole Proprietorship/DBA: "John Doe doing business as LocaleLore"
- Partnership: "LocaleLore Partners LLP"

**Where to find it:**
- Business registration documents
- Articles of incorporation/organization
- DBA (Doing Business As) certificate
- Business license

### 2. BUSINESS_ADDRESS (Registered Business Address)
**What it is:** Your official registered business address (not P.O. Box unless that's your only address).

**Format:**
```
123 Main Street, Suite 456
City, State 12345
United States
```

**Where to find it:**
- Business registration documents
- State business filing records
- IRS Form SS-4 (EIN application)
- Business license

**Note:** This address will be:
- Visible on your website's legal pages
- Used for legal notices and service of process
- Required for GDPR/privacy compliance
- Listed on contact page

### 3. JURISDICTION (State/Country)
**What it is:** The legal jurisdiction that governs your Terms of Service.

**Examples:**
- "Delaware, United States"
- "California, United States"
- "New York, United States"
- "United Kingdom"

**Important:** This should match where your business is registered or where you primarily operate.

---

## Files That Need Updates

### Critical (Required Before Launch):

1. **src/pages/TermsOfService.tsx**
   - Line 7: `BUSINESS_NAME`
   - Line 8: `BUSINESS_ADDRESS`
   - Line 13: `JURISDICTION`

2. **src/pages/PrivacyPolicy.tsx**
   - Line 7: `BUSINESS_NAME`
   - Line 8: `BUSINESS_ADDRESS`

3. **src/pages/RefundPolicy.tsx**
   - Line 6: `BUSINESS_NAME`

4. **src/pages/CookiePolicy.tsx**
   - Line 6: `BUSINESS_NAME`

5. **src/pages/Contact.tsx**
   - Line 15: `BUSINESS_NAME`
   - Line 16: `BUSINESS_ADDRESS`

---

## How to Update

### Option 1: Search and Replace (Recommended)
```bash
# Replace BUSINESS_NAME
find src/pages -type f -name "*.tsx" -exec sed -i 's/\[YOUR LEGAL ENTITY NAME\]/YOUR_ACTUAL_BUSINESS_NAME/g' {} +

# Replace BUSINESS_ADDRESS
find src/pages -type f -name "*.tsx" -exec sed -i 's/\[YOUR REGISTERED ADDRESS\]/YOUR_ACTUAL_ADDRESS/g' {} +

# Replace JURISDICTION (only in TermsOfService.tsx)
sed -i 's/\[YOUR STATE\/COUNTRY\]/YOUR_ACTUAL_JURISDICTION/g' src/pages/TermsOfService.tsx
```

### Option 2: Manual Edit
Open each file and update the const declarations at the top.

---

## Additional Legal Requirements

### Email Forwarding Setup

You should configure email forwarding at your domain registrar for:

1. **support@localelore.org** (Already configured ✅)
2. **legal@localelore.org** - For legal notices and DMCA takedowns
3. **privacy@localelore.org** - For GDPR/privacy requests
4. **security@localelore.org** - For security vulnerability reports

### Legal Review (Highly Recommended)

Before launch, consider having your legal documents reviewed by:
- A business attorney in your jurisdiction
- A privacy/data protection attorney (especially for GDPR compliance)

**Why?**
- Terms of Service and Privacy Policy are legal contracts
- Incorrect information could affect enforceability
- Different jurisdictions have different requirements
- Stripe requires accurate business information

### Stripe Business Information

Ensure your Stripe account has matching information:
- Legal business name
- Business address
- Tax ID (EIN for US businesses)
- Business type

**Mismatch can cause:**
- Payment processing issues
- Account holds/reviews
- Payout delays
- Compliance violations

---

## Legal Structure Options

### Not Yet Incorporated?

If you haven't formed a legal entity yet, you have options:

#### 1. Sole Proprietorship (Simplest)
- **Name format:** "Your Name DBA LocaleLore"
- **Address:** Your home address
- **Jurisdiction:** Your state of residence
- **Pros:** No paperwork, cheapest
- **Cons:** Unlimited personal liability

#### 2. LLC (Recommended)
- **Name format:** "LocaleLore LLC"
- **Address:** Registered agent or business address
- **Jurisdiction:** State where you file
- **Pros:** Liability protection, flexible
- **Cons:** State filing fees ($50-$500), annual reports

#### 3. C-Corp or S-Corp
- Best if seeking investors
- More complex tax treatment
- Higher costs

### Quick Formation Resources:
- **LegalZoom:** $79+ plus state fees
- **Incfile (now Bizee):** $0+ plus state fees
- **Northwest Registered Agent:** $39+ plus state fees
- **DIY:** File directly with your state ($50-$200)

**Popular states for online businesses:**
- Delaware - Business-friendly laws
- Wyoming - Low fees, privacy
- Your home state - Simplest, no foreign registration needed

---

## Timeline

**Minimum:** 1 hour (if you already have a legal entity)
**Maximum:** 2-4 weeks (if forming new LLC)

---

## What Happens If You Don't Fill These In?

### Legal Risks:
- Terms of Service may not be enforceable
- Privacy Policy non-compliance (GDPR violations up to €20M or 4% of revenue)
- Cannot properly respond to legal notices
- Stripe account suspension for incomplete business info

### User Trust Issues:
- Users see placeholder text - looks unprofessional
- Cannot contact you for support/legal issues
- Damages credibility

---

## Current Status

As of now, these placeholders appear in production-facing pages:

```
✅ Subscription Plans: Updated to $4.97/month, 3-day trial
✅ Support Email: support@localelore.org configured
✅ Domain: localelore.org configured
❌ Legal Entity: "[YOUR LEGAL ENTITY NAME]"
❌ Business Address: "[YOUR REGISTERED ADDRESS]"
❌ Jurisdiction: "[YOUR STATE/COUNTRY]"
```

---

## Example - Filled In

### If you were "LocaleLore LLC" in Delaware:

```typescript
const BUSINESS_NAME = "LocaleLore LLC";
const BUSINESS_ADDRESS = "123 Main Street, Suite 456\\nWilmington, DE 19801\\nUnited States";
const JURISDICTION = "Delaware, United States";
```

---

## Need Help?

If you're unsure about:
- What legal structure to choose
- How to form an LLC
- What information to use

Consider consulting:
1. A local business attorney
2. An online legal service (LegalZoom, Rocket Lawyer)
3. Your state's Small Business Development Center (SBDC) - often free

---

**Next Steps:**
1. Decide on your legal structure
2. Gather your business information
3. Update all files with correct information
4. Have legal documents reviewed (recommended)
5. Set up email forwarding for legal/privacy/security
6. Verify Stripe account has matching information
