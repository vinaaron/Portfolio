#!/usr/bin/env python3
"""
Company Discovery Pipeline MVP
Finds companies matching job search criteria, checks careers pages,
finds contact emails, and drafts cold outreach emails.

Usage:
    python scripts/discover_companies.py --preset cambridge-ai
    python scripts/discover_companies.py --preset london-fintech --find-emails
    python scripts/discover_companies.py --location "Cambridge UK" --industry "AI ML"
"""

import argparse
import csv
import os
import sys
import time
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Run: pip install requests beautifulsoup4")
    sys.exit(1)

# --- Configuration ---

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DISCOVERY_CSV = PROJECT_DIR / "company_discovery.csv"
OUTREACH_CSV = PROJECT_DIR / "outreach_tracker.csv"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

REQUEST_TIMEOUT = 10
DELAY_BETWEEN_REQUESTS = 1.5  # seconds, be polite

PRESETS = {
    "cambridge-ai": {
        "searches": [
            # Search for actual company sites by naming known ones + similar
            "Prowler.io Cambridge AI company careers",
            "Faculty AI Cambridge machine learning careers",
            "ConcertAI Cambridge data science careers",
            "Secondmind Cambridge machine learning careers",
            "Paragraf Cambridge deep tech careers",
            "CMR Surgical Cambridge robotics careers",
            "Fetch.ai Cambridge AI blockchain careers",
            "Cambridge AI companies software engineer site:*.com/careers",
        ],
        "role_keywords": ["software engineer", "ml engineer", "platform engineer", "python", "backend"],
    },
    "london-fintech": {
        "searches": [
            "Thought Machine London cloud banking careers",
            "Paddle London SaaS billing careers",
            "Checkout.com London payments careers",
            "Starling Bank London engineering careers",
            "Tide London fintech careers",
            "Railsr London fintech infrastructure careers",
            "Flagstone London fintech careers",
            "London fintech software engineer site:*.com/careers",
        ],
        "role_keywords": ["software engineer", "ml engineer", "data engineer", "backend", "python"],
    },
    "uk-remote-saas": {
        "searches": [
            "PostHog UK remote analytics careers",
            "Raycast UK remote developer tools careers",
            "Grafana Labs UK remote observability careers",
            "Snyk UK remote security careers",
            "Ably UK remote realtime infrastructure careers",
            "UK remote SaaS company software engineer careers",
        ],
        "role_keywords": ["software engineer", "backend engineer", "platform engineer", "python"],
    },
    "cambridge-all": {
        "searches": [
            "Darktrace Cambridge careers software engineer",
            "Speechmatics Cambridge careers",
            "Healx Cambridge careers machine learning",
            "Luminance Cambridge AI legal careers",
            "Raspberry Pi Cambridge engineering careers",
            "Jagex Cambridge game developer careers",
            "Frontier Developments Cambridge careers",
            "Cambridge tech companies hiring engineers 2026",
        ],
        "role_keywords": ["software engineer", "engineer", "developer", "python", "backend"],
    },
}

