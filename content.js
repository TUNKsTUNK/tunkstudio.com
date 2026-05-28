/* =========================================================================
   TUNK STUDIO — content.js
   ----------------------------------------------------------------------
   This file holds ALL the editable content for the website.
   Edit it through admin.html (recommended), or by hand if you prefer.

   When you publish a new version of the site, just upload this file
   next to index.html. Nothing else needs to change.
   ========================================================================= */

window.TUNK_DEFAULT_CONTENT = {
  hero: {
    title: "Architecture,\ninstallation & design.\nIstanbul.",
    intro1: "TUNK is a studio for architecture, installation and design, based in Istanbul. The work moves between retail interiors, exhibitions and installations.",
    intro2: "Founded in 2019. Recent commissions for retail clients in Istanbul and Berlin, and exhibition design for two institutions.",
    stats: [
      "EST · 2019",
      "BUILT · 24 PROJECTS",
      "STAFF · 6",
      "EXHIBITED · ARTER · SALT · KANYON"
    ]
  },

  about: {
    heading: "A studio for architecture, installation & design.",
    p1: "TUNK was founded in Istanbul in 2019. The studio works between architecture, exhibition design and installation, with a particular interest in retail interiors and spatial installations.",
    p2: "Each project begins with a survey of what is already there — structure, light, materials in use — before any new gesture is proposed. The work tries to use as few materials as possible, deployed precisely. Where colour appears, it is bound to a real material in the project — red plexiglass, blue glass, brass — never applied as decoration.",
    team: [
      { name: "Defne Aksu",     role: "Founding partner · architecture" },
      { name: "Ekin Tunç",      role: "Founding partner · spatial design" },
      { name: "Mert Özbek",     role: "Senior architect" },
      { name: "Naz Kalender",   role: "Designer" },
      { name: "Sinan Demir",    role: "Project manager" },
      { name: "Yağmur Polat",   role: "Studio coordinator" }
    ],
    clients: [
      "Arter", "Salt Beyoğlu", "Kanyon",
      "Vakko", "Mavi", "Yapı Kredi",
      "Domus Türkiye", "Atelier Brut", "İKSV"
    ]
  },

  contact: {
    address: "Karaköy\nIstanbul · 34425\nTürkiye",
    phone: "+90 212 000 0000",
    email: "HELLO@TUNK.STUDIO",
    pressEmail: "PRESS@TUNK.STUDIO"
  },

  footer: {
    tagline: "Architecture · Installation · Design",
    location: "Karaköy, Istanbul, TR",
    instagram: "Instagram →"
  },

  projects: [
    {
      id: "PRJ-024", slug: "karakoy-cosmetics",
      name: "Karaköy Cosmetics", kind: "Retail Interior",
      year: 2024, location: "Istanbul", area: "84 m²",
      materials: ["Red plexiglass", "Brushed steel", "Oak", "Existing concrete"],
      accent: "red-plexi",
      summary: "A 84-square-metre cosmetics shop in Karaköy. The interior is built from three materials — red plexiglass, brushed steel, oak — set against existing concrete.",
      photos: 12,
      tags: ["Retail", "Interior"]
    },
    {
      id: "PRJ-031", slug: "arter-membrane",
      name: "Arter — Membrane", kind: "Exhibition",
      year: 2024, location: "Istanbul", area: "420 m²",
      materials: ["Blue glass", "Steel mesh", "Concrete"],
      accent: "blue-glass",
      summary: "Exhibition design for Membrane, a group show on threshold and porosity. Three rooms of cobalt-tinted glass partitions, suspended from existing structure.",
      photos: 18,
      tags: ["Exhibition", "Installation"]
    },
    {
      id: "PRJ-019", slug: "beyoglu-apartment",
      name: "Beyoğlu Apartment", kind: "Residential",
      year: 2023, location: "Istanbul", area: "142 m²",
      materials: ["Lime plaster", "Oak", "Brass"],
      accent: null,
      summary: "A renovation of a 1930s flat in Beyoğlu. Existing parquet retained; new partitions in lime plaster; a single brass threshold marks the boundary between public and private.",
      photos: 9,
      tags: ["Residential", "Interior"]
    },
    {
      id: "PRJ-027", slug: "tobacco-warehouse",
      name: "Tobacco Warehouse", kind: "Adaptive Reuse",
      year: 2024, location: "Izmir", area: "1,240 m²",
      materials: ["Reclaimed timber", "Steel", "Glass"],
      accent: "amber",
      summary: "Adaptive reuse of a 1920s tobacco warehouse for a publishing studio and event space. Existing iron columns left in place; new mezzanine floats clear of historic walls.",
      photos: 22,
      tags: ["Adaptive Reuse", "Cultural"]
    },
    {
      id: "PRJ-022", slug: "kanyon-installation",
      name: "Kanyon — Volume", kind: "Installation",
      year: 2023, location: "Istanbul", area: "60 m²",
      materials: ["Anodised aluminium", "LED"],
      accent: null,
      summary: "A temporary installation in the Kanyon atrium. 1,400 anodised aluminium fins, suspended on monofilament, indexing daylight through the void.",
      photos: 14,
      tags: ["Installation", "Public"]
    },
    {
      id: "PRJ-018", slug: "fener-bookshop",
      name: "Fener Bookshop", kind: "Retail Interior",
      year: 2023, location: "Istanbul", area: "54 m²",
      materials: ["Birch ply", "Mild steel", "Glass"],
      accent: null,
      summary: "A small bookshop on a sloping street in Fener. The shelving steps with the floor; a single steel ladder unifies the wall.",
      photos: 8,
      tags: ["Retail", "Interior"]
    }
  ]
};

/* -------------------------------------------------------------------------
   Helpers used by index.html and admin.html.
   Local edits made via admin.html are stored in the browser (localStorage)
   under "tunk_content". The published site uses whatever defaults are in
   this file. To make local edits permanent: download a new content.js from
   admin.html → Publish, and upload it to your host.
   ------------------------------------------------------------------------- */
window.TUNK_GET_CONTENT = function () {
  var d = window.TUNK_DEFAULT_CONTENT;
  try {
    var saved = JSON.parse(localStorage.getItem("tunk_content") || "null");
    if (!saved) return d;
    return {
      hero:     Object.assign({}, d.hero,     saved.hero     || {}),
      about:    Object.assign({}, d.about,    saved.about    || {}),
      contact:  Object.assign({}, d.contact,  saved.contact  || {}),
      footer:   Object.assign({}, d.footer,   saved.footer   || {}),
      projects: saved.projects || d.projects
    };
  } catch (e) { return d; }
};

window.TUNK_SAVE_CONTENT = function (content) {
  localStorage.setItem("tunk_content", JSON.stringify(content));
};

window.TUNK_CLEAR_CONTENT = function () {
  localStorage.removeItem("tunk_content");
};
