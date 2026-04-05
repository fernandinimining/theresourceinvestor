# The Resource Investor — Affiliate SEO Website

A complete, deployment-ready static affiliate website targeting the **mining stock investing** niche. Built for passive income through affiliate marketing and SEO traffic.

---

## Quick Deploy

### Option A: GitHub Pages (Free)

```bash
cd affiliate-site
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/theresourceinvestor.git
git push -u origin main
```

Then go to **Settings > Pages** in your GitHub repo, select `main` branch, root `/`, and click Save. Your site will be live at `https://YOUR_USERNAME.github.io/theresourceinvestor/`.

**Custom domain:** Add a `CNAME` file with your domain (e.g., `theresourceinvestor.com`) and configure DNS (A records pointing to GitHub's IPs: `185.199.108-111.153`).

### Option B: Vercel (Free)

```bash
npm i -g vercel
cd affiliate-site
vercel
```

Follow the prompts. Vercel auto-detects static sites. Free tier includes custom domains, HTTPS, and global CDN.

### Option C: Netlify (Free)

Drag and drop the `affiliate-site` folder at [app.netlify.com/drop](https://app.netlify.com/drop).

---

## Site Structure

```
affiliate-site/
├── index.html                          # Homepage (main landing page)
├── about.html                          # About, disclosure, privacy, terms
├── 404.html                            # Custom 404 page
├── sitemap.xml                         # XML sitemap for search engines
├── robots.txt                          # Crawler instructions
├── css/
│   └── styles.css                      # Complete stylesheet
├── js/
│   └── main.js                         # Interactivity + tracking
├── articles/
│   ├── best-mining-stocks-2026.html    # "7 Best Mining Stocks to Buy in 2026"
│   ├── copper-stocks-guide.html        # "Complete Guide to Copper Stock Investing"
│   ├── gold-mining-stocks.html         # "Undervalued Gold Mining Stocks"
│   ├── mining-etfs-vs-stocks.html      # "Mining ETFs vs Individual Stocks"
│   └── best-stock-screeners.html       # "5 Best Stock Screeners" (highest monetization)
└── images/                             # Add OG images here (1200x630px recommended)
```

---

## Monetization Strategy

### Revenue Streams (Ranked by Potential)

| Stream | Commission | Est. Monthly | Priority |
|--------|-----------|-------------|----------|
| **Brokerage referrals** (IBKR, Webull) | $50–200/signup | $500–2,000 | HIGH |
| **SaaS affiliate** (TradingView, Seeking Alpha) | 20–40% recurring | $200–800 | HIGH |
| **Display ads** (Mediavine/AdThrive at 50k+ sessions) | $15–30 RPM | $750–1,500 | MEDIUM |
| **Email list** (sponsor deals, premium content) | $0.50–2/subscriber/mo | $200–1,000 | MEDIUM |
| **Amazon Associates** (mining books, equipment) | 4–8% per sale | $50–200 | LOW |

### Affiliate Programs to Join

1. **Interactive Brokers** — [ibkr.com/referral](https://www.interactivebrokers.com) — $200/funded account
2. **Webull** — [webull.com/activity](https://www.webull.com) — $50–100/funded account
3. **TradingView** — [tradingview.com/partner](https://www.tradingview.com) — 30% recurring commission
4. **Seeking Alpha** — [seekingalpha.com/affiliate](https://www.seekingalpha.com) — $15–20/premium signup
5. **Koyfin** — [koyfin.com](https://www.koyfin.com) — Commission program available
6. **Amazon Associates** — [affiliate-program.amazon.com](https://affiliate-program.amazon.com) — 4-8% on book sales

### How to Add Your Affiliate Links

All affiliate links use `data-affiliate` attributes for tracking. Search for placeholder URLs and replace:

- `https://www.interactivebrokers.com` → Your IBKR referral link
- `https://www.webull.com` → Your Webull referral link
- `https://www.tradingview.com` → Your TradingView partner link
- `https://www.seekingalpha.com` → Your Seeking Alpha affiliate link
- `https://www.koyfin.com` → Your Koyfin referral link

---

## SEO Strategy

### Target Keywords by Page

| Page | Primary Keyword | Monthly Search Vol | Competition |
|------|----------------|-------------------|-------------|
| Homepage | mining stock investing | 2,400 | Medium |
| Best Mining Stocks | best mining stocks 2026 | 5,400 | Medium |
| Copper Guide | best copper stocks | 3,600 | Low-Medium |
| Gold Mining | undervalued gold mining stocks | 2,900 | Low |
| ETFs vs Stocks | mining ETFs vs stocks | 1,300 | Low |
| Stock Screeners | best stock screeners mining | 1,800 | Low |

### SEO Checklist

- [x] Proper title tags (55-60 chars)
- [x] Meta descriptions (150-160 chars)
- [x] Schema.org markup (Article, FAQPage, WebSite)
- [x] Open Graph + Twitter cards
- [x] Canonical URLs
- [x] XML sitemap
- [x] robots.txt
- [x] Internal linking between all pages
- [x] Mobile-responsive design
- [x] Fast loading (no frameworks, CDN fonts only)
- [x] Breadcrumb navigation
- [x] FAQ sections with structured data

### Month 1-3 Action Plan

1. **Deploy site** to GitHub Pages or Vercel
2. **Register domain** (suggested: `theresourceinvestor.com` or similar)
3. **Set up Google Search Console** — submit sitemap.xml
4. **Set up Google Analytics 4** — uncomment GA snippet in index.html, add to all pages
5. **Join affiliate programs** — IBKR, TradingView, Webull, Seeking Alpha
6. **Replace placeholder affiliate links** with your actual referral URLs
7. **Add OG images** to `/images/` folder (1200x630px for each page)
8. **Submit to directories** — Bing Webmaster, Yandex Webmaster
9. **Build backlinks** — guest posts on mining forums, Reddit (r/mining, r/investing)
10. **Add 2 new articles per month** — target long-tail keywords

### Content Ideas for Growth

- "How to Read a Mining Company's Technical Report"
- "Lithium Stocks vs Copper Stocks: Where to Invest"
- "Best Junior Mining Stocks Under $5"
- "Mining Royalty Companies: The Safest Way to Invest in Mining"
- "How to Value a Mining Stock (DCF, NAV, and Comparables)"
- "Top 10 Mining Stocks on the TSX"
- "Silver Mining Stocks: Complete Investor Guide"
- "Peru Mining Stocks: Hidden Value on the Lima Exchange"

---

## Analytics Setup

### Google Analytics 4

Uncomment the GA4 snippet in `index.html` <head> and add to every page:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Affiliate Click Tracking

All affiliate links already have `data-affiliate` attributes. The included `main.js` fires GA4 `affiliate_click` events automatically. This lets you track:
- Which affiliate gets the most clicks
- Which page drives the most revenue
- Click-through rate by position

---

## Email List Building

The site includes email signup forms on every page. Currently stores to `localStorage` as a placeholder. To make it functional:

### Free Options
- **Mailchimp** (free up to 500 contacts) — Replace form action with Mailchimp embedded form
- **Buttondown** (free up to 100) — Simple API integration
- **ConvertKit** (free up to 10,000) — Best for creators

### Monetizing Your Email List
- Weekly mining stock picks newsletter
- Sponsored content from brokerages/tools
- Premium tier ($5-10/month for detailed analysis)

---

## Estimated Income Timeline

| Month | Traffic | Revenue | Key Milestone |
|-------|---------|---------|---------------|
| 1-2 | 100-500 visits/mo | $0-50 | Site indexed, first rankings |
| 3-4 | 500-2,000 visits/mo | $50-200 | First affiliate commissions |
| 5-6 | 2,000-5,000 visits/mo | $200-800 | Growing organic traffic |
| 7-9 | 5,000-10,000 visits/mo | $500-1,500 | Eligible for display ads |
| 10-12 | 10,000-25,000 visits/mo | $1,000-3,000 | Steady passive income |

*These are conservative estimates. Mining/finance niches have high RPM due to advertiser competition.*

---

## Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom stylesheet, no framework dependency
- **Vanilla JS** — Zero dependencies, fast loading
- **Google Fonts** — Inter (single font, optimized loading)
- **Schema.org** — JSON-LD structured data

No build step required. No npm. No node_modules. Just static files ready to deploy.

---

## License

Content and code created for personal/commercial use. Affiliate links should be replaced with your own referral URLs before publishing.
