import json
import os
from urllib.parse import quote

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://127.0.0.1:4173/index.html")
CHROME = os.environ.get(
    "CHROME_EXECUTABLE",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
)

checks = []
browser_errors = []


def check(name, condition, detail=""):
    checks.append({"name": name, "passed": bool(condition), "detail": detail})


def open_route(page, route):
    page.goto(f"{BASE_URL}#/{route}", wait_until="networkidle")
    page.locator("main[data-route]").wait_for()


def no_overflow(page):
    result = page.evaluate(
        """() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        })"""
    )
    return result["scrollWidth"] <= result["innerWidth"] + 1, result


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=CHROME)
    try:
        desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
        desktop.on(
            "console",
            lambda message: browser_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        desktop.on("pageerror", lambda error: browser_errors.append(str(error)))

        open_route(desktop, "home")
        counts = desktop.evaluate(
            """() => Object.fromEntries(
              ["orientation", "core", "advanced", "reference", "lab", "workbook"]
                .map(layer => [layer, window.LEARNING_ARTICLES.filter(item => item.layer === layer).length])
            )"""
        )
        check("35 formal units", sum(counts.values()) == 35, counts)
        check(
            "layer counts",
            counts
            == {
                "orientation": 3,
                "core": 16,
                "advanced": 8,
                "reference": 5,
                "lab": 2,
                "workbook": 1,
            },
            counts,
        )
        check("five direct core modules", desktop.locator(".novice-route-link").count() == 5)
        check(
            "learning route is direct",
            desktop.get_by_role("link", name="直接查看学习路线").get_attribute("href")
            == f"#/read/{quote('00-课程入口/01-学习路径与交付物.md', safe='')}",
        )
        overflow, detail = no_overflow(desktop)
        check("desktop home has no overflow", overflow, detail)

        for index in range(5):
            open_route(desktop, "home")
            desktop.locator(".novice-route-link").nth(index).click()
            desktop.locator('main[data-route="reader"]').wait_for()
            check(
                f"core module {index + 1} opens reader",
                "#/read/" in desktop.url,
                desktop.url,
            )

        open_route(desktop, "directory")
        core_section = desktop.locator('[aria-labelledby="core-course-title"]')
        check(
            "directory has 16 core lessons",
            core_section.locator(".directory-article-list li").count() == 16,
        )
        advanced = desktop.locator("details.full-directory").nth(0)
        advanced.locator("summary").click()
        check(
            "directory has 8 advanced lessons",
            advanced.locator(".directory-article-list li").count() == 8,
        )

        open_route(
            desktop,
            f"read/{quote('01-AI基础认知/01-AI到底改变了什么.md', safe='')}",
        )
        check(
            "core reader order",
            desktop.locator(".reader-kicker").inner_text() == "核心课第 1 / 16 节",
        )
        check(
            "optional practice is collapsed",
            desktop.locator(".reading-practice").get_attribute("open") is None,
        )

        open_route(
            desktop,
            f"read/{quote('03-高频场景实战/01-用AI做资料研究完整案例.md', safe='')}",
        )
        check("markdown tables render", desktop.locator(".markdown-body table").count() >= 1)

        open_route(
            desktop,
            f"read/{quote('00-课程入口/01-学习路径与交付物.md', safe='')}",
        )
        desktop.get_by_role(
            "link", name="AI 不是答案机器：它先给你一个候选"
        ).click()
        desktop.locator('main[data-route="reader"]').wait_for()
        check(
            "relative article link works",
            desktop.locator(".reader-heading h1").inner_text()
            == "AI 不是答案机器：它先给你一个候选",
        )

        open_route(desktop, "reference")
        check(
            "search starts with 35 formal units",
            "35" in desktop.locator("#search-summary").inner_text(),
        )
        desktop.locator("#reference-search").fill("Harness")
        check(
            "search finds Harness",
            desktop.locator(".reference-card", has_text="Harness").count() >= 1,
        )

        open_route(desktop, "learn/first-task")
        check("six-grid task card", desktop.locator("#boundaries-text").count() == 1)
        desktop.locator("#fill-example").click()
        desktop.locator("#check-task-card").click()
        desktop.locator("#feedback-summary").wait_for()
        check(
            "task example passes seven checks",
            desktop.locator("#feedback-summary li").count() == 7
            and "这一步已满足规则"
            in desktop.locator("#feedback-summary").inner_text(),
        )

        asset_response = desktop.request.get(
            BASE_URL.rsplit("/", 1)[0] + "/assets/aigc/aigc-workflow-sample.png"
        )
        check("image asset loads", asset_response.ok, asset_response.status)

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.on(
            "console",
            lambda message: browser_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        mobile.on("pageerror", lambda error: browser_errors.append(str(error)))
        for route in ["home", "directory", "learn/first-task"]:
            open_route(mobile, route)
            overflow, detail = no_overflow(mobile)
            check(f"mobile {route} has no overflow", overflow, detail)
        open_route(mobile, "home")
        check("mobile has five direct core modules", mobile.locator(".novice-route-link").count() == 5)
    finally:
        browser.close()

check("no browser errors", not browser_errors, browser_errors)
failed = [item for item in checks if not item["passed"]]
result = {
    "status": "pass" if not failed else "fail",
    "summary": {
        "total": len(checks),
        "passed": len(checks) - len(failed),
        "failed": len(failed),
    },
    "checks": checks,
    "browserErrors": browser_errors,
}
print(json.dumps(result, ensure_ascii=False, indent=2))
if failed:
    raise SystemExit(1)
