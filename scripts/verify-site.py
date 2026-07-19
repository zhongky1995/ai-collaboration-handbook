import json
import sys
from urllib.parse import quote

from playwright.sync_api import sync_playwright


BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173/"
checks = []
browser_errors = []


def check(name, condition, detail=""):
    checks.append({"name": name, "passed": bool(condition), "detail": detail})
    if not condition:
        raise AssertionError(f"{name}: {detail}")


def attach_error_logging(page, view):
    page.on(
        "console",
        lambda message: browser_errors.append({"view": view, "type": "console", "text": message.text})
        if message.type == "error"
        else None,
    )
    page.on("pageerror", lambda error: browser_errors.append({"view": view, "type": "pageerror", "text": str(error)}))


def wait_ready(page):
    page.wait_for_load_state("networkidle")
    page.wait_for_selector("#app .topbar")


def no_overflow(page, name):
    values = page.evaluate(
        """() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth })"""
    )
    check(name, values["width"] <= values["viewport"] + 1, json.dumps(values, ensure_ascii=False))


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel="chrome", headless=True)

    desktop = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = desktop.new_page()
    attach_error_logging(page, "desktop")
    page.goto(BASE_URL)
    wait_ready(page)

    check("reading-first home", "从理解 AI 开始" in page.locator(".home-hero h1").inner_text())
    check("68 generated articles", page.evaluate("window.LEARNING_ARTICLES.length") == 68)
    check("single primary action", page.locator("[data-primary-cta]").count() == 1)
    check("no task pressure on first screen", "必须打卡" in page.locator(".home-hero").inner_text())
    no_overflow(page, "desktop home has no overflow")

    page.locator("[data-primary-cta]").click()
    page.wait_for_selector(".reader-article")
    check("first article opens", page.locator(".reader-heading h1").inner_text() == "AI 到底改变了什么")
    check("optional practice collapsed", page.locator(".reading-practice").get_attribute("open") is None)

    image_path = "04-AIGC与多模态创作/05-示例生成一张AIGC工作流配图.md"
    page.goto(f"{BASE_URL}#/read/{quote(image_path, safe='')}")
    wait_ready(page)
    image = page.locator(".article-figure img")
    image.wait_for(state="visible")
    check("AIGC image loads", image.evaluate("node => node.complete && node.naturalWidth > 0"))

    page.goto(f"{BASE_URL}#/read/{quote('09-Agent与Harness工程/01-从Prompt到Harness工程.md', safe='')}")
    wait_ready(page)
    check("harness article opens", page.locator(".reader-heading h1").inner_text() == "从 Prompt 到 Harness 工程")
    check("tables render as tables", page.locator(".markdown-body table").count() >= 1)

    page.goto(f"{BASE_URL}#/reference")
    wait_ready(page)
    page.locator("#reference-search").fill("Harness")
    page.wait_for_timeout(200)
    check("search finds Harness", page.locator(".reference-card", has_text="Harness").count() >= 1)
    desktop.close()

    mobile = browser.new_context(viewport={"width": 390, "height": 844})
    mobile_page = mobile.new_page()
    attach_error_logging(mobile_page, "mobile")
    mobile_page.goto(BASE_URL)
    wait_ready(mobile_page)
    no_overflow(mobile_page, "mobile home has no overflow")

    mobile_page.locator("[data-primary-cta]").click()
    mobile_page.wait_for_selector(".reader-article")
    article_box = mobile_page.locator(".reader-article").bounding_box()
    side_box = mobile_page.locator(".reader-side").bounding_box()
    check(
        "mobile article comes before support navigation",
        article_box is not None and side_box is not None and article_box["y"] < side_box["y"],
        json.dumps({"article": article_box, "side": side_box}, ensure_ascii=False),
    )
    no_overflow(mobile_page, "mobile reader has no overflow")
    mobile.close()
    browser.close()

check("no browser errors", not browser_errors, json.dumps(browser_errors, ensure_ascii=False))
print(json.dumps({"status": "pass", "checks": checks, "browserErrors": browser_errors}, ensure_ascii=False, indent=2))

