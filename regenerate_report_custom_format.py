from pathlib import Path
from datetime import datetime
import json

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image as RLImage
from PIL import Image, ImageDraw, ImageFont

root = Path(r"C:\Users\Shree\OneDrive\Desktop\Solanki Agencies")
reports = root / "reports"
reports.mkdir(exist_ok=True)
shots = reports / "page_shots"
qr_dir = reports / "qr_export"

# Create architecture image
arch_img = reports / "architecture_diagram.png"
W, H = 1400, 900
img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)

try:
    f_big = ImageFont.truetype("arial.ttf", 42)
    f_mid = ImageFont.truetype("arial.ttf", 30)
    f_sm = ImageFont.truetype("arial.ttf", 24)
except Exception:
    f_big = ImageFont.load_default()
    f_mid = ImageFont.load_default()
    f_sm = ImageFont.load_default()

d.text((W//2 - 220, 40), "System Architecture", fill="black", font=f_big)

boxes = [
    (120, 180, 460, 300, "Frontend\nHTML/CSS/JS\nindex, products, booking"),
    (520, 180, 880, 300, "Express Server\nAPI + Business Logic"),
    (940, 120, 1280, 240, "MySQL\nUsers / Auth Data"),
    (940, 280, 1280, 400, "products.json\nCatalog Data"),
    (940, 440, 1280, 560, "payments.json\nBookings/Payments"),
    (520, 420, 880, 540, "Razorpay\nOrder + Verify"),
    (120, 420, 460, 540, "Railway Deployment\nHosted Production"),
]
for x1,y1,x2,y2,label in boxes:
    d.rectangle((x1,y1,x2,y2), outline="black", width=3)
    lines = label.split("\n")
    yy = y1 + 20
    for ln in lines:
        d.text((x1 + 16, yy), ln, fill="black", font=f_sm)
        yy += 34

# arrows
arrows = [
    ((460,240),(520,240)),
    ((880,220),(940,180)),
    ((880,240),(940,330)),
    ((880,260),(940,490)),
    ((700,300),(700,420)),
    ((460,480),(520,480)),
    ((460,240),(460,480)),
]
for a,b in arrows:
    d.line((a,b), fill="black", width=4)

img.save(arch_img)

out_pdf = reports / "Project_Report_10_to_12_pages.pdf"
out_meta = reports / "project_report_10_12_metadata.json"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="H1", parent=styles["Heading1"], fontSize=16, textColor=colors.black, spaceAfter=8))
styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], fontSize=10.5, leading=15, textColor=colors.black))
styles.add(ParagraphStyle(name="Center", parent=styles["BodyText"], alignment=1, textColor=colors.black, fontSize=10.5))
styles.add(ParagraphStyle(name="TitleBlack", parent=styles["Title"], alignment=1, textColor=colors.black, fontSize=24))

story = []

def add_p(t, s="Body", sp=6):
    story.append(Paragraph(t, styles[s]))
    story.append(Spacer(1, sp))

# Abstract
add_p("Abstract", "H1")
add_p("The Solanki Agencies platform is a Node.js and Express based e-commerce website with a multi-page frontend and API-backed data flow. It provides product discovery, user onboarding, profile management, booking/cart behavior, and payment integration structure.")
add_p("The implementation includes a large-scale product catalog, password reset flow, language and phone-code onboarding, and currency-aware display behavior based on selected country code.")
add_p("Project execution focused on practical business use, iterative refinements, and production deployment verification.")
story.append(PageBreak())

# Introduction
add_p("Introduction", "H1")
add_p("Solanki Agencies required a robust digital storefront to replace static product sharing and improve customer engagement. The new system provides an always-available product experience and structured customer interaction flow.")
add_p("The delivered solution connects a responsive frontend with backend APIs for products, user access, bookings, and payment lifecycle operations.")

# Objectives and Scope
add_p("Objectives and Scope", "H1")
add_p("Project objectives were to build a production-ready commerce website, support secure user workflows, and maintain reliable catalog operations at large scale.")
add_p("Scope included frontend UI delivery, backend endpoint design, feature extensions requested during reviews, and report documentation.")
add_p("Completed scope includes 1079 products, authentication modules, forgot-password flow, and deployment support for production hosting.")

