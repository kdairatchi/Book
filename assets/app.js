// CyberCrimeFighter Books - Main JavaScript
// All data comes from /data/books.json

// State
let allBooks = [];
let allTags = [];
let filteredBooks = [];
let currentSearch = '';
let activeTags = new Set();

// DOM Elements
const booksGrid = document.getElementById('books-grid');
const tagFilters = document.getElementById('tag-filters');
const searchInput = document.getElementById('search-input');
const featuredBookContainer = document.getElementById('featured-book-container');
const testimonialsContainer = document.getElementById('testimonials-container');

// Mobile Menu Setup
function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.textContent = '☰';
            });
        });
    }
}

// Load Books Data
async function loadBooks() {
    try {
        const response = await fetch('data/books.json');
        const data = await response.json();
        
        allBooks = data.books;
        allTags = data.tags || extractTagsFromBooks();
        
        // Set featured book (first book with featured: true)
        const featuredBook = allBooks.find(book => book.featured) || allBooks[0];
        displayFeaturedBook(featuredBook);
        
        // Set up filters
        setupTagFilters();
        
        // Display all books initially
        filteredBooks = [...allBooks];
        displayBooks(filteredBooks);
        
        // Display testimonials
        displayTestimonials();
        
    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = '<p class="error">Error loading books. Please try again later.</p>';
    }
}

// Extract unique tags from books if not provided
function extractTagsFromBooks() {
    const tags = new Set();
    allBooks.forEach(book => {
        book.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
}

// Display Featured Book
function displayFeaturedBook(book) {
    if (!featuredBookContainer) return;
    
    featuredBookContainer.innerHTML = `
        <div class="featured-book-cover">
            <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
        </div>
        <div class="featured-book-info">
            <h3>${book.title}</h3>
            <p class="featured-book-subtitle">${book.subtitle}</p>
            <p class="featured-book-description">${book.description}</p>
            <div class="featured-book-price">$${book.price.toFixed(2)}</div>
            <div class="featured-book-tags">
                ${book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="featured-book-buttons">
                <a href="${book.samplePdf}" target="_blank" class="btn btn-secondary">Read Sample</a>
                <a href="${book.stripeLink}" target="_blank" class="btn btn-primary">Buy Now</a>
                <a href="book.html?slug=${book.slug}" class="btn btn-secondary">Learn More</a>
            </div>
        </div>
    `;
}

// Setup Tag Filters
function setupTagFilters() {
    if (!tagFilters) return;
    
    tagFilters.innerHTML = `
        <button class="tag-filter ${activeTags.size === 0 ? 'active' : ''}" data-tag="all">
            All Books
        </button>
        ${allTags.map(tag => `
            <button class="tag-filter" data-tag="${tag}">
                ${tag}
            </button>
        `).join('')}
    `;
    
    // Add event listeners
    tagFilters.querySelectorAll('.tag-filter').forEach(button => {
        button.addEventListener('click', () => {
            const tag = button.getAttribute('data-tag');
            
            if (tag === 'all') {
                activeTags.clear();
            } else {
                if (activeTags.has(tag)) {
                    activeTags.delete(tag);
                } else {
                    activeTags.add(tag);
                }
            }
            
            // Update active states
            updateFilterStates();
            
            // Filter books
            filterBooks();
        });
    });
}

// Update Filter Button States
function updateFilterStates() {
    if (!tagFilters) return;
    
    tagFilters.querySelectorAll('.tag-filter').forEach(button => {
        const tag = button.getAttribute('data-tag');
        
        if (tag === 'all') {
            button.classList.toggle('active', activeTags.size === 0);
        } else {
            button.classList.toggle('active', activeTags.has(tag));
        }
    });
}

// Setup Search Input
function setupFilters() {
    if (!searchInput) return;
    
    // Search input
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        filterBooks();
    });
    
    // Debounce search
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value.toLowerCase().trim();
            filterBooks();
        }, 300);
    });
}

// Filter Books based on search and tags
function filterBooks() {
    filteredBooks = allBooks.filter(book => {
        // Search filter
        const matchesSearch = !currentSearch || 
            book.title.toLowerCase().includes(currentSearch) ||
            book.description.toLowerCase().includes(currentSearch) ||
            book.tags.some(tag => tag.toLowerCase().includes(currentSearch));
        
        // Tag filter
        const matchesTags = activeTags.size === 0 || 
            book.tags.some(tag => activeTags.has(tag));
        
        return matchesSearch && matchesTags;
    });
    
    displayBooks(filteredBooks);
}

