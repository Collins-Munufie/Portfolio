/**
 * Munufie Collins Anane - DevOps Engineer & Software Developer
 * Portfolio Interactive Engines: Typewriter, DevOps CLI Terminal, Pipeline Visualizer,
 * Project Filters, Certificate Modal, Toast System, and GitHub Real-Time Tracker.
 */

const GITHUB_USERNAME = "Collins-Munufie";
const CACHE_KEY = "collins_github_cache_v3";
const CACHE_EXPIRY = 3600000; // 1 hour

// Fallback GitHub data when offline or rate limited
const FALLBACK_GITHUB_DATA = {
  user: {
    public_repos: 24,
    followers: 16,
    avatar_url: "collins.jpg",
    bio: "DevOps Engineer | Cloud Infrastructure | Software Quality Assurance",
    name: "Munufie Collins Anane",
  },
  stars: 12,
  contributionsEstimate: "180+",
  repos: [
    {
      name: "blog-platform",
      html_url: "https://github.com/Collins-Munufie/blog-platform",
      description: "Full-stack editorial & publication platform with reader experience, Creator Studio, and Admin suite.",
      language: "TypeScript",
      stargazers_count: 5,
      forks_count: 1,
    },
    {
      name: "KHOPHI-Academy-school",
      html_url: "https://github.com/Collins-Munufie/KHOPHI-Academy-school",
      description: "Modern school web platform & campus management system for dual Cambridge & National curricula.",
      language: "TypeScript",
      stargazers_count: 5,
      forks_count: 1,
    },
    {
      name: "SMS",
      html_url: "https://github.com/Collins-Munufie/SMS",
      description: "School Management System for Ghanaian basic education (KG, Primary, JHS) with WAEC grading & MoMo payments.",
      language: "TypeScript",
      stargazers_count: 5,
      forks_count: 1,
    },
    {
      name: "Cognify",
      html_url: "https://github.com/Collins-Munufie/Cognify",
      description: "AI-powered study platform converting documents, links, and videos into interactive Q&A flashcards.",
      language: "JavaScript",
      stargazers_count: 6,
      forks_count: 2,
    },
    {
      name: "learning-ai",
      html_url: "https://github.com/Collins-Munufie/learning-ai",
      description: "AI-powered learning difficulty classification & recommendations across 5 cognitive domains.",
      language: "TypeScript",
      stargazers_count: 4,
      forks_count: 1,
    },
    {
      name: "Automated_Application_Deployment",
      html_url: "https://github.com/Collins-Munufie/Automated_Application_Deployment",
      description: "Automated AWS Infrastructure provisioning with Terraform (VPC, compute, security groups).",
      language: "HCL",
      stargazers_count: 3,
      forks_count: 1,
    },
  ],
  recentActivity: [
    {
      type: "PushEvent",
      repo: "Collins-Munufie/SMS",
      time: "Recent commit to main",
    },
    {
      type: "PushEvent",
      repo: "Collins-Munufie/Cognify",
      time: "Updated AI flashcard generator",
    },
    {
      type: "PushEvent",
      repo: "Collins-Munufie/learning-ai",
      time: "Enhanced cognitive evaluation models",
    },
    {
      type: "WatchEvent",
      repo: "kubernetes/kubernetes",
      time: "Starred cloud-native repository",
    },
  ],
};

// Global chart instances
let contributionChart = null;
let languagesChart = null;

// Terminal command history
let cmdHistory = [];
let historyIndex = -1;

// Document Ready Initialization
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initTypewriter();
  initDevOpsTerminal();
  initPipelineVisualizer();
  initProjectFilters();
  initCopyClipboard();
  initCertModal();
  initContactForm();
  initGitHubTracker();
  updateCurrentYear();
});

/* -------------------------------------------------------------
 * 1. Navbar & Mobile Menu & Scroll Spy
 * ----------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const burger = document.getElementById("burger-menu");
  const navLinks = document.getElementById("nav-links");
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  // Scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Scroll spy
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    links.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // Mobile menu toggle
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      burger.classList.toggle("toggle");
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        burger.classList.remove("toggle");
      });
    });
  }
}

/* -------------------------------------------------------------
 * 2. Typewriter Effect
 * ----------------------------------------------------------- */
