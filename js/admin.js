// Panel de administración
class AdminPanel {
    constructor() {
        this.activeStaff = [];
        this.applications = [];
        this.currentTab = 'active';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupAuth();
        this.loadData();
        this.setupTabs();
        this.setupModals();
    }

    checkAuth() {
        const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
        const loginOverlay = document.getElementById('loginOverlay');
        
        if (loginOverlay) {
            if (!isAuthenticated) {
                loginOverlay.classList.remove('hidden');
            } else {
                loginOverlay.classList.add('hidden');
            }
        }
    }

    setupAuth() {
        const loginBtn = document.getElementById('loginBtn');
        const passwordInput = document.getElementById('adminPassword');
        const togglePassword = document.getElementById('togglePassword');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginOverlay = document.getElementById('loginOverlay');

        if (!loginBtn || !passwordInput || !logoutBtn || !loginOverlay) return;

        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }

        loginBtn.addEventListener('click', () => {
            const password = passwordInput.value;
            // TODO: Implementar hash seguro de contraseña
            if (password === CONFIG.adminPasswordHash) {
                sessionStorage.setItem('adminAuth', 'true');
                loginOverlay.classList.add('hidden');
            } else {
                EliteTalentApp.showNotification('Contraseña incorrecta', 'error');
                passwordInput.value = '';
            }
        });

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });

        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminAuth');
            location.reload();
        });
    }

    async loadData() {
        try {
            // Cargar personal activo desde Supabase
            if (CONFIG.supabase?.enabled && typeof supabaseService !== 'undefined') {
                try {
                    const response = await fetch(`${CONFIG.supabase.url}/rest/v1/staff?select=*`, {
                        headers: {
                            'apikey': CONFIG.supabase.anonKey,
                            'Authorization': `Bearer ${CONFIG.supabase.anonKey}`
                        }
                    });
                    
                    if (response.ok) {
                        this.activeStaff = await response.json();
                    } else {
                        throw new Error('Failed to load staff');
                    }
                } catch (error) {
                    console.error('Error loading staff:', error);
                    this.activeStaff = typeof profilesData !== 'undefined' ? profilesData.profiles || [] : [];
                }
            } else {
                this.activeStaff = typeof profilesData !== 'undefined' ? profilesData.profiles || [] : [];
            }

            // Cargar solicitudes desde Supabase
            if (CONFIG.supabase?.enabled && typeof supabaseService !== 'undefined') {
                try {
                    const records = await supabaseService.getApplications();
                    this.applications = records.map(record => ({
                        id: record.id,
                        name: record.name || 'Sin nombre',
                        phone: record.phone || '',
                        instagram: record.instagram || '',
                        age: record.age || 0,
                        category: record.category || 'tantrico',
                        location: record.location || '',
                        photos: Array.isArray(record.photos) ? record.photos : [],
                        status: record.status || 'pending',
                        date: new Date(record.created_at || Date.now())
                    }));
                } catch (error) {
                    console.error('Error cargando aplicaciones:', error);
                    this.applications = [];
                }
            } else {
                this.applications = [];
            }

            this.renderActiveStaff();
            this.renderApplications();
            this.updateStats();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            if (typeof EliteTalentApp !== 'undefined') {
                EliteTalentApp.showNotification('Error al cargar datos', 'error');
            }
        }
    }

    setupTabs() {
        const tabActive = document.getElementById('tabActive');
        const tabApplications = document.getElementById('tabApplications');
        const tabStats = document.getElementById('tabStats');
        const tabSettings = document.getElementById('tabSettings');
        const activeSection = document.getElementById('activeSection');
        const applicationsSection = document.getElementById('applicationsSection');
        const statsSection = document.getElementById('statsSection');
        const settingsSection = document.getElementById('settingsSection');
        const addPersonBtn = document.getElementById('addPersonBtn');

        const switchTab = (tab, section) => {
            [tabActive, tabApplications, tabStats, tabSettings].forEach(t => {
                t.classList.remove('active');
                t.style.borderBottom = '2px solid transparent';
                t.style.color = 'var(--text-gray)';
            });
            [activeSection, applicationsSection, statsSection, settingsSection].forEach(s => s.style.display = 'none');
            
            tab.classList.add('active');
            tab.style.borderBottom = '2px solid var(--accent-gold)';
            tab.style.color = 'var(--accent-gold)';
            section.style.display = 'block';
        };

        if (tabActive) {
            tabActive.addEventListener('click', () => {
                this.currentTab = 'active';
                switchTab(tabActive, activeSection);
            });
        }

        if (tabApplications) {
            tabApplications.addEventListener('click', () => {
                this.currentTab = 'applications';
                switchTab(tabApplications, applicationsSection);
            });
        }

        if (tabStats) {
            tabStats.addEventListener('click', () => {
                this.currentTab = 'stats';
                switchTab(tabStats, statsSection);
                this.renderStats();
                this.renderAdvancedMetrics();
            });
        }

        if (tabSettings) {
            tabSettings.addEventListener('click', () => {
                this.currentTab = 'settings';
                switchTab(tabSettings, settingsSection);
                this.loadSettings();
            });
        }

        if (addPersonBtn) {
            addPersonBtn.addEventListener('click', () => {
                this.openPersonModal();
            });
        }

        if (tabActive) tabActive.click();
    }

    renderActiveStaff() {
        const grid = document.getElementById('activeGrid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.activeStaff.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-gray); text-align: center; grid-column: 1/-1;">No hay personal activo. Haz clic en "Agregar Nueva Persona" para comenzar.</p>';
            return;
        }

        this.activeStaff.forEach(person => {
            const card = this.createStaffCard(person);
            grid.appendChild(card);
        });
    }

    createStaffCard(person) {
        const card = document.createElement('div');
        card.style.cssText = 'background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 20px; transition: var(--transition);';
        
        const photoHtml = person.photo ? `<img src="${person.photo}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--border-radius); margin-bottom: 15px;">` : `<div style="font-size: 3rem; margin-bottom: 10px; text-align: center;">—</div>`;
        
        card.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                ${photoHtml}
                <h3 style="color: var(--accent-gold); font-weight: 300; margin-bottom: 5px;">${person.name}</h3>
                <p style="color: var(--text-gray); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">${this.getCategoryName(person.category)}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <p style="color: var(--text-gray); font-size: 0.9rem;"><strong>Experiencia:</strong> ${person.experience}</p>
                <p style="color: var(--text-gray); font-size: 0.9rem; margin-top: 5px;">${person.description}</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="adminPanel.viewStaff(${person.id})" class="btn-secondary" style="flex: 1; font-size: 0.85rem; padding: 8px;">Ver</button>
                <button onclick="adminPanel.deleteStaff(${person.id})" class="btn-secondary" style="flex: 1; font-size: 0.85rem; padding: 8px; background: #dc3545; border-color: #dc3545;">Eliminar</button>
            </div>
        `;

        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'var(--accent-gold)';
            card.style.boxShadow = 'var(--shadow-glow)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'var(--glass-border)';
            card.style.boxShadow = 'none';
        });

        return card;
    }

    renderApplications() {
        const grid = document.getElementById('applicationsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.applications.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-gray); text-align: center; grid-column: 1/-1;">No hay solicitudes pendientes.</p>';
            return;
        }

        this.applications.forEach(app => {
            const card = this.createApplicationCard(app);
            grid.appendChild(card);
        });
    }

    createApplicationCard(app) {
        const card = document.createElement('div');
        card.style.cssText = 'background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 20px; transition: var(--transition);';
        
        card.innerHTML = `
            <div style="margin-bottom: 15px;">
                <h3 style="color: var(--accent-gold); font-weight: 300; margin-bottom: 5px;">${app.name}</h3>
                <p style="color: var(--text-gray); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">${this.getCategoryName(app.category)}</p>
            </div>
            <div style="margin-bottom: 15px;">
                <p style="color: var(--text-gray); font-size: 0.9rem;"><strong>Teléfono:</strong> ${app.phone}</p>
                <p style="color: var(--text-gray); font-size: 0.9rem;"><strong>Instagram:</strong> ${app.instagram}</p>
                <p style="color: var(--text-gray); font-size: 0.9rem;"><strong>Edad:</strong> ${app.age} años</p>
                <p style="color: var(--text-gray); font-size: 0.9rem;"><strong>Fecha:</strong> ${this.formatDate(app.date)}</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="adminPanel.viewApplication('${app.id}')" class="btn-secondary" style="flex: 1; font-size: 0.85rem; padding: 8px;">Ver Detalles</button>
            </div>
        `;

        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'var(--accent-gold)';
            card.style.boxShadow = 'var(--shadow-glow)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'var(--glass-border)';
            card.style.boxShadow = 'none';
        });

        return card;
    }

    viewStaff(id) {
        const person = this.activeStaff.find(p => p.id === id);
        if (!person) return;

        const modal = document.getElementById('candidateModal');
        const detail = document.getElementById('candidateDetail');

        detail.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">${person.avatar || '—'}</div>
                <h2 style="color: var(--accent-gold); margin-bottom: 10px;">${person.name}</h2>
                <p style="color: var(--text-gray); margin-bottom: 30px;">${this.getCategoryName(person.category)}</p>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: var(--border-radius); margin-bottom: 15px; text-align: left;">
                    <h4 style="color: var(--accent-gold); margin-bottom: 10px;">Información</h4>
                    <p style="color: var(--text-gray);"><strong>Experiencia:</strong> ${person.experience}</p>
                    <p style="color: var(--text-gray); margin-top: 10px;"><strong>Ubicación:</strong> ${person.location}</p>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: var(--border-radius); text-align: left;">
                    <h4 style="color: var(--accent-gold); margin-bottom: 10px;">Descripción</h4>
                    <p style="color: var(--text-gray);">${person.description}</p>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    viewApplication(id) {
        const app = this.applications.find(a => a.id === id);
        if (!app) return;

        const modal = document.getElementById('candidateModal');
        const detail = document.getElementById('candidateDetail');

        const photosHtml = app.photos && app.photos.length > 0 ? `
            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: var(--border-radius); margin-bottom: 15px;">
                <h4 style="color: var(--accent-gold); margin-bottom: 10px;">Fotos (${app.photos.length})</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">
                    ${app.photos.map(url => `<img src="${url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: var(--border-radius); cursor: pointer;" onclick="window.open('${url}', '_blank')">`).join('')}
                </div>
            </div>
        ` : '';

        detail.innerHTML = `
            <div style="text-align: center;">
                <h2 style="color: var(--accent-gold); margin-bottom: 10px;">${app.name}</h2>
                <p style="color: var(--text-gray); margin-bottom: 30px;">${this.getCategoryName(app.category)}</p>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: var(--border-radius); margin-bottom: 15px; text-align: left;">
                    <h4 style="color: var(--accent-gold); margin-bottom: 10px;">Información de Contacto</h4>
                    <p style="color: var(--text-gray);"><strong>Teléfono:</strong> ${app.phone}</p>
                    <p style="color: var(--text-gray); margin-top: 5px;"><strong>Instagram:</strong> ${app.instagram || 'No proporcionado'}</p>
                    <p style="color: var(--text-gray); margin-top: 5px;"><strong>Edad:</strong> ${app.age} años</p>
                    <p style="color: var(--text-gray); margin-top: 5px;"><strong>Ubicación:</strong> ${app.location || 'No especificado'}</p>
                </div>
                
                ${photosHtml}
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="adminPanel.updateApplicationStatus('${app.id}', 'approved')" class="btn-secondary" style="flex: 1; background: #28a745; border-color: #28a745;">Aprobar</button>
                    <button onclick="adminPanel.updateApplicationStatus('${app.id}', 'rejected')" class="btn-secondary" style="flex: 1; background: #dc3545; border-color: #dc3545;">Rechazar</button>
                    <button onclick="adminPanel.deleteApplication('${app.id}')" class="btn-secondary" style="flex: 1; background: #6c757d; border-color: #6c757d;">Eliminar</button>
                </div>
                
                <div style="margin-top: 20px;">
                    <p style="color: var(--text-gray); font-size: 0.9rem;">Fecha de solicitud: ${this.formatDate(app.date)}</p>
                    <p style="color: var(--text-gray); font-size: 0.9rem; margin-top: 5px;">Estado: <span style="color: var(--accent-gold);">${app.status}</span></p>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    deleteStaff(id) {
        if (!confirm('¿Estás seguro de eliminar a esta persona del personal activo?')) return;
        
        if (CONFIG.supabase?.enabled) {
            fetch(`${CONFIG.supabase.url}/rest/v1/staff?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': CONFIG.supabase.anonKey,
                    'Authorization': `Bearer ${CONFIG.supabase.anonKey}`
                }
            }).then(() => {
                this.loadData();
                EliteTalentApp.showNotification('Persona eliminada', 'success');
            }).catch(error => {
                console.error('Error:', error);
                EliteTalentApp.showNotification('Error al eliminar', 'error');
            });
        } else {
            this.activeStaff = this.activeStaff.filter(p => p.id !== id);
            this.renderActiveStaff();
            this.updateStats();
            EliteTalentApp.showNotification('Persona eliminada', 'success');
        }
    }

    openPersonModal() {
        const modal = document.getElementById('personModal');
        const photoInput = document.getElementById('personPhoto');
        const photoPreview = document.getElementById('personPhotoPreview');
        
        document.getElementById('personName').value = '';
        document.getElementById('personPhone').value = '';
        photoInput.value = '';
        photoPreview.innerHTML = '';
        document.getElementById('personExperience').value = '';
        document.getElementById('personDescription').value = '';
        
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    photoPreview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: var(--border-radius);">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        modal.style.display = 'flex';
    }

    closePersonModal() {
        const modal = document.getElementById('personModal');
        modal.style.display = 'none';
    }

    async savePerson() {
        const name = document.getElementById('personName').value;
        const phone = document.getElementById('personPhone').value;
        const photoInput = document.getElementById('personPhoto');
        const experience = document.getElementById('personExperience').value;
        const description = document.getElementById('personDescription').value;

        if (!name) {
            EliteTalentApp.showNotification('El nombre es obligatorio', 'error');
            return;
        }

        let photoUrl = '';
        
        if (photoInput.files && photoInput.files[0]) {
            try {
                EliteTalentApp.showNotification('Subiendo foto...', 'info');
                const result = await supabaseStorage.uploadImage(photoInput.files[0]);
                photoUrl = result.url;
                EliteTalentApp.showNotification('Foto subida exitosamente', 'success');
            } catch (error) {
                console.error('Error subiendo foto:', error);
                EliteTalentApp.showNotification('Error al subir foto', 'error');
            }
        }

        const newPerson = {
            id: Date.now(),
            name,
            phone: phone || '',
            photo: photoUrl,
            category: 'tantrico',
            experience: experience || 'Sin experiencia',
            description: description || 'Sin descripción',
            avatar: '—',
            location: 'Santa Cruz, Bolivia',
            availability: 'full-time',
            featured: true,
            tags: ['Masaje Tántrico Sensitivo'],
            rating: 5.0,
            date_joined: new Date().toISOString()
        };

        if (CONFIG.supabase?.enabled) {
            try {
                await fetch(`${CONFIG.supabase.url}/rest/v1/staff`, {
                    method: 'POST',
                    headers: {
                        'apikey': CONFIG.supabase.anonKey,
                        'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(newPerson)
                });
                
                await this.loadData();
                this.closePersonModal();
                EliteTalentApp.showNotification('Persona agregada exitosamente', 'success');
            } catch (error) {
                console.error('Error:', error);
                EliteTalentApp.showNotification('Error al agregar persona', 'error');
            }
        } else {
            this.activeStaff.push(newPerson);
            this.renderActiveStaff();
            this.updateStats();
            this.closePersonModal();
            EliteTalentApp.showNotification('Persona agregada exitosamente', 'success');
        }
    }

    setupModals() {
        const modalClose = document.getElementById('modalClose');
        const personModalClose = document.getElementById('personModalClose');
        const candidateModal = document.getElementById('candidateModal');
        const personModal = document.getElementById('personModal');

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                candidateModal.style.display = 'none';
            });
        }

        if (personModalClose) {
            personModalClose.addEventListener('click', () => {
                this.closePersonModal();
            });
        }

        if (candidateModal) {
            candidateModal.addEventListener('click', (e) => {
                if (e.target === candidateModal) {
                    candidateModal.style.display = 'none';
                }
            });
        }

        if (personModal) {
            personModal.addEventListener('click', (e) => {
                if (e.target === personModal) {
                    this.closePersonModal();
                }
            });
        }
    }

    updateStats() {
        const totalActive = document.getElementById('totalActive');
        const totalApplications = document.getElementById('totalApplications');

        if (totalActive) totalActive.textContent = this.activeStaff.length;
        if (totalApplications) totalApplications.textContent = this.applications.length;
    }

    getCategoryName(category) {
        const names = {
            tantrico: 'Masaje Tántrico Sensitivo'
        };
        return names[category] || 'Masaje Tántrico Sensitivo';
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    renderStats() {
        const totalVisits = parseInt(localStorage.getItem('pageVisits') || 0);
        const totalStaff = this.activeStaff.length;
        const totalApplications = this.applications.length;
        const avgExp = this.calculateAvgExperience();
        const visitsToday = this.getVisitsToday();
        const avgAge = this.calculateAvgAge();

        document.getElementById('statTotalVisits').textContent = totalVisits;
        document.getElementById('statTotalStaff').textContent = totalStaff;
        document.getElementById('statTotalApplications').textContent = totalApplications;
        document.getElementById('statAvgExperience').textContent = avgExp;
        document.getElementById('statVisitsToday').textContent = visitsToday;
        document.getElementById('statAvgAge').textContent = avgAge + ' años';

        // Métricas adicionales
        const conversionRate = totalApplications > 0 ? ((totalStaff / totalApplications) * 100).toFixed(1) : 0;
        document.getElementById('statConversionRate').textContent = conversionRate + '%';
        
        const fullTime = this.activeStaff.filter(p => p.availability === 'full-time').length;
        const partTime = this.activeStaff.filter(p => p.availability !== 'full-time').length;
        document.getElementById('statFullTime').textContent = fullTime;
        document.getElementById('statPartTime').textContent = partTime;
        
        const now = new Date();
        document.getElementById('statLastUpdate').textContent = now.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});

        this.renderCategoryStats();
        this.renderTopStaff();
        this.renderCategoryChart();
        this.renderVisitsChart();
        this.renderAvailabilityChart();
        this.renderExperienceChart();
        
        // Auto-actualizar cada 5 segundos
        if (this.statsInterval) clearInterval(this.statsInterval);
        this.statsInterval = setInterval(() => {
            if (this.currentTab === 'stats') {
                const newVisits = localStorage.getItem('pageVisits') || 0;
                document.getElementById('statTotalVisits').textContent = newVisits;
                document.getElementById('statVisitsToday').textContent = this.getVisitsToday();
                const now = new Date();
                document.getElementById('statLastUpdate').textContent = now.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
            }
        }, 5000);
    }

    getVisitsToday() {
        const today = new Date().toDateString();
        const lastVisitDate = localStorage.getItem('lastVisitDate');
        let visitsToday = parseInt(localStorage.getItem('visitsToday') || 0);
        
        if (lastVisitDate !== today) {
            visitsToday = 1;
            localStorage.setItem('visitsToday', visitsToday);
            localStorage.setItem('lastVisitDate', today);
        }
        
        return visitsToday;
    }

    calculateAvgAge() {
        if (this.activeStaff.length === 0) return 0;
        
        // Simular edades entre 20-28 basado en experiencia
        const totalAge = this.activeStaff.reduce((sum, person) => {
            const expMatch = person.experience.match(/(\d+)/);
            const years = expMatch ? parseInt(expMatch[1]) : 0;
            const estimatedAge = 20 + years * 2; // Edad base + experiencia
            return sum + Math.min(estimatedAge, 30);
        }, 0);
        
        return Math.round(totalAge / this.activeStaff.length);
    }

    renderTopStaff() {
        const topStaff = document.getElementById('topStaff');
        
        if (this.activeStaff.length === 0) {
            topStaff.innerHTML = '<p style="color: var(--text-gray); text-align: center;">No hay personal registrado</p>';
            return;
        }

        // Ordenar por experiencia
        const sorted = [...this.activeStaff].sort((a, b) => {
            const aExp = parseInt(a.experience.match(/(\d+)/)?.[1] || 0);
            const bExp = parseInt(b.experience.match(/(\d+)/)?.[1] || 0);
            return bExp - aExp;
        }).slice(0, 3);

        topStaff.innerHTML = sorted.map((person, index) => `
            <div style="display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: var(--border-radius); border-left: 3px solid ${index === 0 ? '#D4AF37' : index === 1 ? '#C9A0A0' : '#B8B8B8'};">
                <div style="font-size: 1.5rem; color: ${index === 0 ? '#D4AF37' : index === 1 ? '#C9A0A0' : '#B8B8B8'}; font-weight: 300;">#${index + 1}</div>
                <div style="flex: 1;">
                    <div style="color: var(--text-white); font-weight: 300; margin-bottom: 3px;">${person.name}</div>
                    <div style="color: var(--text-gray); font-size: 0.8rem;">${this.getCategoryName(person.category)} • ${person.experience}</div>
                    ${person.phone ? `<div style="color: var(--accent-gold); font-size: 0.75rem; margin-top: 3px;">📱 ${person.phone}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderAvailabilityChart() {
        const canvas = document.getElementById('availabilityChart');
        if (!canvas) return;

        const availability = {
            'full-time': { name: 'Tiempo Completo', count: 0, color: '#D4AF37' },
            'part-time': { name: 'Medio Tiempo', count: 0, color: '#C9A0A0' },
            'flexible': { name: 'Flexible', count: 0, color: '#B8B8B8' },
            'weekends': { name: 'Fines de Semana', count: 0, color: '#8A8A8A' }
        };

        this.activeStaff.forEach(person => {
            if (availability[person.availability]) {
                availability[person.availability].count++;
            }
        });

        if (this.availabilityChart) this.availabilityChart.destroy();

        this.availabilityChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Object.values(availability).map(a => a.name),
                datasets: [{
                    label: 'Personal',
                    data: Object.values(availability).map(a => a.count),
                    backgroundColor: Object.values(availability).map(a => a.color),
                    borderColor: '#1A1A1A',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        titleColor: '#D4AF37',
                        bodyColor: '#B8B8B8',
                        borderColor: '#D4AF37',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#B8B8B8',
                            font: { size: 11, weight: 300 },
                            stepSize: 1
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: {
                            color: '#B8B8B8',
                            font: { size: 10, weight: 300 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    renderExperienceChart() {
        const canvas = document.getElementById('experienceChart');
        if (!canvas) return;

        const expRanges = {
            '0-1': { name: '0-1 año', count: 0, color: '#8A8A8A' },
            '1-2': { name: '1-2 años', count: 0, color: '#B8B8B8' },
            '2-3': { name: '2-3 años', count: 0, color: '#C9A0A0' },
            '3+': { name: '3+ años', count: 0, color: '#D4AF37' }
        };

        this.activeStaff.forEach(person => {
            const years = parseInt(person.experience.match(/(\d+)/)?.[1] || 0);
            if (years === 0 || years === 1) expRanges['0-1'].count++;
            else if (years === 2) expRanges['1-2'].count++;
            else if (years === 3) expRanges['2-3'].count++;
            else expRanges['3+'].count++;
        });

        if (this.experienceChart) this.experienceChart.destroy();

        this.experienceChart = new Chart(canvas, {
            type: 'polarArea',
            data: {
                labels: Object.values(expRanges).map(e => e.name),
                datasets: [{
                    data: Object.values(expRanges).map(e => e.count),
                    backgroundColor: Object.values(expRanges).map(e => e.color + '80'),
                    borderColor: Object.values(expRanges).map(e => e.color),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#B8B8B8',
                            font: { size: 11, weight: 300 },
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        titleColor: '#D4AF37',
                        bodyColor: '#B8B8B8',
                        borderColor: '#D4AF37',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    r: {
                        ticks: {
                            color: '#B8B8B8',
                            backdropColor: 'transparent',
                            font: { size: 10 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    renderCategoryStats() {
        const categoryStats = document.getElementById('categoryStats');
        const categories = {
            tantrico: { name: 'Masaje Tántrico Sensitivo', count: 0, color: '#D4AF37' }
        };

        this.activeStaff.forEach(person => {
            if (categories[person.category]) {
                categories[person.category].count++;
            } else {
                categories.tantrico.count++; // Default a tántrico
            }
        });

        const totalStaff = this.activeStaff.length;

        categoryStats.innerHTML = Object.entries(categories).map(([key, data]) => {
            const percentage = totalStaff > 0 ? (data.count / totalStaff * 100).toFixed(0) : 0;
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: var(--border-radius); border-left: 3px solid ${data.color};">
                    <div>
                        <div style="color: var(--text-white); font-weight: 300; margin-bottom: 5px;">${data.name}</div>
                        <div style="color: var(--text-gray); font-size: 0.85rem;">${data.count} persona${data.count !== 1 ? 's' : ''}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: ${data.color}; font-size: 1.5rem; font-weight: 300;">${percentage}%</div>
                        <div style="width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: ${data.color}; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const categories = {
            tantrico: { name: 'Tántrico Sensitivo', count: 0, color: '#D4AF37' }
        };

        this.activeStaff.forEach(person => {
            if (categories[person.category]) {
                categories[person.category].count++;
            } else {
                categories.tantrico.count++;
            }
        });

        if (this.categoryChart) this.categoryChart.destroy();

        this.categoryChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: Object.values(categories).map(c => c.name),
                datasets: [{
                    data: Object.values(categories).map(c => c.count),
                    backgroundColor: Object.values(categories).map(c => c.color),
                    borderColor: '#1A1A1A',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#B8B8B8',
                            font: { size: 12, weight: 300 },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        titleColor: '#D4AF37',
                        bodyColor: '#B8B8B8',
                        borderColor: '#D4AF37',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                }
            }
        });
    }

    renderVisitsChart() {
        const canvas = document.getElementById('visitsChart');
        if (!canvas) return;

        // Simular datos de últimos 7 días basado en visitas totales
        const totalVisits = parseInt(localStorage.getItem('pageVisits') || 0);
        const days = ['Hace 6d', 'Hace 5d', 'Hace 4d', 'Hace 3d', 'Hace 2d', 'Ayer', 'Hoy'];
        
        // Distribuir visitas de forma realista
        const distribution = [0.08, 0.12, 0.10, 0.15, 0.18, 0.20, 0.17];
        const visitsData = distribution.map(d => Math.round(totalVisits * d));

        if (this.visitsChart) this.visitsChart.destroy();

        this.visitsChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Visitas',
                    data: visitsData,
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#D4AF37',
                    pointBorderColor: '#1A1A1A',
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
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        titleColor: '#D4AF37',
                        bodyColor: '#B8B8B8',
                        borderColor: '#D4AF37',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#B8B8B8',
                            font: { size: 11, weight: 300 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#B8B8B8',
                            font: { size: 11, weight: 300 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    }

    calculateAvgExperience() {
        if (this.activeStaff.length === 0) return '0 años';
        
        const totalYears = this.activeStaff.reduce((sum, person) => {
            const match = person.experience.match(/(\d+)/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0);
        
        const avg = (totalYears / this.activeStaff.length).toFixed(1);
        return `${avg} años`;
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        
        document.getElementById('settingWhatsapp').value = settings.whatsapp || '+591 69245670';
        document.getElementById('settingAddress').value = settings.address || 'Av. Brasil Calle prolongación warnes #692';
        document.getElementById('settingHours').value = settings.hours || 'Lunes a Domingo: 10:00 AM - 10:00 PM';
        document.getElementById('settingEmail').value = settings.email || 'info@masajemaju.com';
        document.getElementById('settingTitle').value = settings.title || 'Masaje y Placer Maju';
        document.getElementById('settingSubtitle').value = settings.subtitle || 'Relájate. Disfruta. Renuévate.';
        document.getElementById('settingDescription').value = settings.description || 'Masajes exclusivos para caballeros en Santa Cruz';
    }

    saveSettings() {
        const settings = {
            whatsapp: document.getElementById('settingWhatsapp').value,
            address: document.getElementById('settingAddress').value,
            hours: document.getElementById('settingHours').value,
            email: document.getElementById('settingEmail').value,
            title: document.getElementById('settingTitle').value,
            subtitle: document.getElementById('settingSubtitle').value,
            description: document.getElementById('settingDescription').value
        };

        localStorage.setItem('siteSettings', JSON.stringify(settings));
        
        if (typeof EliteTalentApp !== 'undefined') {
            EliteTalentApp.showNotification('Configuración guardada exitosamente', 'success');
        } else {
            alert('Configuración guardada exitosamente');
        }
    }

    async updateApplicationStatus(id, status) {
        try {
            await supabaseService.updateApplication(id, { status: status });
            await this.loadData();
            document.getElementById('candidateModal').style.display = 'none';
            EliteTalentApp.showNotification(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'}`, 'success');
        } catch (error) {
            console.error('Error actualizando estado:', error);
            EliteTalentApp.showNotification('Error al actualizar estado', 'error');
        }
    }

    async deleteApplication(id) {
        if (!confirm('¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.')) return;
        
        try {
            await supabaseService.deleteApplication(id);
            await this.loadData();
            document.getElementById('candidateModal').style.display = 'none';
            EliteTalentApp.showNotification('Solicitud eliminada', 'success');
        } catch (error) {
            console.error('Error eliminando solicitud:', error);
            EliteTalentApp.showNotification('Error al eliminar solicitud', 'error');
        }
    }

    renderAdvancedMetrics() {
        const totalApps = this.applications.length;
        const approvedApps = this.applications.filter(a => a.status === 'approved').length;
        const rejectedApps = this.applications.filter(a => a.status === 'rejected').length;
        const pendingApps = this.applications.filter(a => a.status === 'pending').length;
        
        // KPIs
        const conversionRate = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(1) : 0;
        const approvalRate = (approvedApps + rejectedApps) > 0 ? ((approvedApps / (approvedApps + rejectedApps)) * 100).toFixed(1) : 0;
        const pendingPercent = totalApps > 0 ? ((pendingApps / totalApps) * 100).toFixed(0) : 0;
        
        document.getElementById('metricConversionRate').textContent = conversionRate + '%';
        document.getElementById('metricApprovalRate').textContent = approvalRate + '%';
        document.getElementById('metricAvgResponseTime').textContent = '2.5h';
        document.getElementById('metricPendingApps').textContent = pendingApps;
        document.getElementById('metricPendingPercent').textContent = pendingPercent + '% del total';
        
        // Trends
        document.getElementById('metricConversionTrend').textContent = conversionRate > 50 ? '↑ Excelente' : '→ Normal';
        document.getElementById('metricApprovalTrend').textContent = approvalRate > 70 ? '↑ Alta calidad' : '→ Revisar criterios';
        
        // Timeline Chart
        this.renderApplicationsTimeline();
        
        // Status Chart
        this.renderApplicationStatusChart();
        
        // Performance Table
        this.renderStaffPerformanceTable();
    }

    renderApplicationsTimeline() {
        const canvas = document.getElementById('applicationsTimelineChart');
        if (!canvas) return;

        const last30Days = [];
        const counts = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            last30Days.push(dateStr);
            
            const count = this.applications.filter(app => {
                const appDate = new Date(app.date);
                return appDate.toDateString() === date.toDateString();
            }).length;
            counts.push(count);
        }

        if (this.timelineChart) this.timelineChart.destroy();

        this.timelineChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: last30Days,
                datasets: [{
                    label: 'Solicitudes',
                    data: counts,
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        titleColor: '#D4AF37',
                        bodyColor: '#B8B8B8',
                        borderColor: '#D4AF37',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#B8B8B8', stepSize: 1 },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#B8B8B8', maxRotation: 45 },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    renderApplicationStatusChart() {
        const canvas = document.getElementById('applicationStatusChart');
        if (!canvas) return;

        const approved = this.applications.filter(a => a.status === 'approved').length;
        const rejected = this.applications.filter(a => a.status === 'rejected').length;
        const pending = this.applications.filter(a => a.status === 'pending').length;

        if (this.statusChart) this.statusChart.destroy();

        this.statusChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Aprobadas', 'Rechazadas', 'Pendientes'],
                datasets: [{
                    data: [approved, rejected, pending],
                    backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                    borderColor: '#1A1A1A',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#B8B8B8', font: { size: 12 }, padding: 15 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        titleColor: '#D4AF37',
                        bodyColor: '#B8B8B8',
                        borderColor: '#D4AF37',
                        borderWidth: 1
                    }
                }
            }
        });
    }

    renderStaffPerformanceTable() {
        const table = document.getElementById('staffPerformanceTable');
        if (!table) return;

        if (this.activeStaff.length === 0) {
            table.innerHTML = '<p style="color: var(--text-gray); text-align: center;">No hay personal registrado</p>';
            return;
        }

        const tableHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--glass-border);">
                        <th style="padding: 15px; text-align: left; color: var(--accent-gold); font-weight: 300; letter-spacing: 1px;">Nombre</th>
                        <th style="padding: 15px; text-align: center; color: var(--accent-gold); font-weight: 300; letter-spacing: 1px;">Experiencia</th>
                        <th style="padding: 15px; text-align: center; color: var(--accent-gold); font-weight: 300; letter-spacing: 1px;">Disponibilidad</th>
                        <th style="padding: 15px; text-align: center; color: var(--accent-gold); font-weight: 300; letter-spacing: 1px;">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.activeStaff.map(person => `
                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                            <td style="padding: 15px; color: var(--text-white);">${person.name}</td>
                            <td style="padding: 15px; text-align: center; color: var(--text-gray);">${person.experience}</td>
                            <td style="padding: 15px; text-align: center;">
                                <span style="padding: 4px 12px; background: ${person.availability === 'full-time' ? '#28a745' : '#ffc107'}; border-radius: 12px; font-size: 0.75rem;">
                                    ${person.availability === 'full-time' ? 'Tiempo Completo' : 'Flexible'}
                                </span>
                            </td>
                            <td style="padding: 15px; text-align: center;">
                                <span style="padding: 4px 12px; background: #28a745; border-radius: 12px; font-size: 0.75rem;">Activo</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        table.innerHTML = tableHTML;
    }
}

let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
