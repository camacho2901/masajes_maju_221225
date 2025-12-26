// Galería de perfiles
class GalleryManager {
    constructor() {
        this.profiles = [];
        this.filteredProfiles = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.loadProfiles();
        this.setupFilters();
        this.setupSearch();
        this.setupLightbox();
    }

    async loadProfiles() {
        try {
            if (CONFIG.demoMode || !CONFIG.supabase.enabled) {
                EliteTalentApp.showNotification('Modo Demo: Usando datos locales', 'info');
                this.profiles = DEMO_DATA.profiles;
                this.filteredProfiles = [...this.profiles];
                this.renderProfiles();
                return;
            }

            EliteTalentApp.showNotification('Cargando perfiles...', 'info');
            const records = await supabaseService.getApprovedProfiles();
            
            this.profiles = records.map(record => ({
                id: record.id,
                name: record.nombre || 'Sin nombre',
                category: record.categoria || 'other',
                tags: this.getTagsByCategory(record.categoria),
                experience: record.experiencia || 'No especificado',
                rating: record.rating || 0,
                avatar: record.imagenes && record.imagenes[0] 
                    ? `<img src="${record.imagenes[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` 
                    : this.getAvatarByCategory(record.categoria),
                description: record.descripcion || '',
                portfolio: this.getPortfolioItems(record)
            }));

            this.filteredProfiles = [...this.profiles];
            this.renderProfiles();
            EliteTalentApp.showNotification(`${this.profiles.length} perfiles cargados`, 'success');
        } catch (error) {
            console.error('Error:', error);
            EliteTalentApp.showNotification('Error. Usando datos locales.', 'warning');
            this.profiles = DEMO_DATA.profiles;
            this.filteredProfiles = [...this.profiles];
            this.renderProfiles();
        }
    }

    getTagsByCategory(category) {
        const tags = {
            relajante: ['Relajante', 'Aromaterapia', 'Profesional'],
            terapeutico: ['Terapéutico', 'Descontracturante', 'Experta'],
            sensitivo: ['Sensitivo', 'Relajación Total', 'Discreta']
        };
        return tags[category] || tags.relajante;
    }

    getAvatarByCategory(category) {
        return '—';
    }

    getPortfolioItems(record) {
        const items = [];
        if (record.instagram) items.push(`Instagram: ${record.instagram}`);
        if (record.tiktok) items.push(`TikTok: ${record.tiktok}`);
        if (record.experiencia) items.push(`Experiencia: ${record.experiencia}`);
        return items.length > 0 ? items : ['Portfolio en desarrollo'];
    }

    renderProfiles() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.filteredProfiles.forEach((profile, index) => {
            const card = this.createProfileCard(profile);
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in-up');
            grid.appendChild(card);
        });

