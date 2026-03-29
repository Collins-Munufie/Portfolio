// Configuration
const GITHUB_USERNAME = "Collins-Munufie";
const REFRESH_INTERVAL = 300000; // 5 minutes to stay within API rate limits (60/hr)
const CACHE_KEY = "github_portfolio_data";
const CACHE_EXPIRY = 3600000; // 1 hour

let refreshTimer;
let contributionChart, languagesChart, repoStatsChart;

// --- Global DOM Listeners & Actions ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Navigation Toggle
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            burger.classList.toggle('toggle');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                burger.classList.remove('toggle');
            });
        });
    }

    // 2. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });

    // 4. Contact Form Submission (FormSubmit.co)
    const contact = document.getElementById("contact-form");
    if (contact) {
        contact.addEventListener("submit", async function (e) {
            // FormSubmit.co typically redirects, but if we want to stay on page:
            // We only prevent default if we want to handle the response manually.
            // However, FormSubmit usually requires a standard POST for easy setup.
            // I'll keep the AJAX for a premium feel.
            e.preventDefault();
            const submitBtn = contact.querySelector(".submit-btn");
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;

            try {
                const response = await fetch(contact.action, {
                    method: "POST",
                    body: new FormData(contact),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const modal = document.getElementById("success-modal");
                    if (modal) {
                        modal.classList.add("active");
                        const closeBtn = modal.querySelector(".close-modal-btn");
                        if (closeBtn) closeBtn.onclick = () => modal.classList.remove("active");
                        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove("active"); };
                    }
                    contact.reset();
                } else {
                    alert("Oops! There was a problem submitting your form. Please try again.");
                }
            } catch (error) {
                alert("Oops! There was a problem submitting your form");
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // 5. Initialize GitHub Tracking
    startRealTimeTracking();
    addManualRefreshButton();
});

// --- GitHub Integration & Charts ---

async function fetchGitHubData(force = false) {
    // Check Cache first
    if (!force) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            const now = new Date().getTime();
            if (now - parsed.timestamp < CACHE_EXPIRY) {
                console.log("Loading GitHub data from cache...");
                updateUIFromData(parsed.data);
                updateRefreshStatus(new Date(parsed.timestamp));
                return;
            }
        }
    }

    try {
        showLoadingState();
        const [userRes, reposRes, eventsRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`),
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`)
        ]);

        // Handle Rate Limiting (403)
        if (userRes.status === 403 || reposRes.status === 403 || eventsRes.status === 403) {
            console.warn("GitHub rate limit hit. Falling back to cache.");
            loadCachedDataFallback();
            return;
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();
        const eventsData = await eventsRes.json();

        if (userData.message === "Not Found") return;

        const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        
        const masterData = {
            user: userData,
            repos: reposData,
            events: eventsData,
            totalStars: totalStars
        };

        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: new Date().getTime(),
            data: masterData
        }));

        updateUIFromData(masterData);
        updateRefreshStatus(new Date());

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        loadCachedDataFallback();
    } finally {
        hideLoadingState();
    }
}

function loadCachedDataFallback() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const parsed = JSON.parse(cached);
        updateUIFromData(parsed.data);
        updateRefreshStatus(new Date(parsed.timestamp));
        
        // Show rate limit warning
        let status = document.getElementById("last-refresh");
        if (status) status.innerHTML += " <span style='color:#ef4444'>(Rate limit reached, showing cached data)</span>";
    }
}

function updateUIFromData(data) {
    const { user, repos, events, totalStars } = data;

    animateCounter('repos-count', user.public_repos);
    animateCounter('stars-count', totalStars);
    animateCounter('followers-count', user.followers);
    
    // Update Profile Area
    const avatar = document.getElementById('github-avatar');
    if (avatar && user.avatar_url) avatar.src = user.avatar_url;

    // Process Languages
    createLanguagesChart(repos);
    createRepoStatsChart(repos);
    
    // Process Contributions & Activity
    processContributions(events);
    displayActivityFeed(events.slice(0, 10));
    displayRecentRepos(repos.slice(0, 6));
}

function processContributions(eventsData) {
    const contributionsByDate = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        contributionsByDate[date.toISOString().split('T')[0]] = 0;
    }
    
    let totalCommits = 0;
    eventsData.forEach(event => {
        const date = event.created_at.split('T')[0];
        if (contributionsByDate.hasOwnProperty(date)) {
            if (event.type === 'PushEvent') {
                const c = event.payload.commits ? event.payload.commits.length : (event.payload.size || 0);
                contributionsByDate[date] += c;
                totalCommits += c;
            } else if (['CreateEvent', 'PullRequestEvent'].includes(event.type)) {
                contributionsByDate[date] += 1;
            }
        }
    });
    
    animateCounter('commits-count', totalCommits);
    createContributionChart(contributionsByDate);
}