# Requirement Analysis
add_p("Requirement Analysis", "H1")
add_p("Business requirements focused on fast product discovery, reliable buyer interaction flow, and clear digital brand representation for Solanki Agencies.")
add_p("Functional requirements included: secure signup/login, product listing from API, cart and booking support, payment flow readiness, and user history/receipt access.")
add_p("Non-functional requirements included responsiveness, stable hosted access, server-side pricing integrity checks, and scalable catalog rendering for high product volume.")

req_matrix = Table([
    ["Requirement", "Type", "Implementation Status", "Verification"],
    ["Multi-page commerce UI", "Functional", "Implemented", "Manual UI test pass"],
    ["Secure user onboarding/login", "Functional", "Implemented", "Signup/login API pass"],
    ["Forgot password flow", "Functional", "Implemented", "Reset flow validation pass"],
    ["Large product catalog", "Functional", "Implemented", "1079 products loaded"],
    ["Image consistency", "Functional", "Implemented", "One-image mapping checks"],
    ["Currency display by phone code", "Functional", "Implemented", "UI value formatting check"],
    ["Responsive layout", "Non-functional", "Implemented", "Cross-page viewport checks"],
    ["Deployment availability", "Non-functional", "Implemented", "Railway endpoint checks"],
    ["Payment order lifecycle", "Functional", "Partially dependent", "Requires live keys in env"],
], colWidths=[5.1*cm, 2.2*cm, 3.8*cm, 5.2*cm])
req_matrix.setStyle(TableStyle([
    ("GRID", (0,0), (-1,-1), 0.5, colors.black),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 8.5),
    ("TEXTCOLOR", (0,0), (-1,-1), colors.black),
]))
story.append(Spacer(1, 6))
story.append(req_matrix)
story.append(PageBreak())

# System Analysis
add_p("System Analysis and Requirements", "H1")
add_p("Functional requirements included signup/login, product feed APIs, booking/cart actions, payment order flow, and user history support.")
add_p("Non-functional requirements included responsiveness, integrity of server-side totals, stable media rendering, and maintainable code paths for growth.")

# Design and Architecture
add_p("Design and Architecture", "H1")
add_p("The architecture follows a layered model with static frontend pages, Express API services, data persistence resources, and hosted deployment operations.")
if arch_img.exists():
    story.append(RLImage(str(arch_img), width=16*cm, height=10*cm))
    story.append(Spacer(1, 8))
add_p("Architecture figure shows frontend interaction with the API layer, catalog and user data resources, and payment/deployment boundaries.")
story.append(PageBreak())

# Implementation Details with page images
add_p("Implementation Details", "H1")
add_p("Implementation includes auth enhancements, large-catalog rendering support, and feature-level updates requested during iterative review cycles.")
add_p("Below are actual page visuals from the deployed project structure.")

page_imgs = [
    shots / "index_page.png",
    shots / "products_page.png",
    shots / "about_page.png",
    shots / "why_page.png",
]
existing_page_imgs = [p for p in page_imgs if p.exists()]
rows = []
row = []
for p in existing_page_imgs:
    row.append(RLImage(str(p), width=7.5*cm, height=4.6*cm))
    if len(row) == 2:
        rows.append(row)
        row = []
if row:
    row.append(Spacer(1,1))
    rows.append(row)