        setTimeout(() => {
            document.querySelectorAll('.profile-card').forEach(card => {
                card.classList.add('visible');
            });
        }, 100);
    }

    createProfileCard(profile) {
        const card = document.createElement('div');
        card.className = 'profile-card card-hover-effect';
        card.dataset.category = profile.category;
        card.dataset.profileId = profile.id;

        card.innerHTML = `
            <div class="profile-image">
                ${profile.avatar}
            </div>
            <div class="profile-info">
                <h3 class="profile-name">${profile.name}</h3>
                <p class="profile-category">${this.getCategoryName(profile.category)}</p>
                <div class="profile-tags">
                    ${profile.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="profile-stats">
                    <span>⭐ ${profile.rating}</span>
                    <span>📅 ${profile.experience}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.openLightbox(profile);
        });

        return card;
    }

    getCategoryName(category) {
        const names = {
            relajante: 'Masaje Relajante',
            terapeutico: 'Masaje Terapéutico',
            sensitivo: 'Masaje Sensitivo',
            otro: 'Otro'
        };
        return names[category] || category;
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.applyFilters();
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const debouncedSearch = this.debounce((value) => {
            this.searchTerm = value.toLowerCase();
            this.applyFilters();
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    applyFilters() {
        this.filteredProfiles = this.profiles.filter(profile => {
            const matchesFilter = this.currentFilter === 'all' || profile.category === this.currentFilter;
            const matchesSearch = this.searchTerm === '' || 
                profile.name.toLowerCase().includes(this.searchTerm) ||
                profile.category.toLowerCase().includes(this.searchTerm) ||
                profile.tags.some(tag => tag.toLowerCase().includes(this.searchTerm));
            
            return matchesFilter && matchesSearch;
        });

        this.renderProfiles();
    }

    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const closeBtn = document.getElementById('lightboxClose');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeLightbox();
            });
        }

        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox();
            }
        });
    }

    openLightbox(profile) {
        const lightbox = document.getElementById('lightbox');
        const body = document.getElementById('lightboxBody');
        
        if (!lightbox || !body) return;

        const currentIndex = this.filteredProfiles.findIndex(p => p.id === profile.id);
        const hasPrev = currentIndex > 0;
        const hasNext = currentIndex < this.filteredProfiles.length - 1;

        body.innerHTML = `
            <div class="lightbox-profile">
                <div class="lightbox-avatar" id="lightboxAvatar">${profile.avatar}</div>
                <h2>${profile.name}</h2>
                <p class="lightbox-category">${this.getCategoryName(profile.category)}</p>
                <p class="lightbox-description">${profile.description}</p>
                
                <div class="lightbox-tags">
                    ${profile.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <div class="lightbox-stats">
                    <div class="stat-item">
                        <strong>Rating:</strong> ⭐ ${profile.rating}
                    </div>
                    <div class="stat-item">
                        <strong>Experiencia:</strong> ${profile.experience}
                    </div>
                </div>
                
                <div class="lightbox-portfolio">
                    <h3>Portfolio</h3>
                    <ul>
                        ${profile.portfolio.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="lightbox-actions">
                    <button class="btn-primary" onclick="window.open('https://wa.me/59169245670?text=Hola, quiero reservar una cita', '_blank')">
                        Reservar por WhatsApp
                    </button>
                </div>
            </div>
            
            ${hasPrev ? `<button class="lightbox-nav lightbox-prev" onclick="galleryManager.navigateLightbox(${currentIndex - 1})">❮</button>` : ''}
            ${hasNext ? `<button class="lightbox-nav lightbox-next" onclick="galleryManager.navigateLightbox(${currentIndex + 1})">❯</button>` : ''}
        `;

        if (!document.getElementById('lightbox-styles')) {
            const style = document.createElement('style');
            style.id = 'lightbox-styles';
            style.textContent = `
            .lightbox-profile { text-align: center; }
            .lightbox-avatar { font-size: 4rem; margin-bottom: 20px; cursor: zoom-in; transition: transform 0.3s ease; }
            .lightbox-avatar:hover { transform: scale(1.1); }
            .lightbox-avatar.zoomed { font-size: 8rem; cursor: zoom-out; }
            .lightbox-category { color: var(--accent-pink); font-weight: 600; margin-bottom: 15px; }
            .lightbox-description { margin-bottom: 20px; opacity: 0.9; }
            .lightbox-tags { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
            .lightbox-stats { display: flex; justify-content: space-around; margin-bottom: 25px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; }
            .lightbox-portfolio h3 { color: var(--accent-pink); margin-bottom: 10px; }
            .lightbox-portfolio ul { list-style: none; padding: 0; }
            .lightbox-portfolio li { padding: 5px 0; opacity: 0.8; }
            .lightbox-actions { display: flex; gap: 15px; justify-content: center; margin-top: 25px; }
            .lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); background: var(--accent-pink); border: none; color: white; font-size: 2rem; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; transition: var(--transition); z-index: 10001; }
            .lightbox-nav:hover { background: var(--accent-purple); transform: translateY(-50%) scale(1.1); }
            .lightbox-prev { left: 20px; }
            .lightbox-next { right: 20px; }
        `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            const avatar = document.getElementById('lightboxAvatar');
            if (avatar) {
                avatar.addEventListener('click', () => {
                    avatar.classList.toggle('zoomed');
                });
            }
        }, 100);

        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            lightbox.style.opacity = '1';
        }, 10);

        this.setupLightboxKeyboard(currentIndex);
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
        
        document.removeEventListener('keydown', this.lightboxKeyHandler);
    }

    navigateLightbox(index) {
        if (index >= 0 && index < this.filteredProfiles.length) {
            this.openLightbox(this.filteredProfiles[index]);
        }
    }

    setupLightboxKeyboard(currentIndex) {
        this.lightboxKeyHandler = (e) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                this.navigateLightbox(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < this.filteredProfiles.length - 1) {
                this.navigateLightbox(currentIndex + 1);
            }
        };
        
        document.addEventListener('keydown', this.lightboxKeyHandler);
    }

    addToFavorites(profileId) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (!favorites.includes(profileId)) {
            favorites.push(profileId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            EliteTalentApp.showNotification('Agregado a favoritos ❤️', 'success');
        } else {
            EliteTalentApp.showNotification('Ya está en favoritos', 'info');
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

let galleryManager;

document.addEventListener('DOMContentLoaded', () => {
    galleryManager = new GalleryManager();
});
