const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadListings();
});

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Auth functions
async function checkAuth() {
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            currentUser = await res.json();
            updateUI();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            updateUI();
            hideModal('loginModal');
            alert('Login successful!');
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Login failed. Please try again.');
    }
}

async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            updateUI();
            hideModal('registerModal');
            alert('Registration successful!');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        alert('Registration failed. Please try again.');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    updateUI();
}

function updateUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');

    if (currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        document.getElementById('username').textContent = currentUser.username;
        document.getElementById('balance').textContent = `$${currentUser.balance?.toFixed(2) || '0.00'}`;
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

// Listing functions
async function loadListings() {
    try {
        const category = document.getElementById('categoryFilter').value;
        const sort = document.getElementById('sortFilter').value;
        
        let url = `${API_URL}/listings?sort=${sort}`;
        if (category) url += `&category=${category}`;

        const res = await fetch(url);
        const listings = await res.json();

        const grid = document.getElementById('listingsGrid');
        grid.innerHTML = '';

        if (listings.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No listings found</p>';
            return;
        }

        listings.forEach(listing => {
            const card = createListingCard(listing);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load listings:', error);
    }
}

function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.onclick = () => showListingDetail(listing._id);

    const categoryIcons = {
        games: '🎯',
        accounts: '👤',
        items: '⚔️',
        currency: '💰',
        services: '🛠️',
        other: '📦'
    };

    card.innerHTML = `
        <div class="listing-image">${categoryIcons[listing.category] || '📦'}</div>
        <div class="listing-info">
            <h3 class="listing-title">${escapeHtml(listing.title)}</h3>
            <div class="listing-price">$${listing.price.toFixed(2)}</div>
            <div class="listing-meta">
                <span>${listing.game}</span>
                <span>${listing.category}</span>
            </div>
            <div class="seller-info">
                <div class="seller-avatar"></div>
                <span>${listing.seller?.username || 'Seller'}</span>
                ${listing.seller?.rating ? `<span>⭐ ${listing.seller.rating.toFixed(1)}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

async function showListingDetail(id) {
    try {
        const res = await fetch(`${API_URL}/listings/${id}`);
        const listing = await res.json();

        const detailDiv = document.getElementById('listingDetail');
        detailDiv.innerHTML = `
            <div class="listing-detail-header">
                <h2 class="listing-detail-title">${escapeHtml(listing.title)}</h2>
                <div class="listing-detail-price">$${listing.price.toFixed(2)}</div>
            </div>
            <div class="listing-detail-description">
                <h3>Description</h3>
                <p>${escapeHtml(listing.description)}</p>
            </div>
            <div class="listing-meta" style="margin-bottom: 2rem;">
                <span><strong>Game:</strong> ${listing.game}</span>
                <span><strong>Category:</strong> ${listing.category}</span>
                <span><strong>Delivery:</strong> ${listing.delivery}</span>
                <span><strong>Views:</strong> ${listing.views}</span>
            </div>
            <div class="seller-info" style="margin-bottom: 2rem;">
                <div class="seller-avatar"></div>
                <div>
                    <strong>${listing.seller?.username || 'Seller'}</strong>
                    ${listing.seller?.rating ? `<div>Rating: ⭐ ${listing.seller.rating.toFixed(1)}</div>` : ''}
                </div>
            </div>
            ${currentUser && currentUser._id !== listing.seller?._id && listing.status === 'active' 
                ? `<button class="btn btn-primary buy-btn" onclick="buyListing('${listing._id}')">Buy Now</button>`
                : listing.status !== 'active' 
                    ? '<button class="btn btn-outline buy-btn" disabled>Sold Out</button>'
                    : ''
            }
        `;

        showModal('listingModal');
    } catch (error) {
        alert('Failed to load listing details');
    }
}

async function buyListing(id) {
    if (!currentUser) {
        alert('Please login to make a purchase');
        showModal('loginModal');
        return;
    }

    if (!confirm('Are you sure you want to buy this item?')) return;

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ listingId: id })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Purchase successful! Check your orders.');
            hideModal('listingModal');
            loadListings();
        } else {
            alert(data.message || 'Purchase failed');
        }
    } catch (error) {
        alert('Purchase failed. Please try again.');
    }
}

async function createListing(event) {
    event.preventDefault();

    if (!currentUser) {
        alert('Please login to create a listing');
        showModal('loginModal');
        return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const category = document.getElementById('category').value;
    const game = document.getElementById('game').value;

    try {
        const res = await fetch(`${API_URL}/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, price, category, game })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Listing created successfully!');
            document.getElementById('listingForm').reset();
            loadListings();
        } else {
            alert(data.message || 'Failed to create listing');
        }
    } catch (error) {
        alert('Failed to create listing. Please try again.');
    }
}

function filterByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    loadListings();
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
}

function searchListings() {
    const search = document.getElementById('searchInput').value;
    if (search) {
        // For now, just scroll to listings - backend search would need implementation
        alert(`Search functionality for "${search}" would be implemented here`);
        document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
    }
}

// Utility function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