function initTypewriter() {
  const typewriterEl = document.getElementById("typewriter");
  if (!typewriterEl) return;

  const roles = [
    "DevOps Engineering",
    "AWS Cloud Infrastructure",
    "Terraform Infrastructure as Code",
    "Docker & Kubernetes Systems",
    "CI/CD with Jenkins & GitLab",
    "Software Quality Assurance (uTest)",
    "Frontend React Engineering",
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 85;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 350;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* -------------------------------------------------------------
 * 3. Interactive DevOps Terminal / CLI Sandbox
 * ----------------------------------------------------------- */
function initDevOpsTerminal() {
  const terminalInput = document.getElementById("terminal-input");
  const terminalOutput = document.getElementById("terminal-output");
  const clearBtn = document.getElementById("term-clear-btn");
  const terminalBody = document.getElementById("terminal-body");

  if (!terminalInput || !terminalOutput) return;

  const commands = {
    help: () => `Available commands:
  • whoami          - View engineer background & summary
  • skills          - List technical skills & cloud tooling
  • experience      - View professional roles & companies
  • projects        - View highlighted engineering projects
  • education       - View degree & university info
  • certs           - View verified certifications
  • contact         - Display contact channels & email
  • aws status      - Check simulated AWS Cloud resource inventory
  • terraform apply - Run simulated Terraform IaC provisioning
  • docker ps       - View running containerized microservices
  • clear           - Clear terminal window`,

    whoami: () => `MUNUFIE COLLINS ANANE
Title: DevOps Engineer
Location: Sunyani, Ghana (Open to Global Remote & Hybrid Roles)
Education: B.Sc. Information Technology - UENR
Specializations: AWS Cloud, Kubernetes, Docker, Terraform, CI/CD, QA Testing (uTest), React`,

    skills: () => `Software & Web:    HTML, CSS, JavaScript, TypeScript, React, REST APIs
Quality Assurance: Functional, Performance, Visual, Content Testing (uTest Certified)
Cloud Platforms:   AWS (EC2, S3, Lambda, API Gateway, RDS, DynamoDB, CloudFront, Route 53)
DevOps & CI/CD:    Docker, Kubernetes, Jenkins, GitHub Actions, GitLab CI/CD, Terraform, Shell
Monitoring:        Prometheus, Grafana, System Performance Tracking
Process:           Technical Documentation, Workflow Automation, Linux & Windows Admin`,

    experience: () => `1. Frontend Developer                 | 404 Paradox Labs  | Jun 2026 - Present
2. Software Quality Assurance Tester  | uTest (Applause)  | May 2026 - Present
3. Cloud Computing Intern             | Thrive Africa     | Feb 2026 - Mar 2026
4. DevOps on AWS Trainee              | Simplilearn       | Aug 2025 - Oct 2025
5. Cloud & DevOps Trainee             | AmaliTech         | Sep 2024 - Jan 2025
6. IT Department - Graphic Designer   | UENR              | 2022 - Present`,

    projects: () => `1. Editorial & Publication Platform          - Full-Stack Next.js Publishing Suite with Creator Studio
2. KHOPHI Academy School Platform         - Modern School Portal for Cambridge & National Curricula
3. School Management System (SMS)             - Ghanaian Basic Ed (KG, Primary, JHS) with WAEC Grading & MoMo
4. Kubernetes-Based Microservices Deployment   - K8s cluster with Prometheus & Grafana
5. React App Deployment on AWS EC2             - Production React hosting with IAM & Security Groups
6. Automated Infrastructure Provisioning       - Full IaC Terraform AWS deployment (< 10 mins)
7. Cognify - AI-Powered Study Platform         - Multi-format document study app (React, OpenAI)
8. Dockerized Three-Tier Web Application       - Multi-container architecture with Docker Compose`,

    education: () => `University of Energy and Natural Resources (UENR)
Degree: Bachelor of Science in Information Technology
Timeline: Jan 2022 – Expected Sep 2026`,

    certs: () => `• Kubernetes and Cloud Native Essentials (LFS250) - The Linux Foundation
• AWS Certified Cloud Practitioner - Amazon Web Services
• DevOps on AWS - Simplilearn`,

    contact: () => `Email:    collinsmunufie2018@gmail.com
WhatsApp: +233 559 689 849
GitHub:   https://github.com/Collins-Munufie
LinkedIn: https://www.linkedin.com/in/collins-munufie/
Twitter:  https://x.com/CMunufie8438`,

    "aws status": () => `[AWS Cloud Health Status: us-east-1]
--------------------------------------------------
✔ VPC (vpc-0c9f1a):       ONLINE (Subnets: 2 Public, 2 Private)
✔ ECS Cluster (prod-app): ACTIVE (Desired: 3, Running: 3)
✔ RDS Postgres (db-prod): HEALTHY (Storage: 20GB, Multi-AZ)
✔ S3 Buckets:             3 Active (Encryption: AES-256)
✔ CloudFront CDN:         DEPLOYED (SSL Enabled)
✔ Latency / SLA:          99.98% uptime across all endpoints`,

    "terraform apply": () => `[Terraform v1.7.4 - Initializing Cloud Resources]
--------------------------------------------------
module.vpc.aws_vpc.main: Creating...
module.ecs.aws_ecs_cluster.app: Creating...
module.s3.aws_s3_bucket.static: Creating...
Apply complete! Resources: 14 added, 0 changed, 0 destroyed.
Outputs:
vpc_id = "vpc-08992efb1"
alb_dns_name = "app-prod-alb-12903.us-east-1.elb.amazonaws.com"`,

    "docker ps": () => `CONTAINER ID   IMAGE                 COMMAND                  STATUS         PORTS
a1b2c3d4e5f6   collins/cognify:v2    "docker-entrypoint.s…"   Up 4 days      0.0.0.0:3000->3000/tcp
f6e5d4c3b2a1   prom/prometheus:v2.45 "/bin/prometheus --c…"   Up 4 days      0.0.0.0:9090->9090/tcp
1a2b3c4d5e6f   grafana/grafana:10.0  "/run.sh"                Up 4 days      0.0.0.0:3001->3000/tcp`,

    clear: () => {
      terminalOutput.innerHTML = "";
      return "";
    },
  };

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    cmdHistory.push(rawCmd);
    historyIndex = cmdHistory.length;

    const entry = document.createElement("div");
    entry.className = "term-entry";

    const cmdLine = document.createElement("div");
    cmdLine.className = "term-entry-cmd";
    cmdLine.innerHTML = `<span class="term-prompt">collins@devops:~$</span> <span>${escapeHTML(rawCmd)}</span>`;
    entry.appendChild(cmdLine);

    if (cmd === "clear") {
      commands.clear();
      return;
    }

    const resLine = document.createElement("div");
    resLine.className = "term-entry-res";

    if (commands[cmd]) {
      resLine.textContent = commands[cmd]();
      if (cmd.includes("aws") || cmd.includes("terraform") || cmd.includes("docker")) {
        resLine.classList.add("success");
      }
    } else {
      resLine.textContent = `Command not found: '${rawCmd}'. Type 'help' to see available commands.`;
      resLine.classList.add("error");
    }

    entry.appendChild(resLine);
    terminalOutput.appendChild(entry);

    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      executeCommand(terminalInput.value);
      terminalInput.value = "";
    } else if (e.key === "ArrowUp") {
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = cmdHistory[historyIndex] || "";
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        terminalInput.value = cmdHistory[historyIndex] || "";
      } else {
        historyIndex = cmdHistory.length;
        terminalInput.value = "";
      }
      e.preventDefault();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      terminalOutput.innerHTML = "";
      terminalInput.focus();
    });
  }
}