function displayActivityFeed(events) {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    feed.innerHTML = events.map(event => {
        let icon = 'fas fa-code-branch';
        let text = `Activity in <strong>${event.repo.name}</strong>`;
        
        if (event.type === 'PushEvent') {
            icon = 'fas fa-code-commit';
            const cnt = event.payload.commits ? event.payload.commits.length : (event.payload.size || 0);
            text = `Pushed ${cnt} ${cnt === 1 ? 'commit' : 'commits'} to <strong>${event.repo.name}</strong>`;
        } else if (event.type === 'WatchEvent') {
            icon = 'fas fa-star';
            text = `Starred <strong>${event.repo.name}</strong>`;
        } else if (event.type === 'CreateEvent') {
            icon = 'fas fa-plus';
            text = `Created ${event.payload.ref_type || 'repository'} <strong>${event.repo.name}</strong>`;
        }

        return `
            <div class="activity-item">
                <div class="activity-icon"><i class="${icon}"></i></div>
                <div class="activity-details">
                    <p>${text}</p>
                    <div class="activity-time">${formatTimeAgo(new Date(event.created_at))}</div>
                </div>
            </div>
        `;
    }).join('');
}

function createContributionChart(data) {
    const ctx = document.getElementById('contribution-chart');
    if (!ctx) return;
    if (contributionChart) contributionChart.destroy();
    contributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data).map(d => new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'})),
            datasets: [{
                data: Object.values(data),
                borderColor: '#00d9ff',
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                fill: true, tension: 0.4
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

function createLanguagesChart(repos) {
    const ctx = document.getElementById('languages-chart');
    if (!ctx) return;
    const counts = {};
    repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 5);
    if (languagesChart) languagesChart.destroy();
    languagesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sorted.map(s => s[0]),
            datasets: [{ data: sorted.map(s => s[1]), backgroundColor: ['#00d9ff', '#7c3aed', '#f59e0b', '#10b981', '#ef4444'] }]
        }
    });
}

function createRepoStatsChart(repos) {
    const ctx = document.getElementById('repo-stats-chart');
    if (!ctx) return;
    const stats = { Stars: 0, Forks: 0, Issues: 0 };
    repos.forEach(r => { stats.Stars += r.stargazers_count; stats.Forks += r.forks_count; stats.Issues += r.open_issues_count; });
    if (repoStatsChart) repoStatsChart.destroy();
    repoStatsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(stats),
            datasets: [{ data: Object.values(stats), backgroundColor: ['rgba(0, 217, 255, 0.8)', 'rgba(124, 58, 237, 0.8)', 'rgba(239, 68, 68, 0.8)'] }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

function displayRecentRepos(repos) {
    const grid = document.querySelector('.repos-grid');
    if (!grid) return;
    grid.innerHTML = repos.map(r => `
        <a href="${r.html_url}" target="_blank" class="repo-card">
            <h5>${r.name}</h5>
            <p>${r.description || 'DevOps Project'}</p>
            <div class="repo-meta">
                <span><i class="fas fa-star"></i> ${r.stargazers_count}</span>
                <span><i class="fas fa-code-branch"></i> ${r.forks_count}</span>
            </div>
        </a>
    `).join('');
}

// --- Utilities ---

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, val] of Object.entries(intervals)) {
        const count = Math.floor(seconds / val);
        if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
    }
    return "Just now";
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let curr = 0;
    const step = Math.max(target / 30, 1);
    const interval = setInterval(() => {
        curr += step;
        if (curr >= target) { el.textContent = target; clearInterval(interval); }
        else el.textContent = Math.floor(curr);
    }, 30);
}

function startRealTimeTracking() {
    fetchGitHubData();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(fetchGitHubData, REFRESH_INTERVAL);
}

function showLoadingState() { document.querySelectorAll(".stat-number").forEach(s => s.style.opacity = "0.5"); }
function hideLoadingState() { document.querySelectorAll(".stat-number").forEach(s => s.style.opacity = "1"); }

function updateRefreshStatus(date) {
    let el = document.getElementById("last-refresh");
    if (!el) {
        el = document.createElement("p");
        el.id = "last-refresh";
        el.className = "refresh-text";
        const title = document.querySelector("#github-activity .section-title");
        if (title) title.after(el);
    }
    el.innerHTML = `<i class="fas fa-sync-alt"></i> Last updated: ${date.toLocaleTimeString()}`;
}

function addManualRefreshButton() {
    if (document.getElementById("manual-refresh")) return;
    const btn = document.createElement("button");
    btn.id = "manual-refresh";
    btn.innerHTML = '<i class="fas fa-redo"></i> Refresh Data';
    btn.className = "cta-button secondary small";
    btn.onclick = () => fetchGitHubData(true);
    const feed = document.querySelector(".activity-feed-container");
    if (feed) feed.prepend(btn);
}