# Seed companies: known companies to always check (curated list)
SEED_COMPANIES = {
    "cambridge-ai": [
        {"company": "Prowler.io", "website": "https://prowler.io", "domain": "prowler.io"},
        {"company": "Secondmind", "website": "https://secondmind.ai", "domain": "secondmind.ai"},
        {"company": "Faculty AI", "website": "https://faculty.ai", "domain": "faculty.ai"},
        {"company": "Paragraf", "website": "https://paragraf.com", "domain": "paragraf.com"},
        {"company": "CMR Surgical", "website": "https://cmrsurgical.com", "domain": "cmrsurgical.com"},
        {"company": "Fetch.ai", "website": "https://fetch.ai", "domain": "fetch.ai"},
        {"company": "Wayve", "website": "https://wayve.ai", "domain": "wayve.ai"},
        {"company": "Riverlane", "website": "https://riverlane.com", "domain": "riverlane.com"},
        {"company": "Mogrify", "website": "https://mogrify.co.uk", "domain": "mogrify.co.uk"},
        {"company": "Raspberry Pi", "website": "https://raspberrypi.com", "domain": "raspberrypi.com"},
        {"company": "Jagex", "website": "https://jagex.com", "domain": "jagex.com"},
        {"company": "Cambridge GaN Devices", "website": "https://camgandevices.com", "domain": "camgandevices.com"},
        {"company": "Xaar", "website": "https://xaar.com", "domain": "xaar.com"},
    ],
    "london-fintech": [
        {"company": "Thought Machine", "website": "https://thoughtmachine.net", "domain": "thoughtmachine.net"},
        {"company": "Paddle", "website": "https://paddle.com", "domain": "paddle.com"},
        {"company": "Checkout.com", "website": "https://checkout.com", "domain": "checkout.com"},
        {"company": "Starling Bank", "website": "https://starlingbank.com", "domain": "starlingbank.com"},
        {"company": "Tide", "website": "https://tide.co", "domain": "tide.co"},
        {"company": "Railsr", "website": "https://railsr.com", "domain": "railsr.com"},
        {"company": "Flagstone", "website": "https://flagstoneim.com", "domain": "flagstoneim.com"},
        {"company": "OakNorth", "website": "https://oaknorth.com", "domain": "oaknorth.com"},
        {"company": "Zilch", "website": "https://zilch.com", "domain": "zilch.com"},
        {"company": "TrueLayer", "website": "https://truelayer.com", "domain": "truelayer.com"},
    ],
}

COLD_EMAIL_TEMPLATE = """Subject: Cambridge SWE -- Python + AWS, immediate availability

Hi {contact_name},

I'm a Cambridge-based engineer who recently wrapped up a technical co-founder role building a production Python/FastAPI backend with PostgreSQL and AWS infrastructure (Terraform, ECS Fargate, CI/CD). Also built ML-powered features: embedding search, LLM re-ranking.

I saw {company} is {hook}. If there are any openings on the engineering team, I'd love to chat.

CV attached. Happy to hop on a quick call anytime.

Aaron Vinod
MEng Engineering Mathematics, University of Bristol
github.com/ce20480 | +44 7476 904065"""


# --- Search Functions ---

