import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const text = html.replace(/&amp;/g, "&").replace(/&mdash;/g, "-").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

test("preserves the resume and LinkedIn content except the requested education marks", () => {
  const requiredContent = [
    "Abhishek Ranjan", "Cloud & AI Engineer", "LTM", "LTIMindtree",
    "DEC 2025 - PRESENT", "SEP 2025 - DEC 2025", "Graduate Engineer Trainee",
    "Bengaluru", "Bhubaneswar", "Hybrid", "AI/ML", "Microsoft Power Platform",
    "Cloud Fundamentals", "Networking", "Windows Administration", "PowerShell",
    "Scoping Assistant", "questionnaire", "Scope Confirmation Document", "OneDrive",
    "PG Finder", "paying guest", "Property management", "search functionality",
    "Java", "Python", "SQL", "JavaScript", "Generative AI", "Agentic AI",
    "AI Agents", "LLMs", "RAG", "Microsoft Copilot Studio", "Azure AI",
    "Azure AI Search", "Azure OpenAI", "Power Automate", "Dataverse",
    "HTML", "CSS", "React", "JSP", "Servlet", "JDBC", "Spring Boot",
    "REST APIs", "MySQL", "Git", "GitHub", "VS Code",
    "Claude Certified Developer", "Claude Certified Associate", "Foundations",
    "Microsoft Certified: Azure AI Apps and Agents Developer Associate",
    "Microsoft Certified: Azure AI Fundamentals", "400+", "LeetCode",
    "GeeksforGeeks", "Round 1", "TCS CodeVita Season 12", "Hacktoberfest 2022",
    "90%+", "capstone assessments", "B.Tech, Computer Science & Engineering",
    "ABES Engineering College", "2021 - 2025", "Ghaziabad",
    "Higher Secondary", "UP BOARD", "Siksha Niketan Inter College",
    "Obra, Sonbhadra, Uttar Pradesh",
    "abhishekranjan7390@gmail.com", "+91 7007218416",
  ];
  for (const item of requiredContent) {
    assert.ok(text.includes(item), `Missing source content: ${item}`);
  }
});

test("preserves every original public credential and profile link", () => {
  const links = [
    "https://www.linkedin.com/in/abhishek-ranjan-3573b122a/",
    "https://leetcode.com/u/Abhiranjan73/",
    "https://www.geeksforgeeks.org/profile/abhishekranjan7390",
    "https://github.com/Abhiranjan0/PG-Finder",
    "https://www.credly.com/badges/445bbee7-1dc3-4365-90ec-552c4b98eb6a",
    "https://www.credly.com/badges/81de4763-fda4-4903-a2f0-f34acaf8536e/public_url",
    "https://learn.microsoft.com/en-in/users/abhishekranjan-1499/credentials/16e3104b53bdd454?ref=https%3A%2F%2Fwww.linkedin.com%2F",
    "https://learn.microsoft.com/en-us/users/abhishekranjan-1499/credentials/23514e5bfc45cbb6",
  ];
  for (const link of links) assert.ok(html.includes(`href="${link}"`), `Missing source link: ${link}`);
  assert.ok(!html.includes("jobid=1234"), "LinkedIn export tracking parameters must not be published");
});