/* -------------------------------------------------------------
 * 4. CI/CD & Cloud Pipeline Visualizer
 * ----------------------------------------------------------- */
function initPipelineVisualizer() {
  const nodes = document.querySelectorAll(".pipeline-node");
  const titleEl = document.getElementById("pipe-detail-title");
  const descEl = document.getElementById("pipe-detail-desc");
  const tagsEl = document.getElementById("pipe-detail-tags");

  if (!nodes.length || !titleEl || !descEl || !tagsEl) return;

  const stageData = {
    source: {
      title: "Stage 1: Source Control & Branching Strategy",
      desc: "Developers commit code following GitFlow practices. Pre-commit hooks run linter and unit tests, initiating automated webhook triggers on pull requests.",
      icon: "fab fa-git-alt",
      tags: ["Git", "GitHub", "GitLab", "Semantic Versioning"],
    },
    ci: {
      title: "Stage 2: Continuous Integration & Automated Testing",
      desc: "Jenkins and GitHub Actions trigger on pull requests, executing automated integration tests, security linting, vulnerability scanning, and build artifact creation.",
      icon: "fas fa-sync-alt",
      tags: ["Jenkins", "GitHub Actions", "GitLab CI", "Jest", "Trivy Scanner"],
    },
    docker: {
      title: "Stage 3: Containerization & Registry Artifacts",
      desc: "Docker builds lightweight, multi-stage container images, tagging them immutably and pushing to Amazon Elastic Container Registry (ECR) or Docker Hub.",
      icon: "fab fa-docker",
      tags: ["Docker", "Docker Compose", "Multi-stage Builds", "Amazon ECR"],
    },
    iac: {
      title: "Stage 4: Infrastructure as Code (IaC) Provisioning",
      desc: "Terraform plans and provisions necessary AWS VPCs, subnets, ECS/EKS clusters, and RDS databases with remote state locking in Amazon S3 and DynamoDB.",
      icon: "fas fa-cubes",
      tags: ["Terraform", "AWS CloudFormation", "S3 State Backend", "DynamoDB Locking"],
    },
    deploy: {
      title: "Stage 5: AWS Deployment & Live Telemetry",
      desc: "Automated zero-downtime rolling deployment to AWS ECS/Lambda with Route 53 DNS routing, Prometheus performance metrics, and Grafana dashboard alerts.",
      icon: "fab fa-aws",
      tags: ["AWS ECS", "AWS Lambda", "Prometheus", "Grafana", "CloudWatch"],
    },
  };

  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      nodes.forEach((n) => n.classList.remove("active"));
      node.classList.add("active");

      const stageKey = node.dataset.stage;
      const data = stageData[stageKey];

      if (data) {
        titleEl.innerHTML = `<i class="${data.icon}"></i> ${data.title}`;
        descEl.textContent = data.desc;
        tagsEl.innerHTML = data.tags.map((tag) => `<span class="pipe-tag">${tag}</span>`).join("");
      }
    });
  });
}

