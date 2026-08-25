// Shared placeholder copy used until each project gets its real write-up —
// kept as constants (instead of repeating the string 14 times) so swapping
// in real copy later is a one-line-per-project change, and the "for now"
// paragraph text only needs to be written once.
const PLACEHOLDER_DESCRIPTION = "A closer look at the process, thinking, and execution behind this project.";
const PLACEHOLDER_DETAILS = "This case study is still being written up, so consider this paragraph a stand-in for now. The full breakdown will cover the brief, the process behind the decisions, and the outcomes once everything is documented, but in the meantime this placeholder copy is here so the layout can be previewed with real paragraph-length text instead of a single short line.";

const projects = [
  {
    id: 1,
    title: "Google Developer Groups on Campus",
    category: "Leadership",
    tags: ["leadership"],
    year: "2026",
    description: "Three years with Google Developer Groups on Campus PLM — from Social Media Googler to Chief Creative Officer to Chief Executive Officer — building a 350+ member tech community through campaigns, study jams, and a campus-wide hackathon.",
    technologies: ["Notion", "Figma", "Google Workspace", "Adobe Photoshop", "Gemini"],
    image: "works/GDG/DJI_0870 - Trim.mp4",
    images: ["works/GDG/DJI_0870 - Trim.mp4", "works/GDG/DSC_0661.JPG", "works/GDG/_DSC0507.JPG"],
    details: "My three-year journey with GDGoC PLM began as a Social Media Googler, then Chief Creative Officer, and finally Chief Executive Officer — each stage widening the scope of what I led. As Chief Creative Officer, I ran the creatives team behind onsite activations like the freshmen welcoming booth and InnOlympics 2025.\n\nAs CEO, I oversaw all five departments (Operations, Technology, Creatives, Community Development, and Finance) and spearheaded the chapter's 5th anniversary General Assembly, drawing over 200 attendees and a fireside chat panel I sat on personally. The term's centerpiece was InnOlympics 2026, a two-day multi-campus hackathon I served as Event Director for, overseeing event flow and Google Cloud Platform credit distribution for participating teams.\n\nDuring my CEO term the chapter hosted 13 events, conducted 85 internal meetings, and partnered with organizations like Philippine Startup Week, Notion Campus Leaders, Zuitt, and Datacamp — work that helped earn GDGoC PLM recognition as Most Outstanding Non-academic Organization and CISTM Outstanding Organization, alongside an unqualified audit opinion for the term.",
    achievements: [
      "Hosted 13 events and conducted 85 internal meetings during my CEO term, growing membership past 350",
      "Served as Event Director for InnOlympics 2026, a 2-day multi-campus hackathon",
      "Spearheaded the chapter's 5th anniversary General Assembly (200+ attendees) and sat on its fireside chat panel",
      "Chapter earned Most Outstanding Non-academic Organization and CISTM Outstanding Organization honors under my term"
    ]
  },
  {
    id: 2,
    title: "Notion",
    category: "Leadership",
    tags: ["leadership"],
    year: "2024",
    description: "Two years as a Notion Campus Leader — running workshops, study jams, and a campus-wide Notion adoption drive that reached over 700 participants across 9 events.",
    technologies: ["Notion", "Notion AI", "Google Workspace", "Figma"],
    image: "works/Notion/Notion.png",
    images: ["works/Notion/Notion.png", "works/Notion/DSC_0173.jpg", "works/Notion/DSC_03841.JPG"],
    details: "As a Notion Campus Leader, I led two years of workshops, study jams, and campus initiatives built around one goal: spreading Notion Love, Use, and Value. My first onsite event, Bean There, Notion That, was a creative interactive workshop teaching the Notion basics and showing how the tool can streamline a creative team's workflow.\n\nI also initiated the Notion Creative Study Jam, where my leads spoke on content, branding, marketing, and documentation through Notion to over 30 attendees, and headlined New Beginnings with Notion: Kickoff 2026, a 100+-attendee talk on starting the year fresh and hitting personal goals using Notion templates — aimed at students juggling coursework, org leadership, and passion projects.\n\nBeyond events, I led three projects to spread that value campus-wide: a Creative Workspace system that moved our team's drafting, planning, captions, and publication materials entirely into Notion; the Haribot Quests KPI system, a gamified workspace where org members complete quests to earn badges, rewards, and pets; and a campus-wide adoption drive through booths, org workspace management, and using Notion in my own academics and personal life. Across my two years I spoke at all 9 events I organized, reaching a cumulative 700 participants.",
    achievements: [
      "Spoke at all 9 events organized during my two-year term, reaching 700 cumulative participants",
      "Spearheaded the Notion Creative Study Jam (30+ attendees) and headlined Kickoff 2026 (100+ attendees)",
      "Built the Haribot Quests KPI system, a gamified Notion workspace rewarding member engagement with badges and swags",
      "Migrated the org's creative workflow — drafting, planning, captions, and publication materials — entirely into Notion"
    ]
  },
  {
    id: 3,
    title: "World Student Pitch Philippines",
    category: "Branding",
    tags: ["branding"],
    year: "2025",
    description: "As Head of Marketing, I led all branding, collaterals, and promotions for WSP Philippines 2025 — the regional qualifying pitch event for Japan's Yume Pro-backed World Student Pitch Global Finals.",
    technologies: ["Figma", "Notion", "Google Workspace", "Meta Business Suite"],
    image: "works/WSP/WSP.mp4",
    images: ["works/WSP/WSP.mp4", "works/WSP/518163445_122101305014938533_7635452813444446771_n.jpg", "works/WSP/533578490_122120433812938533_4793201187638082170_n.jpg"],
    details: "World Student Pitch (WSP) Philippines 2025 was the regional qualifying round for the World Student Pitch Global Finals, the international expansion of Yume Pro — one of Japan's largest student entrepreneurship contests. Held at Launchgarage Innovation Hub in Quezon City, the event brought 8–10 finalist teams of Filipino student entrepreneurs together to pitch original startup ideas for a shot at representing the Philippines at the WSP Global Finals.\n\nAs Head of Marketing, I led the Philippines chapter's entire brand presence — designing the event's invitations, materials, collaterals, media assets, and swags, and producing the event AVP that played as the pitch stage's screensaver. The event drew over 60 participants and was judged by a panel of industry leaders, including Founders Launchpad's Nikko Guiam, ETX Ph CEO Rico Bautista, White Cloak Technologies CEO Donn Gamboa, and LaunchGarage Managing Director Jay Fajardo.\n\nThe event was backed by top sponsor CREDO Holdings Co., Ltd., with the grand prize winner earning ₱50,000 and a spot at the WSP Global Finals — work that put the Philippines on the map alongside WSP's existing chapters in Taiwan, Thailand, Singapore, Malaysia, Indonesia, and Korea.",
    achievements: [
      "Led all branding, invitations, collaterals, media, and swag design for the Philippines chapter as Head of Marketing",
      "Produced the event AVP screened during the pitch stage",
      "Helped draw 60+ participants and a judging panel of startup and venture capital executives"
    ]
  },
  {
    id: 4,
    title: "Moonton Student Leaders",
    category: "Multimedia Design",
    tags: ["multimedia-design"],
    year: "2023",
    description: "As Associate Video and Page Creative for Moonton Student Leaders Philippines, I edited one of the AVPs for the M6 World Championship livestream on MPL Philippines' YouTube (1.6M views) and designed standees, page graphics, and publication materials for a 113K-follower Facebook page.",
    technologies: ["Adobe After Effects", "Filmora", "Canva", "Figma", "Adobe Photoshop"],
    image: "works/Moonton/Moonton.mp4",
    images: ["works/Moonton/Moonton.mp4", "works/Moonton/OfficialConquestMLBBStandeeAndBG.jpg", "works/Moonton/SLFlex - M6 PASS LEVEL.png"],
    details: "As Associate Video and Page Creative for Moonton Student Leaders Philippines, I produced video content, motion graphics, and publication materials for the page across three years, supporting Mobile Legends: Bang Bang's presence in the Philippine esports and pop culture scene.\n\nOne of my video projects was editing an AVP that aired during the M6 World Championship Grand Finals livestream on MPL Philippines' YouTube channel — held in Kuala Lumpur, Malaysia against competing Southeast Asian countries — cutting the event's main song together with footage of Philippine campuses nationwide. The livestream reached 1.6 million views.\n\nOn the design side, I created the Mobile Legends: Bang Bang booth standees for CONQuest 2023 — the biggest Philippine pop culture and gaming convention at the time, drawing around 30,000 attendees — along with a steady stream of publication materials posted to the official Moonton Student Leaders PH Facebook page, which has grown to 113K followers.",
    achievements: [
      "Edited one of the AVPs featured in the M6 World Championship livestream on MPL Philippines' YouTube, which reached 1.6 million views",
      "Designed the CONQuest 2023 MLBB booth standees for an event with ~30,000 attendees",
      "Produced ongoing publication materials for a Facebook page with 113K followers"
    ]
  },
  {
    id: 5,
    title: "House of Representatives",
    category: "Multimedia Design",
    tags: ["multimedia-design"],
    year: "2025",
    description: "As Social Media Consultant for Rep. Leila De Lima (ML Partylist), I design and edit the legislative and advocacy materials shared on her 744K-follower page — work that's ranged from 3K to 212K reactions and 2.8 million total reach.",
    technologies: ["Figma", "Meta Business Suite", "Filmora", "Adobe After Effects", "Adobe Photoshop"],
    image: "works/HOR/HOR.png",
    images: ["works/HOR/HOR.png", "works/HOR/CBBML.mp4", "works/HOR/Instagram post - 167.png"],
    details: "As Social Media Consultant for ML Partylist Rep. Leila De Lima — former Senator of the Philippines — I create the materials that disseminate her legislative updates, public advisories, and advocacies to the public. It's meaningful work: giving light to public service and building awareness through a platform that genuinely reaches people.\n\nMy output ranges from milestone graphics, like the piece marking her 100 legislative measures principally authored, to the closing billboard I designed as the standard outro for all of her social media videos. I also review and countercheck press releases for accuracy before publication, and help shape content direction for her legislative and advocacy initiatives.\n\nContent I've produced has reached from 3,000 to 212,000 reactions with a cumulative 2.8 million reach, on a page that has grown to 744,000 followers — including one publication piece that alone drew 63,000 reactions.",
    achievements: [
      "Designed the closing billboard used as the standard outro across all of Rep. De Lima's social media videos",
      "Designed and edited materials reaching 3K–212K reactions and 2.8 million cumulative reach on a 744K-follower page",
      "One publication piece alone drew 63,000 reactions"
    ]
  },
  {
    id: 6,
    title: "Tara Kabataan",
    category: "UI / UX / Frontend",
    tags: ["ui-ux", "frontend"],
    year: "2025",
    description: "UI/UX Designer for tarakabataan.org — the official website for Tara Kabataan, a Manila youth organization advancing disaster relief, education, and gender equality advocacy — and frontend developer for its events page.",
    technologies: ["Figma", "Adobe After Effects", "TypeScript", "CSS", "GitHub", "VS Code"],
    image: "works/Tara Kabataan/Tara Kabataan.mp4",
    images: ["works/Tara Kabataan/Tara Kabataan.mp4", "works/Tara Kabataan/Screenshot 2026-08-04 195659.png", "works/Tara Kabataan/Screenshot 2026-08-04 200014.png"],
    details: "Tara Kabataan (TK) is a youth organization based in Manila, founded to advance the welfare of every kabataan and Manileño. Believing in the potential of youth both inside and outside school, TK works across disaster relief, environmental preservation, health accessibility, education for national identity, and gender equality — partnering with organizations like Hope Business for Good, Little Hands, Rotaract, Young Public Servants, and Angat Buhay to expand its reach.\n\nI served as UI/UX Designer for their official website, tarakabataan.org — the organization's main platform for sharing blog posts, upcoming and recent events, contact information, and a donation channel for their cause. I designed the site's entire UI/UX, built the frontend for the events page, edited the site's official launch video, and animated the walking cow that appears throughout the experience.\n\nThe site was built with a blog, events management, membership and partnership pages, a donation platform, and emergency response coordination, backed by an admin panel for managing content. It's now live and running at tarakabataan.org.",
    achievements: [
      "Designed the UI/UX for the entire tarakabataan.org website and built the frontend for its events page",
      "Edited the site's official launch video and animated its signature walking cow",
      "Site is live, supporting TK's partnerships with NGOs like Angat Buhay, Rotaract, and Young Public Servants"
    ]
  },
  {
    id: 7,
    title: "Gear Up",
    category: "UI / UX / Branding",
    tags: ["ui-ux", "branding"],
    year: "2025",
    description: "UI/UX Designer and brand identity lead for GEAR UP, an on-demand automotive repair app that won 1st place in presentation and Best Product Overall at a product exposition.",
    technologies: ["Figma", "Adobe After Effects"],
    image: "works/Gear Up/Gear Up.mp4",
    images: ["works/Gear Up/Gear Up.mp4", "works/Gear Up/GU.png", "works/Gear Up/GU-1.png"],
    details: "GEAR UP is an on-demand automotive repair services mobile app that connects vehicle owners directly with registered mechanic shops and auto service providers for fast, reliable repairs. Through real-time location tracking and seamless booking, users can request help from accredited auto shops for emergency repairs or roadside issues — giving Filipino drivers access to affordable, high-quality automotive care anytime, anywhere, while helping partner mechanic shops expand their customer reach. It was built for car and motorcycle owners, fleet and delivery companies, ride-hailing and PUV drivers, and the mechanics and auto shops serving them.\n\nI designed every screen in the app — from the home screen to the mechanic tracker screen — and led the brand identity, including the logo, color palette, and visual language, for the GEAR UP name. I also edited the AVP used to pitch the product.\n\nEntered as a product exposition competition entry, GEAR UP won 1st place in presentation and Best Product Overall.",
    achievements: [
      "Won 1st place in presentation and Best Product Overall at the product exposition",
      "Designed every screen in the app's UI/UX, from the home screen to the mechanic tracker screen",
      "Led the brand identity (logo, color, visual language) and edited the AVP used to pitch the product"
    ]
  },
  {
    id: 15,
    title: "Sterling Insurance Company Inc.",
    category: "UI / UX / Frontend",
    tags: ["ui-ux", "frontend"],
    year: "2025",
    description: "As part of a 3-person engineering team at Sterling Insurance Company Inc., I led the UI/UX design and frontend development of a web-based quotation system for the underwriting department, set for deployment across 33 branches.",
    technologies: ["PHP", "JavaScript", "CSS", "Figma"],
    image: "works/Sterling/Sterling.png",
    images: ["works/Sterling/Sterling.png", "works/Sterling/Quotation Submitted.png", "works/Sterling/Screenshot 2026-08-04 201006.png"],
    details: "During my internship as a Software Engineer at Sterling Insurance Company Inc. in Makati, our team of three developed a web-based quotation system using PHP, JavaScript, and CSS to streamline workflows for the underwriting department — built for deployment across all 33 Sterling Insurance branches.\n\nI designed the application's UI/UX in Figma and led frontend development, working directly with the underwriting department to define specifications and run comprehensive test cases, covering everything from quotation submission to the final approval screen.\n\nTogether we partnered closely with the I.T. Manager and Head of Underwriting to drive the project end-to-end through the full Software Development Life Cycle, from requirements gathering to a system ready for branch-wide rollout.",
    achievements: [
      "Built a web-based quotation system scheduled for deployment across 33 Sterling Insurance branches",
      "Led the UI/UX design and frontend development, from quotation submission through to the approval screen",
      "Collaborated with a 3-person team and drove the end-to-end SDLC with the I.T. Manager and Head of Underwriting"
    ]
  },
  {
    id: 13,
    title: "A.C.C. Lang",
    category: "UI / UX / Frontend / Branding",
    tags: ["ui-ux", "frontend", "branding"],
    year: "2024",
    description: "UI/UX designer, frontend developer, and brand identity lead for A.C.C. Lang, my group's own programming language combining Python's readability with C++'s power, complete with its own web-based code editor.",
    technologies: ["Figma", "HTML", "CSS", "JavaScript", "VS Code", "GitHub"],
    image: "works/A.C.C. Lang/A.C.C. Lang.png",
    images: ["works/A.C.C. Lang/A.C.C. Lang.png", "works/A.C.C. Lang/A.C.C. Lang. Dark Mode.png", "works/A.C.C. Lang/Screenshot 2026-08-04 213231.png"],
    details: "A.C.C. Lang (Adaptive, Consistent, Concise) is a modern programming language my group and I created, combining the simplicity and readability of Python with the power and efficiency of C++. It's designed to be approachable for beginner programmers while still offering the advanced features experienced developers expect.\n\nI designed the entire web app's UI/UX in Figma and built it as the frontend developer using HTML, CSS, and JavaScript — including the code editor's autocomplete, tabbing, syntax color coding, and dark/light mode themes.\n\nI also led the project's full brand identity: the logo, color palette, typography, and a complete lockup system spanning horizontal, vertical, wordmark, and icon layouts. It's one of the projects where my technical and creative work come together most directly.",
    achievements: [
      "Designed and built the entire web app's UI/UX and frontend, including autocomplete, tabbing, syntax color coding, and dark/light mode",
      "Led the full brand identity — logo, color palette, typography, and lockup system across horizontal, vertical, wordmark, and icon layouts"
    ]
  },
  {
    id: 10,
    title: "Doers Coffee",
    category: "Branding",
    tags: ["branding"],
    year: "2026",
    description: "Full brand identity for Doers Coffee, a new coffee shop in Sta. Mesa — logo, colors, cup designs, signage, posters, and menu, opening this September.",
    technologies: ["Figma"],
    image: "works/Doers/Doers-cover.png",
    images: ["works/Doers/Doers-cover.png", "works/Doers/doers.png", "works/Doers/doers1.png"],
    details: "Doers Coffee is a coffee shop opening this September in Sta. Mesa. I designed its complete brand identity from the ground up — the logo, color palette, and overall visual vibe — along with every customer-facing collateral: cup designs, signage, posters, and the menu.\n\nThe brand leans into a bold, retro-inspired palette of blues and warm orange, built around a bubbly wordmark logo and playful geometric patterns — designed to give a brand-new shop an established, confident presence from day one.\n\nDoers Coffee opens for business this September.",
    achievements: [
      "Designed the complete brand identity — logo, color palette, and visual language — for a brand-new coffee shop",
      "Created all customer-facing collateral: cup designs, signage, posters, and the menu",
      "Coffee shop set to open in Sta. Mesa this September"
    ]
  },
  {
    id: 8,
    title: "Ecarga",
    category: "UI / UX",
    tags: ["ui-ux"],
    year: "2024",
    description: "UI/UX designer and idea pitcher for eCarga, our InnOlympics 2024 hackathon entry — a ride-hailing app built exclusively for Filipinos with mobility disabilities — which finished Top 10 out of 25 teams.",
    technologies: ["Figma"],
    image: "works/eCARGA/eCARGA.png",
    images: ["works/eCARGA/eCARGA.png", "works/eCARGA/ecarga0.png", "works/eCARGA/ecarga-1.png"],
    details: "eCarga is a mobile ride-hailing application designed exclusively for people with mobility disabilities and physical impairments, providing an easy-access booking system for specialized vans and tricycles. It's built for wheelchair users, walker and cane users, and anyone else who finds traditional ride-hailing difficult to use, with caregivers, senior citizens, hospitals, and disability-focused NGOs and government agencies as secondary users and partners.\n\nThe app centers on four core features: an accessible fleet of specialized vans and tricycles, an easy-access booking system with flexible pickup scheduling, trained drivers qualified to handle riders with care, and an in-app emergency button that connects riders directly to emergency vans. By making transportation genuinely accessible for Filipino PWDs, eCarga aims to advance SDG 10 (Reduced Inequalities) and SDG 11 (Sustainable Cities and Communities).\n\nI pitched the original app idea to my team and served as UI/UX designer for the entry, designing every screen in the app. eCarga finished as a Top 10 finalist out of 25 teams at InnOlympics 2024.",
    achievements: [
      "Pitched the original app concept and led UI/UX design for the team's hackathon entry",
      "Finished as a Top 10 finalist out of 25 teams at InnOlympics 2024",
      "Designed a booking experience built around accessibility, mapped to SDG 10 and SDG 11"
    ]
  },
  {
    id: 11,
    title: "Overclocked",
    category: "Storyboard / UI / UX",
    tags: ["storyboard", "ui-ux"],
    year: "2026",
    description: "Lead Storyboard and UI/UX designer for Overclocked, a Godot-built mobile game that simulates running a Philippine computer shop to help IT students build real-world troubleshooting skills.",
    technologies: ["Figma", "Adobe Photoshop"],
    image: "works/OVERCLOCKED/OVERCLOCKED-cover.png",
    images: ["works/OVERCLOCKED/OVERCLOCKED-cover.png", "works/OVERCLOCKED/OC1.png", "works/OVERCLOCKED/OC2.png"],
    details: "Overclocked is a mobile Computer Shop Simulator built in Godot, created to close the gap between academic IT knowledge and operational reality. It turns the authentic Philippine computer shop experience into a game, letting students practice fixing networks, managing cable clutter, and balancing a complex budget in a risk-free environment — building the confidence, quick thinking, and resourcefulness future IT professionals need under real-world pressure.\n\nAs Lead Storyboard and UI/UX designer, I shaped the game's flow and core loop, wrote its lore, and designed every menu and the intro sequence players see when they launch the game, along with the game's logo and background art.",
    achievements: [
      "Designed the game's full flow, core loop, and lore as Lead Storyboard and UI/UX",
      "Designed the game's menus, intro sequence, logo, and background art",
      "Built a training-through-play tool addressing a real gap in IT students' practical troubleshooting experience"
    ]
  }
];
