// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    initNavigation();
    initScrollEffects();
    initForms();
    initVideoHandling();
    initBookingSystem();
    initEventDetailsPage();
}

function initNavigation() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) {
        console.warn('Navigation elements not found');
        return;
    }

    menuBtn.addEventListener('click', () => toggleMenu(menuBtn, navLinks));

    // Improved outside click handling
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!navLinks.contains(target) && !menuBtn.contains(target)) {
            closeMenu(menuBtn, navLinks);
        }
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

    // Check if user is logged in
    checkLoginStatus();
}

function checkLoginStatus() {
    const username = localStorage.getItem('username');
    const loginLink = document.querySelector('.nav-links a[href="login.html"]');
    
    if (username && loginLink) {
        // Create dropdown for logged in user
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        userDropdown.innerHTML = `
            <button class="user-button">
                <i class="fas fa-user"></i>
                <span>${username}</span>
            </button>
            <div class="dropdown-content">
                <a href="my_tickets.HTML">My Tickets</a>
                <a href="#" onclick="handleLogout(event)">Logout</a>
            </div>
        `;
        
        loginLink.replaceWith(userDropdown);
    }
}

function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;

    // Add your authentication logic here
    // For demo, just store the username
    localStorage.setItem('username', username);
    
    // Redirect to home page
    window.location.href = 'index.html';
}

function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

function toggleMenu(btn, nav) {
    if (!btn || !nav) return;
    
    const isExpanded = nav.classList.toggle('active');
    btn.setAttribute('aria-expanded', String(isExpanded));
    btn.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
}

function closeMenu(btn, nav) {
    if (!btn || !nav) return;
    
    nav.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
}

function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
}

function initScrollEffects() {
    // Intersection Observer for animations
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1 }
    );

    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.section-title, .event-card, .ticket-card, .info-item'
    );

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease-out';
        observer.observe(element);
    });
}

function initForms() {
    // Form validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', validateForm);
    });
}

function validateForm(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    const errorMessage = document.getElementById('error-message');
    
    // Reset previous errors
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    let hasErrors = false;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            hasErrors = true;
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.setAttribute('aria-invalid', 'false');
        }
    });
    
    if (hasErrors) {
        showError(errorMessage, 'Please fill in all required fields');
        return false;
    }

    // Enhanced email validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && !isValidEmail(emailInput.value)) {
        showError(errorMessage, 'Please enter a valid email address');
        return false;
    }

    // Password validation if present
    const password = form.querySelector('input[type="password"]');
    if (password && password.value.length < 6) {
        showError(errorMessage, 'Password must be at least 6 characters');
        return false;
    }

    // Submit form if validation passes
    form.submit();
    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(element, message, duration = 3000) {
    if (!element) return;
    
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

function initVideoHandling() {
    const video = document.getElementById('bgVideo');
    if (!video) return;

    const handleVideoPlay = () => {
        video.play().catch(error => {
            console.warn('Video autoplay failed:', error);
            video.closest('.hero')?.classList.add('video-fallback');
        });
    };

    video.addEventListener('loadeddata', handleVideoPlay);
    video.addEventListener('ended', () => video.play());
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
        document.hidden ? video.pause() : video.play();
    });
}