/* -------------------------------------------------------------
 * 5. Project Filtering
 * ----------------------------------------------------------- */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.dataset.filter;

      projectCards.forEach((card) => {
        const categories = card.dataset.category || "";
        if (filterValue === "all" || categories.includes(filterValue)) {
          card.style.display = "flex";
          card.style.animation = "fadeIn 0.4s ease forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* -------------------------------------------------------------
 * 6. Toast Notifications & Copy to Clipboard
 * ----------------------------------------------------------- */
function showToast(message, icon = "fas fa-check-circle") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

function initCopyClipboard() {
  const copyBtns = document.querySelectorAll("[data-email], [data-copy]");

  copyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.dataset.email || btn.dataset.copy || "collinsmunufie2018@gmail.com";
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`, "fas fa-clipboard-check");
        })
        .catch(() => {
          showToast("Unable to copy to clipboard", "fas fa-exclamation-triangle");
        });
    });
  });
}

/* -------------------------------------------------------------
 * 7. Verified Certificate Modal
 * ----------------------------------------------------------- */
function initCertModal() {
  const modal = document.getElementById("cert-modal");
  if (!modal) return;

  const titleEl = document.getElementById("cert-modal-title");
  const issuerEl = document.getElementById("cert-modal-issuer");
  const imageEl = document.getElementById("cert-modal-image");
  const descEl = document.getElementById("cert-modal-desc");
  const closeBtn = modal.querySelector(".modal-close");

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  };

  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  document.querySelectorAll(".cert-view-button").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.dataset.certTitle || "Verified Certificate";
      const issuer = button.dataset.certIssuer || "Issuing Body";
      const imageSrc = button.dataset.certImage || "";
      const desc = button.dataset.certDesc || "";

      if (titleEl) titleEl.textContent = title;
      if (issuerEl) issuerEl.innerHTML = `<i class="fas fa-certificate"></i> ${issuer}`;
      if (descEl) descEl.textContent = desc;

      if (imageEl && imageSrc) {
        imageEl.src = imageSrc;
        imageEl.alt = `${title} preview`;
      }

      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    });
  });
}

/* -------------------------------------------------------------
 * 8. Contact Form (AJAX FormSubmit Integration)
 * ----------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  const successModal = document.getElementById("success-modal");

  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector("#contact-submit-btn");
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        if (successModal) {
          successModal.classList.add("active");
          const closeBtn = successModal.querySelector(".close-modal-btn");
          closeBtn.onclick = () => successModal.classList.remove("active");
          successModal.onclick = (event) => {
            if (event.target === successModal) successModal.classList.remove("active");
          };
        } else {
          showToast("Message sent successfully!", "fas fa-check-circle");
        }
        contactForm.reset();
      } else {
        showToast("Error sending message. Please try again.", "fas fa-exclamation-circle");
      }
    } catch (err) {
      showToast("Network error. Please try again or reach out on WhatsApp.", "fas fa-exclamation-circle");
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* -------------------------------------------------------------
 * 9. GitHub Real-Time Tracker with Resilient Fallback
 * ----------------------------------------------------------- */
async function initGitHubTracker() {
  const refreshBtn = document.getElementById("refresh-github-btn");

  // Populate immediate fallback data so stats and charts never look empty
  renderGitHubStats(FALLBACK_GITHUB_DATA);
  renderRecentRepos(FALLBACK_GITHUB_DATA.repos);
  renderActivityFeed(FALLBACK_GITHUB_DATA.recentActivity);
  renderCharts(FALLBACK_GITHUB_DATA);

  // Attempt live fetch if online and not restricted
  if (window.location.protocol !== "file:") {
    fetchLiveGitHubData();
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.querySelector("i").classList.add("fa-spin");
      fetchLiveGitHubData(true).finally(() => {
        setTimeout(() => {
          refreshBtn.querySelector("i").classList.remove("fa-spin");
        }, 600);
      });
    });
  }
}

async function fetchLiveGitHubData(force = false) {
  try {
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
          updateUIWithLiveData(parsed.data);
          return;
        }
      }
    }

    const [userRes, reposRes, eventsRes] = await Promise.allSettled([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=6`),
    ]);

    if (userRes.status === "fulfilled" && userRes.value.ok) {
      const userData = await userRes.value.json();
      let reposData = [];
      let eventsData = [];

      if (reposRes.status === "fulfilled" && reposRes.value.ok) {
        reposData = await reposRes.value.json();
      }

      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        eventsData = await eventsRes.value.json();
      }

      const aggregatedData = {
        user: userData,
        repos: reposData.length ? reposData : FALLBACK_GITHUB_DATA.repos,
        recentActivity: eventsData.length
          ? eventsData.map((e) => ({
              type: e.type,
              repo: e.repo.name,
              time: formatRelativeTime(new Date(e.created_at)),
            }))
          : FALLBACK_GITHUB_DATA.recentActivity,
        stars: reposData.reduce((acc, r) => acc + (r.stargazers_count || 0), 12),
      };

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: aggregatedData })
      );

      updateUIWithLiveData(aggregatedData);
    }
  } catch (e) {
    console.log("Using cached/fallback GitHub metrics.");
  }
}

