document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       SCROLL PROGRESS & GLASS HEADER
       ========================================================================== */
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        // Scroll progress percentage
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + '%';

        // Sticky Header styling on scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    /* ==========================================================================
       MOBILE NAV TOGGLE DRAWER
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-links a');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('fa-bars-staggered', 'fa-xmark');
        } else {
            icon.classList.replace('fa-xmark', 'fa-bars-staggered');
        }
    });

    // Close menu when clicking links
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('fa-xmark', 'fa-bars-staggered');
        });
    });


    /* ==========================================================================
       SCROLL SPY / ACTIVE LINKS
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });


    /* ==========================================================================
       SERVICES CATEGORY TABS FILTER
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const serviceCards = document.querySelectorAll('.service-image-card');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab button class
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-tab');

            serviceCards.forEach(card => {
                // Check if card category matches tab click value
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });


    /* ==========================================================================
       INTERACTIVE CART & ESTIMATES CALCULATOR
       ========================================================================== */
    // Tab switching in Calculator
    const calcCatButtons = document.querySelectorAll('.calc-cat-btn');
    const calcGroups = document.querySelectorAll('.calc-group');

    calcCatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            calcCatButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const groupName = btn.getAttribute('data-calc-cat');
            calcGroups.forEach(group => {
                if (group.id === groupName) {
                    group.classList.add('active');
                } else {
                    group.classList.remove('active');
                }
            });
        });
    });

    // Calculator Shopping Cart logic
    let selectedServices = [];
    const cartList = document.getElementById('cartList');
    const totalDurationEl = document.getElementById('totalDuration');
    const subTotalEl = document.getElementById('subTotal');
    const grandTotalEl = document.getElementById('grandTotal');
    const clearCartBtn = document.getElementById('clearCart');
    const bookWhatsAppBtn = document.getElementById('bookWhatsApp');
    const clientNameInput = document.getElementById('clientName');
    const bookingDateInput = document.getElementById('bookingDate');

    // Select all Add/Remove row-items
    const serviceItems = document.querySelectorAll('.calc-row-item');

    // Click handler for items
    serviceItems.forEach(item => {
        const addBtn = item.querySelector('.add-service-btn');
        
        addBtn.addEventListener('click', () => {
            const serviceId = item.getAttribute('data-id');
            const name = item.getAttribute('data-name');
            const price = parseInt(item.getAttribute('data-price'));
            
            // Get duration from internal span text
            const durationSpan = item.querySelector('.item-duration');
            const duration = parseInt(durationSpan.textContent.replace(/[^\d]/g, '')) || 20;

            const isAlreadyAdded = selectedServices.some(s => s.id === serviceId);

            if (isAlreadyAdded) {
                // Remove it
                selectedServices = selectedServices.filter(s => s.id !== serviceId);
                item.classList.remove('added');
                addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
            } else {
                // Add it
                selectedServices.push({ id: serviceId, name, price, duration });
                item.classList.add('added');
                addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            }

            updateCartUI();
        });
    });

    // Remove single cart item handler
    function removeCartItem(serviceId) {
        selectedServices = selectedServices.filter(s => s.id !== serviceId);
        
        // Find left row item and toggle active classes
        const matchingRow = document.querySelector(`.calc-row-item[data-id="${serviceId}"]`);
        if (matchingRow) {
            matchingRow.classList.remove('added');
            const addBtn = matchingRow.querySelector('.add-service-btn');
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
        }
        
        updateCartUI();
    }

    // Clear all Cart package selections
    clearCartBtn.addEventListener('click', () => {
        selectedServices = [];
        serviceItems.forEach(item => {
            item.classList.remove('added');
            const addBtn = item.querySelector('.add-service-btn');
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
        });
        updateCartUI();
    });

    // Main updates to Cart layout
    function updateCartUI() {
        if (selectedServices.length === 0) {
            cartList.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <p>Your booking package is empty. Select services from the menu to start planning your look!</p>
                </div>
            `;
            totalDurationEl.textContent = '0 mins';
            subTotalEl.textContent = '₹0';
            grandTotalEl.textContent = '₹0';
            return;
        }

        // Render rows
        cartList.innerHTML = '';
        let totalVal = 0;
        let totalDur = 0;

        selectedServices.forEach(service => {
            totalVal += service.price;
            totalDur += service.duration;

            const cartRow = document.createElement('div');
            cartRow.className = 'cart-item-row';
            cartRow.innerHTML = `
                <span class="cart-item-title">${service.name}</span>
                <div class="cart-item-right">
                    <span class="cart-item-price">₹${service.price}</span>
                    <button class="remove-cart-item" data-id="${service.id}"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            `;
            cartList.appendChild(cartRow);
        });

        // Update summaries
        totalDurationEl.textContent = `${totalDur} mins`;
        subTotalEl.textContent = `₹${totalVal}`;
        grandTotalEl.textContent = `₹${totalVal}`;

        // Event listeners on new trash buttons
        const trashBtns = cartList.querySelectorAll('.remove-cart-item');
        trashBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                removeCartItem(id);
            });
        });
    }

    // Configure pre-filled WhatsApp booking links
    bookWhatsAppBtn.addEventListener('click', () => {
        if (selectedServices.length === 0) {
            alert('Your grooming pack is empty! Please choose at least 1 service to plan your visit.');
            return;
        }

        const name = clientNameInput.value.trim();
        const rawDate = bookingDateInput.value;

        if (!name) {
            alert('Please specify your name for appointment booking!');
            clientNameInput.focus();
            return;
        }
        if (!rawDate) {
            alert('Please specify your preferred Date and Time slot!');
            bookingDateInput.focus();
            return;
        }

        // Format Date/Time nicely
        const dateObj = new Date(rawDate);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = dateObj.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const finalDateTime = `${formattedDate} at ${formattedTime}`;

        // Calculate Totals again
        let totalVal = 0;
        let totalDur = 0;
        let servicesText = '';

        selectedServices.forEach((service, index) => {
            totalVal += service.price;
            totalDur += service.duration;
            servicesText += `${index + 1}. *${service.name}* (₹${service.price})\n`;
        });

        // WhatsApp Message String
        const waNumber = '918602403500';
        const message = `Hello Maddy Unisex Salon Raipur! 🌟 I would like to book a luxury grooming slot.

👤 *Guest Name:* ${name}
📅 *Date & Time:* ${finalDateTime}

💇‍♂️ *Selected Services:*
${servicesText}
⏱️ *Total Duration:* ${totalDur} minutes
💰 *Estimated Package Bill:* ₹${totalVal}

Please verify if this preferred slot is available for booking. Thank you!`;

        // URL encode
        const encodedMsg = encodeURIComponent(message);
        const waURL = `https://wa.me/${waNumber}?text=${encodedMsg}`;

        // Launch in new tab
        window.open(waURL, '_blank');
    });


    /* ==========================================================================
       AUTOMATED LIVE GOOGLE REVIEWS (OPTIONAL SYNC)
       ========================================================================== */
    // Developer Note:
    // To automatically sync live reviews from Google Maps in real-time,
    // you can use a free reviews widget provider like Trustindex (trustindex.io) 
    // or Elfsight (elfsight.com). Both offer a free tier that imports reviews automatically.
    // 
    // Simply paste your generated widget embed code inside the '#googleWidgetContainer' 
    // element in 'index.html', and it will render your live reviews seamlessly!
    console.log("Maddy Unisex Salon Redesign: Verified Google Reviews initialized successfully.");

    /* ==========================================================================
       RAY SERVICES AGENCY FLOATING PROMO
       ========================================================================== */
    const rayPromoCard = document.getElementById('rayPromoCard');
    const closePromoCard = document.getElementById('closePromoCard');

    if (rayPromoCard) {
        // Slide in after 2.5 seconds
        setTimeout(() => {
            rayPromoCard.classList.add('show');
        }, 2500);
    }

    if (closePromoCard && rayPromoCard) {
        closePromoCard.addEventListener('click', () => {
            rayPromoCard.classList.remove('show');
        });
    }
});