function initBookingSystem() {
    // Only attach event listeners to Purchase Ticket buttons
    document.querySelectorAll('.book-btn').forEach(button => {
        button.addEventListener('click', showPaymentModal);
    });

    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    // Close modal handlers
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn?.addEventListener('click', () => closeModal());

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

async function handleBooking(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const eventInfo = getEventInfo(button);
    
    if (await confirmBooking(eventInfo)) {
        await processBooking(button);
    }
}

function getEventInfo(button) {
    const eventCard = button.closest('.event-card');
    return {
        title: eventCard.querySelector('.event-info h3')?.textContent,
        date: eventCard.querySelector('.event-date')?.textContent
    };
}

function confirmBooking(eventInfo) {
    return new Promise(resolve => {
        resolve(confirm(`Confirm booking for:\n${eventInfo.title}\n${eventInfo.date}`));
    });
}

async function processBooking(button) {
    if (!button) return;
    
    const loadingState = {
        text: button.innerHTML,
        disabled: button.disabled
    };
    
    try {
        setButtonLoading(button, 'Processing...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        showSuccessMessage('Booking successful! Check your email for confirmation.');
    } catch (error) {
        console.error('Booking error:', error);
        showErrorMessage('Booking failed. Please try again.');
    } finally {
        restoreButtonState(button, loadingState);
    }
}

function setButtonLoading(button, text) {
    button.innerHTML = `<span>${text}</span> <i class="fas fa-spinner fa-spin"></i>`;
    button.disabled = true;
}

function restoreButtonState(button, state) {
    button.innerHTML = state.text;
    button.disabled = state.disabled;
}

function showSuccessMessage(message) {
    alert(message); // Consider replacing with a more modern notification system
}

function showErrorMessage(message) {
    alert(message); // Consider replacing with a more modern notification system
}

// Forgot Password Functions
function showForgotPassword(event) {
    event.preventDefault();
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function handleResetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;

        // Simulate API call - Replace with your actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        alert('Password reset link has been sent to your email');
        closeForgotPassword();
        
    } catch (error) {
        showError(errorMessage, 'Failed to send reset link. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('forgotPasswordModal');
    if (event.target === modal) {
        closeForgotPassword();
    }
}

function showPaymentModal(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const ticketType = button.closest('.ticket-type');
    const eventDetails = document.querySelector('.event-info-detailed');
    const modal = document.getElementById('paymentModal');
    
    if (!ticketType || !eventDetails || !modal) return;

    // Parse event date and format it
    const dateText = eventDetails.querySelector('.fa-calendar')?.parentNode.textContent.trim() || '';
    const timeText = eventDetails.querySelector('.fa-clock')?.parentNode.textContent.trim() || '';
    const date = parseDateString(dateText);
    const formattedDate = formatEventDate(date);
    
    // Get ticket details
    const ticketInfo = {
        title: ticketType.querySelector('h3')?.textContent || '',
        price: parsePrice(ticketType.querySelector('.price')?.textContent || '0'),
        location: eventDetails.querySelector('.fa-map-marker-alt')?.parentNode.textContent.trim() || ''
    };

    // Calculate fees
    const fees = calculateFees(ticketInfo.price);
    
    // Update modal content
    updateModalContent(modal, {
        date: formattedDate,
        time: timeText,
        ticketInfo,
        fees,
        location: ticketInfo.location
    });

    // Show modal
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Reset form and selections
    resetModalForm(modal);
}

function parseDateString(dateStr) {
    return new Date(dateStr);
}

function formatEventDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function parsePrice(priceStr) {
    return parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
}

function calculateFees(price) {
    return {
        serviceFee: price * 0.05,
        vat: price * 0.14,
        total: price * 1.19 // Price + 5% service fee + 14% VAT
    };
}

function updateModalContent(modal, { date, time, ticketInfo, fees, location }) {
    // Update event details
    modal.querySelector('.event-date').textContent = date;
    modal.querySelector('.event-time').textContent = time;
    modal.querySelector('.event-location').textContent = location;
    modal.querySelector('.ticket-info').textContent = ticketInfo.title;

    // Update price breakdown
    modal.querySelector('.subtotal').textContent = `${ticketInfo.price.toFixed(2)} EGP`;
    modal.querySelector('.service-fee').textContent = `${fees.serviceFee.toFixed(2)} EGP`;
    modal.querySelector('.vat-amount').textContent = `${fees.vat.toFixed(2)} EGP`;
    modal.querySelector('.total-amount').textContent = `${fees.total.toFixed(2)} EGP`;

    // Update payment method instructions
    const totalAmountElements = modal.querySelectorAll('.payment-instructions .total-amount');
    totalAmountElements.forEach(el => {
        el.textContent = `${fees.total.toFixed(2)} EGP`;
    });
}

function resetModalForm(modal) {
    const form = modal.querySelector('#paymentForm');
    if (form) {
        form.reset();
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
    modal.querySelectorAll('.payment-method').forEach(btn => btn.classList.remove('selected'));
    modal.querySelectorAll('.payment-details-section').forEach(section => {
        section.classList.remove('active');
    });
}

// Payment method selection handling
function selectPaymentMethod(e) {
    const buttons = document.querySelectorAll('.payment-method');
    buttons.forEach(btn => btn.classList.remove('selected'));
    e.currentTarget.classList.add('selected');
    
    const methodType = e.currentTarget.dataset.method;
    showPaymentDetails(methodType);
    updateFormRequirements(methodType);
}

function showPaymentDetails(methodType) {
    document.querySelectorAll('.payment-details-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const detailsSection = document.querySelector(`.${methodType}-details`);
    if (detailsSection) {
        detailsSection.classList.add('active');
    }
}

// Form validation and submission
document.getElementById('paymentForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validatePaymentForm(this)) {
        return;
    }

    const confirmBtn = this.querySelector('#confirmPayment');
    setLoadingState(confirmBtn, true);

    try {
        await processPayment();
        showSuccessMessage('Payment successful! Check your email for confirmation.');
        closeModal();
    } catch (error) {
        showErrorMessage('Payment failed. Please try again.');
    } finally {
        setLoadingState(confirmBtn, false);
    }
});

// Add these new utility functions
function validatePaymentForm(form) {
    const selectedMethod = document.querySelector('.payment-method.selected');
    if (!selectedMethod) {
        showErrorMessage('Please select a payment method');
        return false;
    }

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            markFieldAsError(field);
            isValid = false;
        } else {
            markFieldAsValid(field);
        }
    });

    if (!isValid) {
        showErrorMessage('Please fill in all required fields');
        return false;
    }

    if (!form.querySelector('#terms').checked) {
        showErrorMessage('Please accept the terms and conditions');
        return false;
    }

    return true;
}