function updateUIWithLiveData(data) {
  renderGitHubStats(data);
  if (data.repos && data.repos.length) renderRecentRepos(data.repos);
  if (data.recentActivity && data.recentActivity.length) renderActivityFeed(data.recentActivity);
}

function renderGitHubStats(data) {
  const reposCountEl = document.getElementById("repos-count");
  const starsCountEl = document.getElementById("stars-count");
  const commitsCountEl = document.getElementById("commits-count");
  const followersCountEl = document.getElementById("followers-count");

  if (reposCountEl) reposCountEl.textContent = data.user?.public_repos || 24;
  if (starsCountEl) starsCountEl.textContent = data.stars || 12;
  if (commitsCountEl) commitsCountEl.textContent = data.contributionsEstimate || "180+";
  if (followersCountEl) followersCountEl.textContent = data.user?.followers || 16;
}

function renderRecentRepos(repos) {
  const reposContainer = document.getElementById("repos-grid");
  if (!reposContainer) return;

  const langColors = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    HCL: "#844FBA",
    Shell: "#89e051",
    HTML: "#e34c26",
  };

  reposContainer.innerHTML = repos
    .slice(0, 4)
    .map((repo) => {
      const color = langColors[repo.language] || "#00388f";
      return `
      <a href="${repo.html_url}" target="_blank" class="repo-card">
        <strong class="repo-name"><i class="fas fa-book-bookmark"></i> ${escapeHTML(repo.name)}</strong>
        <p class="repo-desc">${escapeHTML(repo.description || "Cloud and DevOps repository")}</p>
        <div class="repo-meta">
          <span class="repo-lang"><span class="lang-dot" style="background-color: ${color}"></span> ${repo.language || "Code"}</span>
          <span><i class="fas fa-star"></i> ${repo.stargazers_count || 0}</span>
          <span><i class="fas fa-code-fork"></i> ${repo.forks_count || 0}</span>
        </div>
      </a>
    `;
    })
    .join("");
}

