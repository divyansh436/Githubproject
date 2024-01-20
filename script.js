const itemsPerPage = 10;
let currentPage = 1;
let totalRepos = 0;

function fetchRepos() {
    var username = document.getElementById('username').value;
    var url = `https://api.github.com/users/${username}/repos?per_page=${itemsPerPage}&page=${currentPage}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch repositories. Status code: ${response.status}`);
            }

            var linkHeader = response.headers.get('Link');
            if (linkHeader) {
                var match = linkHeader.match(/page=(\d+)&per_page=\d+>; rel="last"/);
                totalRepos = match ? parseInt(match[1]) * itemsPerPage : 0;
            }
            return response.json();
        })
        .then(repos => {
            var repoContainer = document.getElementById('repoContainer');
            repoContainer.innerHTML = '';

            repos.forEach(repo => {
                var repoCard = document.createElement('div');
                repoCard.className = 'repo-card';
                repoCard.innerHTML = `
                    <div class="repo-name">${repo.name}</div>
                    <div class="repo-description">${repo.description || 'No description available'}</div>
                    <div class="repo-language">${repo.language ? 'Language: ' + repo.language : ''}</div>
                `;
                repoContainer.appendChild(repoCard);
            });

            displayPagination();
            updateNextPrevButtons();
        })
        .catch(error => {
            console.error('Failed to fetch repositories', error);
        });

    var userUrl = `https://api.github.com/users/${username}`;
    fetch(userUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch user details. Status code: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {

            document.getElementById('userName').textContent = user.name || user.login;

            var socialLinksDiv = document.getElementById('socialLinks');
            socialLinksDiv.innerHTML = '';

            if (user.blog) {
                var blogLink = createSocialLink('Blog', user.blog);
                socialLinksDiv.appendChild(blogLink);
            }

            if (user.twitter_username) {
                var twitterLink = createSocialLink('Twitter', `https://twitter.com/${user.twitter_username}`);
                socialLinksDiv.appendChild(twitterLink);
            }

            if (user.location) {
                var locationLink = createSocialLink('Location', user.location);
                socialLinksDiv.appendChild(locationLink);
            }

            if (user.html_url) {
                var githubLink = createSocialLink('GitHub', user.html_url);
                socialLinksDiv.appendChild(githubLink);
            }

            document.getElementById('avatar').src = user.avatar_url;
            document.getElementById('bio').textContent = user.bio || '';
        })
        .catch(error => {
            console.error('Failed to fetch user details', error);
        });
}

function displayPagination() {
    var totalPages = Math.ceil(totalRepos / itemsPerPage);
    var paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        var pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.className = 'page-link';
        pageLink.onclick = function () {
            currentPage = i;
            fetchRepos();
        };

        paginationDiv.appendChild(pageLink);
    }
}

function updateNextPrevButtons() {
    var previousPageBtn = document.getElementById('previousPageBtn');
    var nextPageBtn = document.getElementById('nextPageBtn');

    previousPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === Math.ceil(totalRepos / itemsPerPage);
}

function previousPage() {
    currentPage--;
    fetchRepos();
}

function nextPage() {
    currentPage++;
    fetchRepos();
}

function createSocialLink(name, value) {
    var socialLink = document.createElement('div');
    socialLink.textContent = `${name}: ${value}`;

    return socialLink;
}