def search_duckduckgo(query: str) -> list[dict]:
    """Search DuckDuckGo HTML and extract results."""
    results = []
    try:
        url = "https://html.duckduckgo.com/html/"
        resp = requests.post(url, data={"q": query}, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for result in soup.select("div.result, div.web-result"):
            link_el = result.select_one("a.result__a")
            snippet_el = result.select_one("a.result__snippet")

            if link_el:
                href = link_el.get("href", "")
                title = link_el.get_text(strip=True)
                snippet = snippet_el.get_text(strip=True) if snippet_el else ""

                # DuckDuckGo sometimes wraps URLs in redirect
                if "uddg=" in href:
                    from urllib.parse import unquote
                    href = unquote(href.split("uddg=")[1].split("&")[0])

                if href.startswith("http") and title:
                    results.append({
                        "title": title,
                        "url": href,
                        "snippet": snippet,
                    })
    except Exception as e:
        print(f"  [!] Search failed for '{query[:50]}...': {e}")

    return results


def extract_companies_from_results(search_results: list[dict], existing_domains: set) -> list[dict]:
    """Extract unique company info from search results, filtering known domains."""
    companies = {}

    # Domains to skip (job boards, social media, aggregators, list sites)
    skip_domains = {
        "linkedin.com", "indeed.com", "glassdoor.com", "glassdoor.co.uk",
        "reed.co.uk", "totaljobs.com", "monster.com", "ziprecruiter.com",
        "wellfound.com", "angel.co", "crunchbase.com", "google.com",
        "youtube.com", "twitter.com", "x.com", "facebook.com",
        "wikipedia.org", "github.com", "medium.com", "techcrunch.com",
        "builtin.com", "theorg.com", "rocketreach.co", "apollo.io",
        "hunter.io", "gov.uk", "bbc.co.uk", "theguardian.com",
        "ft.com", "reuters.com", "bloomberg.com",
        # Aggregator / list sites
        "f6s.com", "seedtable.com", "failory.com", "explodingtopics.com",
        "workinstartups.com", "shizune.co", "ai-startups.pro", "labiotech.eu",
        "themanifest.com", "cybersecurityjobs.tech", "cic.vc",
        "freestartupfunding.com", "huntukvisasponsors.com", "tracxn.com",
        "startupstash.com", "eu-startups.com", "sifted.eu", "dealroom.co",
        "beauhurst.com", "pitchbook.com", "owler.com", "datanyze.com",
        "goodfirms.co", "clutch.co", "sortlist.com", "toptal.com",
    }

    for result in search_results:
        try:
            parsed = urlparse(result["url"])
            domain = parsed.netloc.lower()
            # Strip www.
            if domain.startswith("www."):
                domain = domain[4:]
            # Get base domain (company.com, not careers.company.com)
            parts = domain.split(".")
            if len(parts) > 2:
                domain = ".".join(parts[-2:])

            if domain in skip_domains or domain in existing_domains:
                continue
            if domain in companies:
                continue

            companies[domain] = {
                "company": result["title"].split(" - ")[0].split(" | ")[0].strip()[:60],
                "website": f"https://{domain}",
                "domain": domain,
                "snippet": result["snippet"][:200],
            }
        except Exception:
            continue

    return list(companies.values())


# --- Careers Page Functions ---

def check_careers_page(company: dict, role_keywords: list[str]) -> dict:
    """Fetch careers page and look for relevant roles."""
    domain = company["domain"]
    careers_urls = [
        f"https://{domain}/careers",
        f"https://{domain}/jobs",
        f"https://{domain}/careers/",
        f"https://{domain}/about/careers",
        f"https://careers.{domain}",
    ]

    for careers_url in careers_urls:
        try:
            resp = requests.get(careers_url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                page_text = soup.get_text(separator=" ", strip=True).lower()

                # Look for role keywords
                found_roles = []
                for keyword in role_keywords:
                    if keyword.lower() in page_text:
                        found_roles.append(keyword)

                return {
                    "careers_url": str(resp.url),
                    "has_relevant_role": len(found_roles) > 0,
                    "found_keywords": found_roles,
                    "page_length": len(page_text),
                }
        except Exception:
            continue

    return {
        "careers_url": "",
        "has_relevant_role": False,
        "found_keywords": [],
        "page_length": 0,
    }


# --- Email Finding Functions ---

def find_email_hunter(domain: str, api_key: str) -> dict:
    """Find engineering/recruiting contacts via Hunter.io API."""
    try:
        resp = requests.get(
            "https://api.hunter.io/v2/domain-search",
            params={
                "domain": domain,
                "api_key": api_key,
                "type": "personal",
                "limit": 5,
            },
            timeout=REQUEST_TIMEOUT,
        )
        data = resp.json()

        if "data" not in data or not data["data"].get("emails"):
            return {}

        # Priority: engineering > recruiting > any
        eng_titles = ["cto", "engineer", "developer", "technical", "head of engineering"]
        recruit_titles = ["recruiter", "talent", "hr", "people"]

        emails = data["data"]["emails"]

        # Try engineering contacts first
        for email_data in emails:
            title = (email_data.get("position") or "").lower()
            if any(t in title for t in eng_titles):
                return {
                    "contact_name": f"{email_data.get('first_name', '')} {email_data.get('last_name', '')}".strip(),
                    "contact_title": email_data.get("position", ""),
                    "contact_email": email_data.get("value", ""),
                    "email_source": "hunter.io",
                }

        # Try recruiting contacts
        for email_data in emails:
            title = (email_data.get("position") or "").lower()
            if any(t in title for t in recruit_titles):
                return {
                    "contact_name": f"{email_data.get('first_name', '')} {email_data.get('last_name', '')}".strip(),
                    "contact_title": email_data.get("position", ""),
                    "contact_email": email_data.get("value", ""),
                    "email_source": "hunter.io",
                }

        # Fall back to first result
        first = emails[0]
        return {
            "contact_name": f"{first.get('first_name', '')} {first.get('last_name', '')}".strip(),
            "contact_title": first.get("position", ""),
            "contact_email": first.get("value", ""),
            "email_source": "hunter.io",
        }

    except Exception as e:
        print(f"  [!] Hunter.io lookup failed for {domain}: {e}")
        return {}


def guess_email_pattern(domain: str) -> dict:
    """Guess common email patterns when no API is available."""
    return {
        "contact_name": "",
        "contact_title": "",
        "contact_email": f"hiring@{domain}",
        "email_source": f"pattern_guess (try: info@{domain}, careers@{domain}, jobs@{domain})",
    }


# --- Email Drafting ---

def draft_cold_email(company: dict, contact: dict) -> str:
    """Draft a personalized cold email."""
    contact_name = contact.get("contact_name", "").split()[0] if contact.get("contact_name") else "there"
    hook = company.get("snippet", "building interesting technology")[:100]

    # Clean up the hook
    if not hook or len(hook) < 10:
        hook = "building interesting technology"

    return COLD_EMAIL_TEMPLATE.format(
        contact_name=contact_name,
        company=company["company"],
        hook=hook,
    )


# --- CSV Functions ---

def load_existing_domains() -> set:
    """Load domains from both CSVs to avoid duplicates."""
    domains = set()

    for csv_path in [DISCOVERY_CSV, OUTREACH_CSV]:
        if not csv_path.exists():
            continue
        try:
            with open(csv_path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Extract domain from website or careers_url
                    for field in ["website", "careers_url"]:
                        url = row.get(field, "")
                        if url:
                            try:
                                parsed = urlparse(url)
                                domain = parsed.netloc.lower().replace("www.", "")
                                parts = domain.split(".")
                                if len(parts) > 2:
                                    domain = ".".join(parts[-2:])
                                if domain:
                                    domains.add(domain)
                            except Exception:
                                pass
        except Exception:
            pass

    return domains


def get_next_batch_id() -> str:
    """Generate batch ID in format YYYYMMDD-N, incrementing N per day."""
    today_str = date.today().strftime("%Y%m%d")
    n = 1
    if DISCOVERY_CSV.exists():
        try:
            with open(DISCOVERY_CSV, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    bid = row.get("batch_id", "")
                    if bid.startswith(today_str):
                        try:
                            existing_n = int(bid.split("-")[1])
                            n = max(n, existing_n + 1)
                        except (IndexError, ValueError):
                            pass
        except Exception:
            pass
    return f"{today_str}-{n}"


def init_csv():
    """Create discovery CSV with headers if it doesn't exist."""
    if not DISCOVERY_CSV.exists():
        with open(DISCOVERY_CSV, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "batch_id", "date_found", "company", "website", "location", "industry",
                "careers_url", "has_relevant_role", "role_title", "role_url",
                "contact_name", "contact_title", "contact_email", "email_source",
                "personalization_hook", "cold_email_draft",
                "cv_version", "email_sent", "applied", "response",
                "follow_up_date", "status", "notes",
            ])


def append_to_csv(results: list[dict]):
    """Append discovery results to CSV."""
    with open(DISCOVERY_CSV, "a", newline="") as f:
        writer = csv.writer(f)
        for r in results:
            writer.writerow([
                r.get("batch_id", ""),
                r.get("date_found", ""),
                r.get("company", ""),
                r.get("website", ""),
                r.get("location", ""),
                r.get("industry", ""),
                r.get("careers_url", ""),
                r.get("has_relevant_role", ""),
                r.get("role_title", ""),
                r.get("role_url", ""),
                r.get("contact_name", ""),
                r.get("contact_title", ""),
                r.get("contact_email", ""),
                r.get("email_source", ""),
                r.get("personalization_hook", ""),
                r.get("cold_email_draft", ""),
                r.get("cv_version", ""),
                r.get("email_sent", ""),
                r.get("applied", ""),
                r.get("response", ""),
                r.get("follow_up_date", ""),
                r.get("status", ""),
                r.get("notes", ""),
            ])


# --- File Loading ---

def load_companies_from_file(filepath: str) -> list[dict]:
    """Load companies from a text file. Format: company_name,website_url (one per line)."""
    companies = []
    try:
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = line.split(",", 1)
                if len(parts) == 2:
                    name, url = parts[0].strip(), parts[1].strip()
                    if not url.startswith("http"):
                        url = f"https://{url}"
                    parsed = urlparse(url)
                    domain = parsed.netloc.lower().replace("www.", "")
                    companies.append({
                        "company": name,
                        "website": url,
                        "domain": domain,
                        "snippet": "",
                    })
                elif len(parts) == 1 and "." in parts[0]:
                    # Just a domain/URL
                    url = parts[0] if parts[0].startswith("http") else f"https://{parts[0]}"
                    parsed = urlparse(url)
                    domain = parsed.netloc.lower().replace("www.", "")
                    companies.append({
                        "company": domain.split(".")[0].title(),
                        "website": url,
                        "domain": domain,
                        "snippet": "",
                    })
    except FileNotFoundError:
        print(f"[!] File not found: {filepath}")
    return companies


def run_discovery_from_list(companies: list[dict], role_keywords: list[str],
                            find_emails: bool = False):
    """Run discovery pipeline on a pre-built list of companies."""
    today = date.today().isoformat()
    existing = load_existing_domains()

    # Filter out known companies
    companies = [c for c in companies if c["domain"] not in existing]
    print(f"\n[*] Processing {len(companies)} companies from file (skipped {len(existing)} known)")

    hunter_key = os.environ.get("HUNTER_API_KEY", "")
    init_csv()

    # Check careers, find emails, draft emails
    for i, company in enumerate(companies):
        print(f"  [{i+1}/{len(companies)}] {company['company']} ({company['domain']})")
        careers_info = check_careers_page(company, role_keywords)
        company.update(careers_info)
        if careers_info["has_relevant_role"]:
            print(f"    -> Relevant roles found: {', '.join(careers_info['found_keywords'])}")

        if find_emails and hunter_key:
            contact = find_email_hunter(company["domain"], hunter_key)
            company.update(contact if contact else guess_email_pattern(company["domain"]))
        else:
            company.update(guess_email_pattern(company["domain"]))

        company["cold_email_draft"] = draft_cold_email(company, company)
        time.sleep(DELAY_BETWEEN_REQUESTS)

    # Write to CSV
    batch_id = get_next_batch_id()
    follow_up = (date.today() + timedelta(days=5)).isoformat()
    csv_rows = []
    for company in companies:
        csv_rows.append({
            "batch_id": batch_id,
            "date_found": today,
            "company": company.get("company", ""),
            "website": company.get("website", ""),
            "location": "",
            "industry": "",
            "careers_url": company.get("careers_url", ""),
            "has_relevant_role": "Yes" if company.get("has_relevant_role") else "No",
            "role_title": "",
            "role_url": "",
            "contact_name": company.get("contact_name", ""),
            "contact_title": company.get("contact_title", ""),
            "contact_email": company.get("contact_email", ""),
            "email_source": company.get("email_source", ""),
            "personalization_hook": company.get("snippet", "")[:150],
            "cold_email_draft": company.get("cold_email_draft", "").replace("\n", " | "),
            "cv_version": "",
            "email_sent": "",
            "applied": "",
            "response": "",
            "follow_up_date": follow_up,
            "status": "draft",
            "notes": "",
        })
    append_to_csv(csv_rows)

    with_roles = sum(1 for c in companies if c.get("has_relevant_role"))
    print(f"\n{'='*50}")
    print(f"DISCOVERY COMPLETE (from file) — Batch: {batch_id}")
    print(f"{'='*50}")
    print(f"  Companies processed: {len(companies)}")
    print(f"  With relevant roles: {with_roles}")
    print(f"  CSV updated:         {DISCOVERY_CSV}")
    print(f"{'='*50}\n")


# --- Main Pipeline ---

def run_discovery(preset_name: str = "", custom_searches: list[str] | None = None,
                  role_keywords: list[str] | None = None, find_emails: bool = False,
                  location: str = "", industry: str = ""):
    """Run the full discovery pipeline."""
    today = date.today().isoformat()

    # Determine search queries
    if preset_name and preset_name in PRESETS:
        preset = PRESETS[preset_name]
        searches = preset["searches"]
        role_kw = preset["role_keywords"]
        print(f"\n[*] Running preset: {preset_name}")
    elif custom_searches:
        searches = custom_searches
        role_kw = role_keywords or ["software engineer", "python", "backend"]
        print(f"\n[*] Running custom search")
    else:
        # Build searches from location/industry
        searches = [f"{location} {industry} companies hiring engineers 2026"]
        role_kw = role_keywords or ["software engineer", "python", "backend"]
        print(f"\n[*] Running search for: {location} {industry}")

    print(f"[*] Role keywords: {', '.join(role_kw)}")

    # Hunter.io setup
    hunter_key = os.environ.get("HUNTER_API_KEY", "")
    if find_emails and not hunter_key:
        print("[!] HUNTER_API_KEY not set. Will use pattern guessing for emails.")
        find_emails = False

    # Load existing domains to skip
    existing = load_existing_domains()
    print(f"[*] Skipping {len(existing)} known domains")

    # Init CSV
    init_csv()

    # Phase 1: Search
    print(f"\n--- Phase 1: Searching ({len(searches)} queries) ---")
    all_search_results = []
    for i, query in enumerate(searches):
        print(f"  [{i+1}/{len(searches)}] {query[:60]}...")
        results = search_duckduckgo(query)
        all_search_results.extend(results)
        print(f"    Found {len(results)} results")
        time.sleep(DELAY_BETWEEN_REQUESTS)

    # Phase 2: Extract & deduplicate companies
    print(f"\n--- Phase 2: Extracting companies ---")
    companies = extract_companies_from_results(all_search_results, existing)

    # Add seed companies for this preset (if not already known)
    if preset_name and preset_name in SEED_COMPANIES:
        for seed in SEED_COMPANIES[preset_name]:
            if seed["domain"] not in existing and not any(c["domain"] == seed["domain"] for c in companies):
                companies.append(dict(seed, snippet=""))
                existing.add(seed["domain"])

    print(f"  Found {len(companies)} unique new companies")

    if not companies:
        print("\n[!] No new companies found. Try different search terms.")
        return []

    # Phase 3: Check careers pages
    print(f"\n--- Phase 3: Checking careers pages ---")
    for i, company in enumerate(companies):
        print(f"  [{i+1}/{len(companies)}] {company['company']} ({company['domain']})")
        careers_info = check_careers_page(company, role_kw)
        company.update(careers_info)
        if careers_info["has_relevant_role"]:
            print(f"    -> Found relevant role! Keywords: {', '.join(careers_info['found_keywords'])}")
        time.sleep(DELAY_BETWEEN_REQUESTS)

    # Phase 4: Find contacts (optional)
    print(f"\n--- Phase 4: Finding contacts ---")
    for company in companies:
        if find_emails and hunter_key:
            contact = find_email_hunter(company["domain"], hunter_key)
            if contact:
                company.update(contact)
                print(f"  [{company['company']}] Found: {contact.get('contact_email', 'none')}")
            else:
                fallback = guess_email_pattern(company["domain"])
                company.update(fallback)
                print(f"  [{company['company']}] No Hunter result, guessed: {fallback['contact_email']}")
            time.sleep(DELAY_BETWEEN_REQUESTS)
        else:
            fallback = guess_email_pattern(company["domain"])
            company.update(fallback)

    # Phase 5: Draft emails
    print(f"\n--- Phase 5: Drafting cold emails ---")
    for company in companies:
        email_draft = draft_cold_email(company, company)
        company["cold_email_draft"] = email_draft

    # Phase 6: Write to CSV
    print(f"\n--- Phase 6: Writing to CSV ---")
    batch_id = get_next_batch_id()
    follow_up = (date.today() + timedelta(days=5)).isoformat()
    csv_rows = []
    for company in companies:
        csv_rows.append({
            "batch_id": batch_id,
            "date_found": today,
            "company": company.get("company", ""),
            "website": company.get("website", ""),
            "location": location or (preset_name or "").replace("-", " "),
            "industry": industry or (preset_name or "").replace("-", " "),
            "careers_url": company.get("careers_url", ""),
            "has_relevant_role": "Yes" if company.get("has_relevant_role") else "No",
            "role_title": "",
            "role_url": "",
            "contact_name": company.get("contact_name", ""),
            "contact_title": company.get("contact_title", ""),
            "contact_email": company.get("contact_email", ""),
            "email_source": company.get("email_source", ""),
            "personalization_hook": company.get("snippet", "")[:150],
            "cold_email_draft": company.get("cold_email_draft", "").replace("\n", " | "),
            "cv_version": "",
            "email_sent": "",
            "applied": "",
            "response": "",
            "follow_up_date": follow_up,
            "status": "draft",
            "notes": "",
        })

    append_to_csv(csv_rows)

    # Summary
    with_roles = sum(1 for c in companies if c.get("has_relevant_role"))
    with_emails = sum(1 for c in companies if c.get("contact_email") and "pattern_guess" not in c.get("email_source", ""))

    print(f"\n{'='*50}")
    print(f"DISCOVERY COMPLETE — Batch: {batch_id}")
    print(f"{'='*50}")
    print(f"  Companies found:     {len(companies)}")
    print(f"  With relevant roles: {with_roles}")
    print(f"  With real emails:    {with_emails}")
    print(f"  CSV updated:         {DISCOVERY_CSV}")
    print(f"\nNext: Review {DISCOVERY_CSV} and send emails manually.")
    print(f"  Attach SWE_v6 for SWE roles, MLE_v5 for ML roles.")
    print(f"  Follow up by:        {follow_up}")
    print(f"{'='*50}\n")

    return csv_rows


# --- CLI ---

def main():
    parser = argparse.ArgumentParser(description="Company Discovery Pipeline")
    parser.add_argument("--preset", choices=list(PRESETS.keys()), help="Use a search preset")
    parser.add_argument("--location", default="", help="Company location (e.g., 'Cambridge UK')")
    parser.add_argument("--industry", default="", help="Industry focus (e.g., 'AI ML')")
    parser.add_argument("--role", default="", help="Role keywords (comma-separated)")
    parser.add_argument("--find-emails", action="store_true", help="Use Hunter.io for email lookup")
    parser.add_argument("--from-file", default="", help="Path to file with companies (one per line: name,website)")
    parser.add_argument("--list-presets", action="store_true", help="List available presets")

    args = parser.parse_args()

    if args.list_presets:
        print("\nAvailable presets:")
        for name, preset in PRESETS.items():
            print(f"  {name}:")
            for s in preset["searches"][:2]:
                print(f"    - {s}")
            print(f"    Keywords: {', '.join(preset['role_keywords'])}")
        return

    # Load companies from file if provided
    if args.from_file:
        companies_from_file = load_companies_from_file(args.from_file)
        if companies_from_file:
            role_kw = args.role.split(",") if args.role else ["software engineer", "python", "backend"]
            run_discovery_from_list(companies_from_file, role_kw, args.find_emails)
            return

    if not args.preset and not args.location:
        parser.print_help()
        print("\nExample: python discover_companies.py --preset cambridge-ai")
        return

    role_keywords = args.role.split(",") if args.role else None

    custom_searches = None
    if args.location and not args.preset:
        custom_searches = [
            f"{args.location} {args.industry} companies hiring engineers 2026",
            f"{args.location} {args.industry} startups Series A B funded",
            f"{args.location} {args.industry} tech companies hiring python",
        ]

    run_discovery(
        preset_name=args.preset,
        custom_searches=custom_searches,
        role_keywords=role_keywords,
        find_emails=args.find_emails,
        location=args.location,
        industry=args.industry,
    )


if __name__ == "__main__":
    main()
