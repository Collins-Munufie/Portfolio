// Configuration
const GITHUB_USERNAME = "Collins-Munufie"; 
const REFRESH_INTERVAL = 60000; 

let refreshTimer;
let contributionChart, languagesChart, repoStatsChart;

// Mobile Navigation Toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links a');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Form Submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    alert(`Thank you, ${name}! Your message has been sent successfully. I'll get back to you soon at ${email}.`);
    
    contactForm.reset();
});

// Smooth scroll for navigation links
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

// Add scroll effect to navigation
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.style.boxShadow = '0 2px 20px rgba(0, 217, 255, 0.3)';
    } else {
        nav.style.boxShadow = '0 2px 20px rgba(0, 217, 255, 0.1)';
    }
});

// GitHub Activity Tracking Functions
async function fetchGitHubData() {
    try {
        showLoadingState();

        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const userData = await userResponse.json();

        // Fetch repositories
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        const reposData = await reposResponse.json();

        // Calculate total stars
        const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);

        // Animate and update stats
        animateCounter('repos-count', userData.public_repos);
        animateCounter('stars-count', totalStars);
        animateCounter('followers-count', userData.followers);
        
        // Update profile info
        document.getElementById('github-avatar').src = userData.avatar_url;
        document.getElementById('github-name').textContent = userData.name || userData.login;
        document.getElementById('github-bio').textContent = userData.bio || 'Cloud DevOps Engineer';
        document.getElementById('github-link').href = userData.html_url;

        // Display recent repositories
        displayRecentRepos(reposData.slice(0, 6));

        // Fetch and display charts
        await fetchContributionsAndCreateChart();
        createLanguagesChart(reposData);
        createRepoStatsChart(reposData);

        updateLastRefreshTime();
        hideLoadingState();

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        document.getElementById('github-name').textContent = 'Unable to load GitHub data';
        document.getElementById('github-bio').textContent = 'Please check your internet connection or GitHub username';
        hideLoadingState();
    }
}

async function fetchContributionsAndCreateChart() {
    try {
        const eventsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`);
        const eventsData = await eventsResponse.json();
        
        // Group contributions by date
        const contributionsByDate = {};
        const today = new Date();
        
        // Initialize last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            contributionsByDate[dateKey] = 0;
        }
        
        // Count contributions
        let totalCommits = 0;
        eventsData.forEach(event => {
            const eventDate = event.created_at.split('T')[0];
            if (contributionsByDate.hasOwnProperty(eventDate)) {
                if (event.type === 'PushEvent') {
                    const commits = event.payload.commits ? event.payload.commits.length : 0;
                    contributionsByDate[eventDate] += commits;
                    totalCommits += commits;
                } else if (event.type === 'CreateEvent' || event.type === 'PullRequestEvent') {
                    contributionsByDate[eventDate] += 1;
                }
            }
        });
        
        animateCounter('commits-count', totalCommits);
        
        // Create chart
        createContributionChart(contributionsByDate);
        
    } catch (error) {
        document.getElementById('commits-count').textContent = 'N/A';
        console.error('Error fetching contributions:', error);
    }
}

function createContributionChart(contributionsByDate) {
    const ctx = document.getElementById('contribution-chart');
    if (!ctx) return;
    
    const dates = Object.keys(contributionsByDate);
    const values = Object.values(contributionsByDate);
    
    // Format dates for display
    const labels = dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Destroy existing chart if it exists
    if (contributionChart) {
        contributionChart.destroy();
    }
    
    contributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Contributions',
                data: values,
                borderColor: '#00d9ff',
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#00d9ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.95)',
                    titleColor: '#00d9ff',
                    bodyColor: '#fff',
                    borderColor: '#00d9ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a0aec0',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 217, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#a0aec0',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createLanguagesChart(reposData) {
    const ctx = document.getElementById('languages-chart');
    if (!ctx) return;
    
    // Count languages
    const languageCounts = {};
    reposData.forEach(repo => {
        if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
    });
    
    // Sort and get top 5
    const sortedLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const labels = sortedLanguages.map(([lang]) => lang);
    const data = sortedLanguages.map(([, count]) => count);
    
    // Destroy existing chart if it exists
    if (languagesChart) {
        languagesChart.destroy();
    }
    
    languagesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#00d9ff',
                    '#7c3aed',
                    '#f59e0b',
                    '#10b981',
                    '#ef4444'
                ],
                borderColor: '#1a1f3a',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0aec0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.95)',
                    titleColor: '#00d9ff',
                    bodyColor: '#fff',
                    borderColor: '#00d9ff',
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

function createRepoStatsChart(reposData) {
    const ctx = document.getElementById('repo-stats-chart');
    if (!ctx) return;
    
    // Calculate stats
    const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalWatchers = reposData.reduce((sum, repo) => sum + repo.watchers_count, 0);
    const totalIssues = reposData.reduce((sum, repo) => sum + repo.open_issues_count, 0);
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    
    // Destroy existing chart if it exists
    if (repoStatsChart) {
        repoStatsChart.destroy();
    }
    
    repoStatsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Stars', 'Forks', 'Watchers', 'Open Issues'],
            datasets: [{
                label: 'Count',
                data: [totalStars, totalForks, totalWatchers, totalIssues],
                backgroundColor: [
                    'rgba(0, 217, 255, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    '#00d9ff',
                    '#7c3aed',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 58, 0.95)',
                    titleColor: '#00d9ff',
                    bodyColor: '#fff',
                    borderColor: '#00d9ff',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a0aec0',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 217, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#a0aec0'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function displayRecentRepos(repos) {
    const reposContainer = document.querySelector('.repos-grid');
    
    if (!reposContainer) return;
    
    reposContainer.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" target="_blank" class="repo-card" style="text-decoration: none; color: inherit;">
            <h5>${repo.name}</h5>
            <p>${repo.description || 'No description available'}</p>
            <div class="repo-meta">
                <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                ${repo.language ? `<span><i class="fas fa-circle"></i> ${repo.language}</span>` : ''}
            </div>
            <div class="repo-updated">Updated: ${formatDate(repo.updated_at)}</div>
        </a>
    `).join('');
}