function renderActivityFeed(events) {
  const activityContainer = document.getElementById("activity-feed");
  if (!activityContainer) return;

  const typeIcons = {
    PushEvent: "fas fa-code-commit",
    CreateEvent: "fas fa-plus-circle",
    WatchEvent: "fas fa-star",
    PullRequestEvent: "fas fa-code-pull-request",
    ForkEvent: "fas fa-code-fork",
  };

  activityContainer.innerHTML = events
    .slice(0, 4)
    .map((event) => {
      const icon = typeIcons[event.type] || "fas fa-circle-dot";
      return `
      <div class="activity-item">
        <i class="${icon} activity-icon"></i>
        <div>
          <div class="activity-text"><strong>${escapeHTML(event.type.replace("Event", ""))}</strong> on <code>${escapeHTML(event.repo)}</code></div>
          <span class="activity-time">${event.time}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderCharts(data) {
  if (typeof Chart === "undefined") return;

  const contributionCanvas = document.getElementById("contribution-chart");
  const languagesCanvas = document.getElementById("languages-chart");

  // Destroy old instances
  if (contributionChart) contributionChart.destroy();
  if (languagesChart) languagesChart.destroy();

  // 1. Contribution Velocity Chart (30-day simulated activity velocity)
  if (contributionCanvas) {
    const labels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Current"];
    const values = [18, 26, 32, 28, 42, 38];

    contributionChart = new Chart(contributionCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Commits & Pull Requests",
            data: values,
            borderColor: "#00388f",
            backgroundColor: "rgba(0, 56, 143, 0.12)",
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: "#ffcb01",
            pointBorderColor: "#00388f",
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#64748b", font: { size: 11 } },
          },
          y: {
            grid: { color: "rgba(15, 23, 42, 0.06)" },
            ticks: { color: "#64748b", font: { size: 11 } },
          },
        },
      },
    });
  }

  // 2. Language Breakdown Chart
  if (languagesCanvas) {
    languagesChart = new Chart(languagesCanvas, {
      type: "doughnut",
      data: {
        labels: ["Python", "JavaScript", "Terraform / HCL", "Bash / Shell", "HTML / CSS"],
        datasets: [
          {
            data: [35, 30, 20, 10, 5],
            backgroundColor: ["#00388f", "#ffcb01", "#38bdf8", "#10b981", "#8b5cf6"],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              font: { size: 11, family: "Inter" },
              color: "#334155",
            },
          },
        },
      },
    });
  }
}

/* -------------------------------------------------------------
 * Helpers & Utilities
 * ----------------------------------------------------------- */
function updateCurrentYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRelativeTime(date) {
  const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}