if rows:
    tbl = Table(rows, colWidths=[8*cm,8*cm])
    tbl.setStyle(TableStyle([
        ("BOX", (0,0), (-1,-1), 0.5, colors.black),
        ("INNERGRID", (0,0), (-1,-1), 0.5, colors.black),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8))

add_p("Feature-level implementation also includes language preference, country code with phone fields, and currency-aware value formatting in frontend display logic.")
story.append(PageBreak())

add_p("Implementation Module Breakdown", "H1")
add_p("Backend module implementation includes user endpoints, products API, booking endpoints, payment create/verify handlers, and profile/session utilities. Each module uses request validation and structured error responses.")
add_p("Frontend module implementation includes auth flow handlers, product rendering pipeline, cart/booking interactions, payment page flow, and history/receipt user journey.")
impl_table = Table([
    ["Module", "Key File", "Delivered Capability"],
    ["Authentication", "server.js + script.js", "Signup/login/logout, forgot password, session profile"],
    ["Catalog", "products.json + script.js", "Dynamic product loading, filtering, image mapping"],
    ["Booking", "booking.html + server.js", "Cart checkout initiation and order data preparation"],
    ["Payment", "server.js payment routes", "Config check, order create, verify, receipt retrieval"],
    ["Deployment", "Railway env + APIs", "Hosted app access and runtime checks"],
], colWidths=[3.6*cm, 4.6*cm, 7.9*cm])
impl_table.setStyle(TableStyle([
    ("GRID", (0,0), (-1,-1), 0.5, colors.black),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("TEXTCOLOR", (0,0), (-1,-1), colors.black),
]))
story.append(Spacer(1, 6))
story.append(impl_table)
story.append(PageBreak())

add_p("API Endpoint Catalog", "H1")
add_p("The API layer is organized for authentication, products, bookings, and payment lifecycle. The endpoint index below is included for implementation traceability.")
api_table = Table([
    ["Endpoint", "Method", "Purpose"],
    ["/api/products", "GET", "Fetch product catalog for product page rendering"],
    ["/api/auth/signup", "POST", "Create user with profile fields"],
    ["/api/auth/login", "POST", "Authenticate user and issue token/session"],
    ["/api/auth/forgot-password", "POST", "Generate password reset workflow"],
    ["/api/auth/reset-password", "POST", "Complete password reset"],
    ["/api/payment/config", "GET", "Check payment gateway readiness"],
    ["/api/payment/create-order", "POST", "Create Razorpay order from validated cart"],
    ["/api/payment/verify", "POST", "Verify payment signature and finalize"],
    ["/api/payment/receipt/:orderId", "GET", "Return receipt data for completed payment"],
], colWidths=[6.2*cm, 2.1*cm, 7.8*cm])
api_table.setStyle(TableStyle([
    ("GRID", (0,0), (-1,-1), 0.5, colors.black),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 8.6),
    ("TEXTCOLOR", (0,0), (-1,-1), colors.black),
]))
story.append(Spacer(1, 6))
story.append(api_table)
story.append(PageBreak())

# Testing
add_p("Testing and QA Results", "H1")
add_p("Testing validated key pages, API response behavior, authentication persistence, and catalog render consistency.")
qa = Table([
    ["Validation Area", "Status", "Observation"],
    ["Core Pages", "PASS", "Primary pages accessible and rendering"],
    ["Product Catalog Feed", "PASS", "High-volume product data loaded"],
    ["Authentication and Reset Flow", "PASS", "Login/signup/reset flows validated"],
    ["Currency and Profile Fields", "PASS", "Field storage and UI mapping observed"],
    ["Payment Configuration", "INFO", "Depends on environment key setup"],
], colWidths=[6*cm,2.2*cm,6.3*cm])
qa.setStyle(TableStyle([
    ("GRID", (0,0), (-1,-1), 0.5, colors.black),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("TEXTCOLOR", (0,0), (-1,-1), colors.black),
    ("FONTSIZE", (0,0), (-1,-1), 9),
]))
story.append(qa)
story.append(PageBreak())

add_p("Detailed Test Scenarios", "H1")
test_table = Table([
    ["Scenario", "Input", "Expected Output", "Status"],
    ["User signup with phone code", "Valid profile data", "User created and profile persisted", "PASS"],
    ["User login", "Valid credentials", "Session/token returned", "PASS"],
    ["Forgot password", "Registered email", "Reset route flow generated", "PASS"],
    ["Product feed load", "Open products page", "Catalog renders with images", "PASS"],
    ["Currency formatting", "Select country code", "Display currency updates", "PASS"],
    ["Create payment order", "Valid cart payload", "Order id generated", "INFO"],
    ["Verify payment", "Gateway callback payload", "Signature check and finalize", "INFO"],
], colWidths=[4.4*cm, 3.6*cm, 6.2*cm, 2.0*cm])
test_table.setStyle(TableStyle([
    ("GRID", (0,0), (-1,-1), 0.5, colors.black),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 8.6),
    ("TEXTCOLOR", (0,0), (-1,-1), colors.black),
]))
story.append(Spacer(1, 6))
story.append(test_table)
story.append(PageBreak())

# Deployment
add_p("Deployment and Operations", "H1")
add_p("Deployment was managed on Railway with iterative release checks and runtime verification across core pages and APIs.")
add_p("Operational continuity was maintained through repeated deployment validation and environment configuration updates for production readiness.")