// Display Books Grid
function displayBooks(books) {
    if (!booksGrid) return;
    
    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3>No books found</h3>
                <p>Try adjusting your search or filters</p>
                <button class="btn btn-secondary" onclick="clearFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    booksGrid.innerHTML = books.map(book => `
        <div class="book-card">
            <img src="${book.coverImage}" alt="${book.title}" class="book-card-cover" loading="lazy">
            <div class="book-card-content">
                <h3 class="book-card-title">${book.title}</h3>
                <p class="book-card-description">${book.description}</p>
                <div class="book-card-price">$${book.price.toFixed(2)}</div>
                <div class="book-card-tags">
                    ${book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="book-card-actions">
                    <a href="${book.samplePdf}" target="_blank" class="btn btn-secondary btn-small">Read Sample</a>
                    <a href="${book.stripeLink}" target="_blank" class="btn btn-primary btn-small">Buy Now</a>
                    <a href="book.html?slug=${book.slug}" class="btn btn-secondary btn-small">Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Display Testimonials
function displayTestimonials() {
    if (!testimonialsContainer) return;
    
    // Collect all testimonials from all books
    const allTestimonials = [];
    allBooks.forEach(book => {
        if (book.testimonials && Array.isArray(book.testimonials)) {
            book.testimonials.forEach(testimonial => {
                allTestimonials.push({
                    ...testimonial,
                    bookTitle: book.title
                });
            });
        }
    });
    
    // Take up to 6 testimonials
    const testimonialsToShow = allTestimonials.slice(0, 6);
    
    if (testimonialsToShow.length === 0) {
        testimonialsContainer.innerHTML = `
            <div class="no-testimonials" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p>No testimonials yet. Be the first to review!</p>
            </div>
        `;
        return;
    }
    
    testimonialsContainer.innerHTML = testimonialsToShow.map(testimonial => `
        <div class="testimonial-card">
            <p class="testimonial-text">"${testimonial.text}"</p>
            <div class="testimonial-author">
                <strong>${testimonial.author}</strong>
                <br>
                <small>Reader of "${testimonial.bookTitle}"</small>
            </div>
        </div>
    `).join('');
}

// Clear All Filters
function clearFilters() {
    currentSearch = '';
    activeTags.clear();
    
    if (searchInput) searchInput.value = '';
    updateFilterStates();
    filterBooks();
}

// Book Detail Page Functions
async function loadBookDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch('data/books.json');
        const data = await response.json();
        const book = data.books.find(b => b.slug === slug);
        
        if (!book) {
            window.location.href = 'index.html';
            return;
        }
        
        displayBookDetail(book);
        updatePageMetadata(book);
        
    } catch (error) {
        console.error('Error loading book detail:', error);
        const container = document.getElementById('book-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="error" style="text-align: center; padding: 3rem;">
                    <h2>Error Loading Book</h2>
                    <p>Please try again later.</p>
                    <a href="index.html" class="btn btn-primary">Back to Store</a>
                </div>
            `;
        }
    }
}

// Display Book Detail
function displayBookDetail(book) {
    const container = document.getElementById('book-detail-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="book-detail">
            <div class="book-detail-cover">
                <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
            </div>
            <div class="book-detail-info">
                <h1>${book.title}</h1>
                <p class="page-subtitle">${book.subtitle}</p>
                
                <div class="book-detail-description">
                    <h3>Description</h3>
                    <p>${book.longDescription || book.description}</p>
                </div>
                
                <div class="book-detail-meta">
                    <div class="meta-item">
                        <span class="meta-label">Pages</span>
                        <span class="meta-value">${book.details?.pages || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Format</span>
                        <span class="meta-value">${book.details?.format || 'PDF, EPUB, MOBI'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Last Updated</span>
                        <span class="meta-value">${book.details?.updated || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Language</span>
                        <span class="meta-value">${book.details?.language || 'English'}</span>
                    </div>
                </div>
                
                <div class="book-detail-tags">
                    <h3>Topics Covered</h3>
                    <div class="featured-book-tags">
                        ${book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="book-detail-price">
                    <h2>$${book.price.toFixed(2)}</h2>
                    <p>One-time payment, lifetime updates</p>
                </div>
                
                <div class="book-detail-buttons">
                    <a href="${book.samplePdf}" target="_blank" class="btn btn-secondary">Read Sample PDF</a>
                    <a href="${book.stripeLink}" target="_blank" class="btn btn-primary">Buy Now</a>
                </div>
            </div>
        </div>
        
        ${book.testimonials && book.testimonials.length > 0 ? `
        <div class="testimonials-section">
            <h2>What Readers Say</h2>
            <div class="testimonials-grid">
                ${book.testimonials.map(t => `
                    <div class="testimonial-card">
                        <p class="testimonial-text">"${t.text}"</p>
                        <div class="testimonial-author">${t.author}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 3rem;">
            <a href="index.html" class="btn btn-secondary">← Back to All Books</a>
        </div>
    `;
}

// Update Page Metadata for SEO
function updatePageMetadata(book) {
    document.title = `${book.title} - CyberCrimeFighter Books`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', book.description);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle) ogTitle.setAttribute('content', book.title);
    if (ogDescription) ogDescription.setAttribute('content', book.description);
    if (ogImage) ogImage.setAttribute('content', window.location.origin + '/' + book.coverImage);
}

// Initialize based on current page
function init() {
    const path = window.location.pathname;
    
    if (path.includes('book.html')) {
        loadBookDetail();
    } else if (path.includes('index.html') || path === '/') {
        loadBooks();
        setupFilters();
    }
    
    setupMobileMenu();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