test("all navigation anchors and project controls have unique, existing targets", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "Duplicate HTML IDs");
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Missing anchor or SVG target: ${target}`);
  }
  for (const [, target] of html.matchAll(/data-project="([^"]+)"/g)) {
    assert.ok(html.includes(`<template id="${target}"`), `Missing project details: ${target}`);
  }
  assert.equal([...html.matchAll(/class="project-card"/g)].length, 2);
  assert.equal([...html.matchAll(/class="credential-card"/g)].length, 4);
});

test("external links are safe and contact actions use real contact details", () => {
  for (const [anchor] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.ok(anchor.includes('rel="noopener noreferrer"'), anchor);
  }
  assert.ok(html.includes('href="mailto:abhishekranjan7390@gmail.com"'));
  assert.ok(html.includes('href="tel:+917007218416"'));
  assert.ok(!/<a\b[^>]*href="#"/.test(html), "Placeholder links are not allowed");
  assert.ok(!html.includes("<form"), "Contact must not pretend to submit without a backend");
});

test("every resume action opens the exact supplied Google Drive link", () => {
  const resumeUrl = "https://drive.google.com/file/d/1dpnUHfmaN6hP2zCp7i9EiQE7_NdLQF8q/view?usp=sharing";
  const resumeLinks = [...html.matchAll(/<a\b[^>]*\bdata-resume\b[^>]*>/g)];
  assert.ok(resumeLinks.length >= 2, "Resume should be accessible from the hero and contact section");
  for (const [anchor] of resumeLinks) {
    assert.ok(anchor.includes(`href="${resumeUrl}"`), anchor);
    assert.ok(anchor.includes('target="_blank"'), anchor);
    assert.ok(anchor.includes('rel="noopener noreferrer"'), anchor);
    assert.ok(!/\bdownload\b/.test(anchor), "Cross-origin view links must not claim to download");
  }
  assert.ok(!html.includes("Abhishek_Ranjan_CV.pdf"), "No stale local resume links");
});

test("education details are retained without marks, percentages, or hidden grade badges", () => {
  const education = html.match(/<section\b[^>]*id="education"[\s\S]*?<\/section>/)[0];
  assert.ok(!/CGPA|7\.11|74%|class="grade"|percentage|score/i.test(education));
  assert.equal([...education.matchAll(/class="education-card"/g)].length, 2);
  assert.ok(education.includes("ABES Engineering College"));
  assert.ok(education.includes("Siksha Niketan Inter College"));
  assert.ok(text.includes("90%+"), "Professional training achievement should remain");
});

test("the superseded local resume is no longer a published asset", async () => {
  await assert.rejects(access(new URL("../public/Abhishek_Ranjan_CV.pdf", import.meta.url)), { code: "ENOENT" });
  const ignored = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
  assert.ok(ignored.includes("/Abhishek_Ranjan_CV.pdf"), "Keep the source resume local when sharing the code");
});

test("dark is the first-visit theme, including blocked or invalid browser storage", () => {
  assert.ok(html.includes('<html lang="en" data-theme="dark">'));
  assert.ok(html.includes('<meta name="theme-color" content="#10110f">'));
  const bootstrap = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  for (const stored of [null, "dark", "light", "invalid", "blocked"]) {
    const document = {
      documentElement: { dataset: { theme: "dark" } },
      querySelector: () => metadata,
    };
    const metadata = { content: "#10110f" };
    const warnings = [];
    runInNewContext(bootstrap, {
      document,
      localStorage: {
        getItem: () => {
          if (stored === "blocked") throw new Error("Storage is blocked");
          return stored;
        },
      },
      console: { warn: (...args) => warnings.push(args) },
    });
    assert.equal(document.documentElement.dataset.theme, stored === "light" ? "light" : "dark");
    assert.equal(metadata.content, stored === "light" ? "#f6f5f0" : "#10110f");
    assert.equal(warnings.length, stored === "blocked" ? 1 : 0);
  }
});

test("interactive toolkit has three labeled, keyboard-operable choices and a motion control", () => {
  const controls = [...html.matchAll(/<button\b[^>]*\bdata-focus="([^"]+)"[^>]*>/g)];
  assert.equal(controls.length, 3);
  for (const [control] of controls) {
    assert.ok(control.includes('aria-controls="focus-readout"'));
    assert.ok(control.includes("aria-pressed="));
    assert.ok(control.includes("data-focus-title="));
    assert.ok(control.includes("data-focus-description="));
  }
  assert.ok(html.includes('id="focus-readout"'));
  assert.ok(html.includes('id="motion-toggle"'));
});

test("page metadata is valid and grounded in the supplied identity", () => {
  const structuredData = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(structuredData.name, "Abhishek Ranjan");
  assert.equal(structuredData.worksFor.name, "LTM");
  assert.equal(structuredData.address.addressLocality, "Bengaluru");
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('lang="en"'));
  assert.ok(html.includes('name="viewport"'));
});

test("styles support reduced motion and locally hosted typography", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes('[hidden] { display: none !important; }'));
  assert.ok(css.includes(":focus-visible"));
  const font = await readFile(new URL("../public/fonts/Manrope-Variable.ttf", import.meta.url));
  assert.ok(font.byteLength > 1000);
  const license = await readFile(new URL("../public/fonts/OFL.txt", import.meta.url), "utf8");
  assert.ok(license.includes("SIL OPEN FONT LICENSE"));
});