function markFieldAsError(field) {
    field.closest('.form-group')?.classList.add('error');
}

function markFieldAsValid(field) {
    field.closest('.form-group')?.classList.remove('error');
}

function setLoadingState(button, isLoading) {
    if (!button) return;
    
    button.disabled = isLoading;
    button.innerHTML = isLoading ? 
        '<i class="fas fa-spinner fa-spin"></i> Processing...' : 
        'Confirm Payment';
}

async function processPayment(paymentDetails) {
    try {
        // Show loading state
        const button = document.getElementById('confirmPayment');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        // Validate payment details
        if (!validatePaymentDetails(paymentDetails)) {
            throw new Error('Invalid payment details');
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Handle success
        showSuccessMessage('Payment successful! Check your email for confirmation.');
        closeModal();
        return true;

    } catch (error) {
        console.error('Payment error:', error);
        showErrorMessage(error.message || 'Payment failed. Please try again.');
        return false;

    } finally {
        // Reset button state
        const button = document.getElementById('confirmPayment');
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Confirm Payment';
        }
    }
}

function validatePaymentDetails(details) {
    if (!details) return false;

    const {method, cardNumber, cvv, expiryDate} = details;

    switch (method) {
        case 'credit-card':
            return validateCreditCard(cardNumber, cvv, expiryDate);
        case 'vodafone-cash':
            return validatePhoneNumber(details.phone);
        case 'fawry':
            return true; // No validation needed
        default:
            return false;
    }
}

function processPayment() {
    // Simulate payment processing
    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
}

function closeModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Add event listeners for payment methods
document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', selectPaymentMethod);
});

// Add validation for credit card inputs
document.getElementById('cardNumber')?.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 16);
});

document.getElementById('expiryDate')?.addEventListener('input', function(e) {
    this.value = this.value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
});

document.getElementById('cvv')?.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});

// Add form validation and handling
document.getElementById('paymentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!document.querySelector('.payment-method.selected')) {
        alert('Please select a payment method');
        return;
    }
    
    const confirmBtn = document.getElementById('confirmPayment');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showSuccessMessage('Payment successful! Check your email for confirmation.');
        document.getElementById('paymentModal').style.display = 'none';
    } catch (error) {
        showErrorMessage('Payment failed. Please try again.');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Confirm Payment';
    }
});

// Event Details Page Initialization
function initEventDetailsPage() {
    if (!document.querySelector('.event-details-section')) return;

    // Initialize booking buttons
    document.querySelectorAll('.book-btn').forEach(button => {
        button.addEventListener('click', handleEventBooking);
    });
}

function handleEventBooking(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const ticketType = button.closest('.ticket-type');
    if (!ticketType) return;

    const eventDetails = {
        title: document.querySelector('.event-info-detailed h1')?.textContent,
        date: document.querySelector('.event-meta .fa-calendar')?.parentNode?.textContent,
        time: document.querySelector('.event-meta .fa-clock')?.parentNode?.textContent,
        location: document.querySelector('.event-meta .fa-map-marker-alt')?.parentNode?.textContent,
        ticketType: ticketType.querySelector('h3')?.textContent,
        price: parsePrice(ticketType.querySelector('.price')?.textContent || '0')
    };

    showBookingModal(eventDetails);
}

function showBookingModal(eventDetails) {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    // Update modal content with event details
    updateModalEventDetails(modal, eventDetails);

    // Show modal
    modal.style.display = 'block';
    document.body.classList.add('modal-open');

    // Reset form and payment methods
    resetModalForm(modal);

    // Initialize close handlers
    initializeModalCloseHandlers(modal);
}

function updateModalEventDetails(modal, details) {
    // Update event summary
    modal.querySelector('.event-date').textContent = details.date;
    modal.querySelector('.event-time').textContent = details.time;
    modal.querySelector('.event-location').textContent = details.location;
    modal.querySelector('.ticket-info').textContent = details.ticketType;

    // Calculate and update prices
    const fees = calculateFees(details.price);
    updatePriceBreakdown(modal, details.price, fees);
}

function initializeModalCloseHandlers(modal) {
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
}