function animateCounter(elementId, targetValue) {
  const element = document.getElementById(elementId);
  const currentValue = parseInt(element.textContent) || 0;
  const duration = 1000;
  const steps = 30;
  const increment = (targetValue - currentValue) / steps;
  let current = currentValue;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current += increment;

    if (step >= steps) {
      element.textContent = targetValue;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, duration / steps);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function showLoadingState() {
  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach((stat) => {
    stat.style.opacity = "0.5";
  });
}

function hideLoadingState() {
  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach((stat) => {
    stat.style.opacity = "1";
  });
}

function updateLastRefreshTime() {
  let refreshElement = document.getElementById("last-refresh");
  if (!refreshElement) {
    const githubSection = document.querySelector(
      "#github-activity .section-title"
    );
    refreshElement = document.createElement("p");
    refreshElement.id = "last-refresh";
    refreshElement.style.cssText =
      "text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin-top: -1.5rem; margin-bottom: 1rem;";
    githubSection.after(refreshElement);
  }

  const now = new Date();
  refreshElement.innerHTML = `<i class="fas fa-sync-alt"></i> Last updated: ${now.toLocaleTimeString()} | Auto-refresh in ${
    REFRESH_INTERVAL / 1000
  }s`;
}

function startRealTimeTracking() {
  fetchGitHubData();
  refreshTimer = setInterval(() => {
    console.log("Refreshing GitHub data...");
    fetchGitHubData();
  }, REFRESH_INTERVAL);
}

function stopRealTimeTracking() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    console.log("GitHub real-time tracking stopped");
  }
}

function addManualRefreshButton() {
  const githubSection = document.querySelector("#github-activity");
  if (!githubSection) return;

  const refreshButton = document.createElement("button");
  refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Now';
  refreshButton.className = "refresh-button";
  refreshButton.style.cssText = `
        display: block;
        margin: -1rem auto 2rem;
        padding: 0.7rem 1.5rem;
        background: var(--accent-gradient);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        transition: transform 0.3s;
    `;

  refreshButton.addEventListener("click", () => {
    refreshButton.querySelector("i").style.animation = "spin 1s linear";
    fetchGitHubData();
    setTimeout(() => {
      refreshButton.querySelector("i").style.animation = "";
    }, 1000);
  });

  refreshButton.addEventListener("mouseenter", () => {
    refreshButton.style.transform = "translateY(-2px)";
  });

  refreshButton.addEventListener("mouseleave", () => {
    refreshButton.style.transform = "translateY(0)";
  });

  const title = githubSection.querySelector(".section-title");
  title.after(refreshButton);
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  startRealTimeTracking();
  addManualRefreshButton();
});

// Stop tracking when user leaves page (optional, saves API calls)
window.addEventListener("beforeunload", () => {
  stopRealTimeTracking();
});

// Pause tracking when tab is not visible (saves API calls)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopRealTimeTracking();
  } else {
    startRealTimeTracking();
  }
});