# Add screenshot requested by user in deployment section
deployment_shot = reports / "Screenshot 2026-04-18 125214.png"
if deployment_shot.exists():
    add_p("Deployment Screenshot", "H1")
    story.append(RLImage(str(deployment_shot), width=16*cm, height=9*cm))
    story.append(Spacer(1, 8))

# Add QR codes in deployment section
add_p("Deployment QR Codes", "H1")
qr_imgs = sorted(qr_dir.glob("qr_page_*.png")) if qr_dir.exists() else []
if qr_imgs:
    qrows = []
    qrow = []
    for p in qr_imgs[:4]:
        qrow.append(RLImage(str(p), width=6.8*cm, height=6.8*cm))
        if len(qrow) == 2:
            qrows.append(qrow)
            qrow = []
    if qrow:
        qrow.append(Spacer(1,1))
        qrows.append(qrow)
    qtbl = Table(qrows, colWidths=[8*cm,8*cm])
    qtbl.setStyle(TableStyle([
        ("BOX", (0,0), (-1,-1), 0.5, colors.black),
        ("INNERGRID", (0,0), (-1,-1), 0.5, colors.black),
    ]))
    story.append(qtbl)
else:
    add_p("QR images not available.")
story.append(PageBreak())

add_p("Deployment Verification Checklist", "H1")
add_p("1. Core site pages are reachable from hosted URL and respond with success status.")
add_p("2. Product feed endpoint returns full catalog and image links resolve correctly.")
add_p("3. Signup/login workflows operate and profile fields are preserved.")
add_p("4. Environment variables for payment keys are configured before final live transactions.")
add_p("5. Deployment rollback/retry plan is available for transient platform issues.")
add_p("6. Post-release smoke test is executed after every production deployment.")

# Limitations (no resolutions)
add_p("Limitations", "H1")
add_p("Some deployment attempts faced transient network or provider-side instability, causing occasional retries.")
add_p("Catalog visual consistency for all products may still need periodic manual review due the scale of source media variation.")
add_p("Full payment production flow requires final environment configuration confirmation for gateway credentials.")

# Future Scope
add_p("Future Scope", "H1")
add_p("Planned extensions include webhook-based payment reconciliation, inventory synchronization, and advanced analytics for conversion tracking.")
add_p("Future releases can add richer search/filtering and SEO-focused product content optimization for wider customer reach.")

# Different heading instead of conclusion
add_p("Project Outcome", "H1")
add_p("The project delivered a functional and scalable e-commerce foundation for Solanki Agencies, combining catalog depth, feature evolution, and deployment-backed usability.")
add_p("The platform is ready for continued business use and phased enhancement through structured feature increments.")
story.append(PageBreak())

# Build

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.black)
    canvas.drawString(2*cm, 1.3*cm, "Solanki Agencies - Project Report")
    canvas.drawRightString(19.5*cm, 1.3*cm, f"Page {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(str(out_pdf), pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
doc.build(story, onFirstPage=footer, onLaterPages=footer)

from PyPDF2 import PdfReader
page_count = len(PdfReader(str(out_pdf)).pages)

meta = {
    "title": "Solanki Agencies Project Report",
    "generated_at": datetime.now().isoformat(timespec="seconds"),
    "page_count": page_count,
    "file": str(out_pdf),
    "headings_without_chapter_numbers": True,
    "first_two_pages_removed": True,
    "acknowledgement_removed": True,
    "toc_removed": True,
    "black_text_only": True,
    "requirement_analysis_added": True,
    "architecture_image_added": arch_img.exists(),
    "deployment_screenshot_added": deployment_shot.exists(),
    "deployment_qr_added": len(qr_imgs) > 0,
    "implementation_page_images": [p.name for p in existing_page_imgs],
    "limitations_section_used": True,
    "future_scope_heading_used": True,
    "project_outcome_heading_used": True
}
out_meta.write_text(json.dumps(meta, indent=2), encoding="utf-8")

print(f"PDF_PATH={out_pdf}")
print(f"PAGE_COUNT={page_count}")
print(f"METADATA_PATH={out_meta}")
print(f"PAGE_IMAGES={','.join([p.name for p in existing_page_imgs])}")
print(f"ARCH_IMAGE={arch_img.exists()}")
