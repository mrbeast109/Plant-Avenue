
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching for Products
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            // In a real app, this would filter products. 
            // For now, we just visually switch tabs.
            console.log(`Switched to tab: ${btn.textContent}`);
        });
    });

    // Simple Mobile Menu Toggle Hook
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Optional: Change icon
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }
});

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        document.body.classList.add('loaded');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// Scroll Fade-in Animation Observer
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Run once
        }
    });
}, observerOptions);

const fadeElements = document.querySelectorAll('.fade-in-section');
fadeElements.forEach(el => observer.observe(el));

// --- Shopping Cart Logic ---

// State
let cart = JSON.parse(localStorage.getItem('plantAvenueCart')) || [];

// Update Cart Count Badge
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        // Small animation
        if (totalItems > 0) {
            el.style.transform = 'scale(1.2)';
            setTimeout(() => el.style.transform = 'scale(1)', 200);
        }
    });
}

// Add to Cart Function
function addToCart(product) {
    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('plantAvenueCart', JSON.stringify(cart));
    updateCartCount();
    showToast(`Added ${product.name} to cart!`);
}

// Simple Toast Notification
function showToast(message) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        document.body.appendChild(toast);

        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = 'var(--primary-green)';
        toast.style.color = 'white';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }

    toast.textContent = message;

    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Attach Event Listeners to Add to Cart Buttons
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(); // Initialize count on page load

    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if wrapped in anchor or form

            // Traverse DOM to find product details
            const card = btn.closest('.product-card');
            if (card) {
                const name = card.querySelector('h3').textContent;
                const priceText = card.querySelector('.price').textContent;
                const price = parseFloat(priceText.replace('$', ''));
                const imageSrc = card.querySelector('img').src;

                addToCart({ name, price, imageSrc });
            }
        });
    });

    // --- Cart Page Specific Logic ---
    if (document.querySelector('.cart-page')) {
        renderCartItems();

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    alert("Your cart is empty!");
                    return;
                }
                alert("Thank you for your purchase! Redirecting to checkout...");
                cart = [];
                localStorage.setItem('plantAvenueCart', JSON.stringify(cart));
                updateCartCount();
                renderCartItems();
            });
        }
    }
});

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return; // Not on the cart page

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Your cart is currently empty. <br><br> <a href="home.html" class="btn btn-primary">Go to Shop</a></p>';
        updateCartSummary(0);
        return;
    }

    container.innerHTML = ''; // Clear loading text
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <img src="${item.imageSrc}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <span>Qty: ${item.quantity}</span>
                </div>
            </div>
            <button class="remove-item-btn" data-index="${index}" aria-label="Remove item">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(cartItemDiv);
    });

    // Add event listeners to remove buttons
    const removeBtns = container.querySelectorAll('.remove-item-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = btn.getAttribute('data-index');
            cart.splice(index, 1);
            localStorage.setItem('plantAvenueCart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        });
    });

    updateCartSummary(subtotal);
}

function updateCartSummary(subtotal) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const handlingEl = document.getElementById('cart-handling');
    const deliveryEl = document.getElementById('cart-delivery');
    const totalEl = document.getElementById('cart-total');

    if (!subtotalEl || !handlingEl || !deliveryEl || !totalEl) return;

    if (subtotal === 0) {
        subtotalEl.textContent = '$0.00';
        handlingEl.textContent = '$0.00';
        deliveryEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }

    const handlingFee = subtotal * 0.05;
    const deliveryCharge = subtotal > 60 ? 0 : 10;
    const total = subtotal + handlingFee + deliveryCharge;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    handlingEl.textContent = `$${handlingFee.toFixed(2)}`;
    deliveryEl.textContent = deliveryCharge === 0 ? 'Free' : `$${deliveryCharge.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}
