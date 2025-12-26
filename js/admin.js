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
            if (password === 'Maju@2026') {
                sessionStorage.setItem('adminAuth', 'true');
                loginOverlay.classList.add('hidden');
                EliteTalentApp.showNotification('Acceso concedido', 'success');
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
            // Cargar personal activo desde profilesData
            this.activeStaff = typeof profilesData !== 'undefined' ? profilesData.profiles || [] : [];

            // Cargar solicitudes desde Supabase o modo demo
            if (typeof CONFIG === 'undefined' || CONFIG.demoMode || !CONFIG.supabase.enabled) {
                this.applications = [];
            } else {
                const records = await supabaseService.getApplications();
                this.applications = records.map(record => ({
                    id: record.id,
                    name: record.nombre || 'Sin nombre',
                    phone: record.telefono || '',
                    email: record.email || '',
                    age: record.edad || 0,
                    category: record.categoria || 'otro',
                    description: record.descripcion || '',
                    experience: record.experiencia || '',
                    location: record.ubicacion || '',
                    date: new Date(record.fecha || Date.now())
                }));
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
        
        card.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">${person.avatar || '—'}</div>
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
                <p style="color: var(--text-gray); font-size: 0.9rem;"><strong>Edad:</strong> ${app.age} años</p>
                <p style="color: var(--text-gray); font-size: 0.9rem;"><strong>Fecha:</strong> ${this.formatDate(app.date)}</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="adminPanel.viewApplication(${app.id})" class="btn-secondary" style="flex: 1; font-size: 0.85rem; padding: 8px;">Ver Detalles</button>
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

        detail.innerHTML = `
            <div style="text-align: center;">
                <h2 style="color: var(--accent-gold); margin-bottom: 10px;">${app.name}</h2>
                <p style="color: var(--text-gray); margin-bottom: 30px;">${this.getCategoryName(app.category)}</p>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: var(--border-radius); margin-bottom: 15px; text-align: left;">
                    <h4 style="color: var(--accent-gold); margin-bottom: 10px;">Información de Contacto</h4>
                    <p style="color: var(--text-gray);"><strong>Teléfono:</strong> ${app.phone}</p>
                    <p style="color: var(--text-gray); margin-top: 5px;"><strong>Email:</strong> ${app.email || 'No proporcionado'}</p>
                    <p style="color: var(--text-gray); margin-top: 5px;"><strong>Edad:</strong> ${app.age} años</p>
                    <p style="color: var(--text-gray); margin-top: 5px;"><strong>Ubicación:</strong> ${app.location || 'No especificado'}</p>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: var(--border-radius); margin-bottom: 15px; text-align: left;">
                    <h4 style="color: var(--accent-gold); margin-bottom: 10px;">Experiencia</h4>
                    <p style="color: var(--text-gray);">${app.experience || 'No especificado'}</p>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: var(--border-radius); text-align: left;">
                    <h4 style="color: var(--accent-gold); margin-bottom: 10px;">Descripción</h4>
                    <p style="color: var(--text-gray);">${app.description || 'No proporcionado'}</p>
                </div>
                
                <div style="margin-top: 20px;">
                    <p style="color: var(--text-gray); font-size: 0.9rem;">Fecha de solicitud: ${this.formatDate(app.date)}</p>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    deleteStaff(id) {
        if (!confirm('¿Estás seguro de eliminar a esta persona del personal activo?')) return;
        
        this.activeStaff = this.activeStaff.filter(p => p.id !== id);
        this.renderActiveStaff();
        this.updateStats();
        EliteTalentApp.showNotification('Persona eliminada', 'success');
    }

    openPersonModal() {
        const modal = document.getElementById('personModal');
        document.getElementById('personName').value = '';
        document.getElementById('personCategory').value = 'relajante';
        document.getElementById('personExperience').value = '';
        document.getElementById('personDescription').value = '';
        modal.style.display = 'flex';
    }

    closePersonModal() {
        const modal = document.getElementById('personModal');
        modal.style.display = 'none';
    }

    savePerson() {
        const name = document.getElementById('personName').value;
        const category = document.getElementById('personCategory').value;
        const experience = document.getElementById('personExperience').value;
        const description = document.getElementById('personDescription').value;

        if (!name) {
            EliteTalentApp.showNotification('El nombre es obligatorio', 'error');
            return;
        }

        const newPerson = {
            id: Date.now(),
            name,
            category,
            experience: experience || 'No especificado',
            description: description || 'Sin descripción',
            avatar: '—',
            location: 'Santa Cruz, Bolivia',
            availability: 'full-time',
            featured: true,
            dateJoined: new Date().toISOString()
        };

        this.activeStaff.push(newPerson);
        this.renderActiveStaff();
        this.updateStats();
        this.closePersonModal();
        EliteTalentApp.showNotification('Persona agregada exitosamente', 'success');
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
            relajante: 'Masaje Relajante',
            terapeutico: 'Masaje Terapéutico',
            sensitivo: 'Masaje Sensitivo',
            otro: 'Otro'
        };
        return names[category] || category;
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    renderStats() {
        const totalVisits = localStorage.getItem('pageVisits') || 0;
        const totalStaff = this.activeStaff.length;
        const avgExp = this.calculateAvgExperience();

        document.getElementById('statTotalVisits').textContent = totalVisits;
        document.getElementById('statTotalStaff').textContent = totalStaff;
        document.getElementById('statAvgExperience').textContent = avgExp;

        const categoryStats = document.getElementById('categoryStats');
        const categories = {
            relajante: { name: 'Masaje Relajante', count: 0 },
            terapeutico: { name: 'Masaje Terapéutico', count: 0 },
            sensitivo: { name: 'Masaje Sensitivo', count: 0 },
            otro: { name: 'Otro', count: 0 }
        };

        this.activeStaff.forEach(person => {
            if (categories[person.category]) {
                categories[person.category].count++;
            }
        });

        categoryStats.innerHTML = Object.entries(categories).map(([key, data]) => {
            const percentage = totalStaff > 0 ? (data.count / totalStaff * 100).toFixed(0) : 0;
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: var(--border-radius);">
                    <div>
                        <div style="color: var(--text-white); font-weight: 300; margin-bottom: 5px;">${data.name}</div>
                        <div style="color: var(--text-gray); font-size: 0.85rem;">${data.count} persona${data.count !== 1 ? 's' : ''}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: var(--accent-gold); font-size: 1.5rem; font-weight: 300;">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');
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
}

let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
