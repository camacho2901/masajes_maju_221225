// Gestor del formulario de aplicación
class ApplicationForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.uploadedFiles = [];
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupNavigation();
        this.setupFileUpload();
        this.setupValidation();
        this.setupAutoSave();
    }

    // Cargar datos guardados
    loadSavedData() {
        const saved = localStorage.getItem('applicationData');
        if (saved) {
            this.formData = JSON.parse(saved);
            this.populateForm();
        }
    }

    // Poblar formulario con datos guardados
    populateForm() {
        Object.keys(this.formData).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = this.formData[key];
                } else {
                    input.value = this.formData[key];
                }
            }
        });
    }

    // Configurar navegación entre pasos
    setupNavigation() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.validateCurrentStep()) {
                    this.nextStep();
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevStep();
            });
        }
    }

    // Siguiente paso
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveCurrentStep();
            this.currentStep++;
            this.updateUI();
        } else if (this.currentStep === this.totalSteps) {
            this.submitForm();
        }
    }

    // Paso anterior
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    // Actualizar interfaz
    updateUI() {
        // Actualizar pasos
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });
        
        const currentStep = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStep) {
            currentStep.classList.add('active');
            currentStep.style.display = 'block';
        }

        // Actualizar indicadores de paso
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Actualizar barra de progreso
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }

        // Actualizar botones
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) prevBtn.disabled = this.currentStep === 1;
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.textContent = 'ENVIAR SOLICITUD';
                nextBtn.classList.add('animate-glow');
            } else {
                nextBtn.textContent = 'Siguiente';
                nextBtn.classList.remove('animate-glow');
            }
        }

        // Actualizar resumen en el último paso
        if (this.currentStep === this.totalSteps) {
            this.updateSummary();
        }
    }

    // Validar paso actual
    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return true;
        
        // Paso 1: validar nombre, teléfono y edad
        if (this.currentStep === 1) {
            const name = document.querySelector('[name="artisticName"]');
            const phone = document.querySelector('[name="phone"]');
            const age = document.querySelector('[name="age"]');
            
            let isValid = true;
            
            if (!name.value.trim()) {
                this.showFieldError(name, 'El nombre es obligatorio');
                isValid = false;
            } else {
                this.clearFieldError(name);
            }
            
            if (!phone.value.trim()) {
                this.showFieldError(phone, 'El teléfono es obligatorio');
                isValid = false;
            } else {
                this.clearFieldError(phone);
            }
            
            if (!age.value.trim()) {
                this.showFieldError(age, 'La edad es obligatoria');
                isValid = false;
            } else {
                const ageValue = parseInt(age.value, 10);
                if (ageValue < 18 || ageValue > 30) {
                    this.showFieldError(age, 'Debes tener entre 18 y 30 años');
                    isValid = false;
                } else {
                    this.clearFieldError(age);
                }
            }
            
            return isValid;
        }
        
        // Paso 4: validar checkbox
        if (this.currentStep === 4) {
            const checkbox = document.querySelector('[name="age18"]');
            if (!checkbox.checked) {
                EliteTalentApp.showNotification('Debes confirmar que eres mayor de 18 años', 'error');
                return false;
            }
        }
        
        return true;
    }

    // Mostrar error en campo
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        error.style.cssText = `
            color: var(--accent-pink);
            font-size: 0.8rem;
            margin-top: 5px;
            animation: fadeIn 0.3s ease;
        `;
        
        field.parentNode.appendChild(error);
        field.style.borderColor = 'var(--accent-pink)';
    }

    // Limpiar error de campo
    clearFieldError(field) {
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        field.style.borderColor = 'var(--glass-border)';
    }

    // Guardar paso actual
    saveCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;
        
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else if (input.type !== 'file') {
                this.formData[input.name] = input.value;
            }
        });
        
        // Forzar categoría tántrico
        this.formData.category = 'tantrico';

        localStorage.setItem('applicationData', JSON.stringify(this.formData));
    }

    // Configurar subida de archivos
    setupFileUpload() {
        const fileInput = document.getElementById('portfolioFiles');
        const filePreview = document.getElementById('filePreview');
        
        if (!fileInput || !filePreview) return;
        
        const fileLabel = fileInput.parentNode.querySelector('.file-label');
        if (!fileLabel) return;

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag & Drop
        fileLabel.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileLabel.style.borderColor = 'var(--accent-pink)';
            fileLabel.style.background = 'rgba(255, 77, 141, 0.1)';
        });

        fileLabel.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileLabel.style.borderColor = 'var(--glass-border)';
            fileLabel.style.background = 'rgba(255, 255, 255, 0.05)';
        });

        fileLabel.addEventListener('drop', (e) => {
            e.preventDefault();
            fileLabel.style.borderColor = 'var(--glass-border)';
            fileLabel.style.background = 'rgba(255, 255, 255, 0.05)';
            this.handleFileUpload(e.dataTransfer.files);
        });
    }

    // Manejar subida de archivos
    handleFileUpload(files) {
        const maxFiles = 5;
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        Array.from(files).forEach(file => {
            if (this.uploadedFiles.length >= maxFiles) {
                EliteTalentApp.showNotification('Máximo 5 archivos permitidos', 'warning');
                return;
            }

            if (file.size > maxSize) {
                EliteTalentApp.showNotification(`${file.name} es muy grande (máx. 10MB)`, 'warning');
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                EliteTalentApp.showNotification(`${file.name} no es un tipo válido`, 'warning');
                return;
            }

            this.uploadedFiles.push(file);
            this.addFilePreview(file);
        });
    }

    // Agregar preview de archivo
    addFilePreview(file) {
        const preview = document.getElementById('filePreview');
        if (!preview) return;
        
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.style.cssText = 'position: relative; aspect-ratio: 1; background: var(--glass-bg); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; overflow: hidden;';
        
        const isImage = file.type.startsWith('image/');
        
        if (isImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                item.style.backgroundImage = `url(${e.target.result})`;
                item.style.backgroundSize = 'cover';
                item.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);
        } else {
            item.innerHTML = '📷';
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'preview-remove';
        removeBtn.innerHTML = '×';
        removeBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background: #dc3545; border: none; border-radius: 50%; color: white; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;';
        removeBtn.onclick = () => {
            const index = this.uploadedFiles.indexOf(file);
            if (index > -1) {
                this.uploadedFiles.splice(index, 1);
                item.remove();
            }
        };

        item.appendChild(removeBtn);
        preview.appendChild(item);
    }

    // Configurar validación en tiempo real
    setupValidation() {
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => {
                if (field.hasAttribute('required') && !field.value.trim()) {
                    this.showFieldError(field, 'Este campo es obligatorio');
                } else {
                    this.clearFieldError(field);
                }
            });

            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });
    }

    // Configurar autoguardado
    setupAutoSave() {
        setInterval(() => {
            this.saveCurrentStep();
        }, 30000); // Cada 30 segundos
    }

    // Actualizar resumen
    updateSummary() {
        const summary = document.getElementById('applicationSummary');
        if (!summary) return;
        
        summary.innerHTML = `
            <div class="summary-section">
                <h3>Información Personal</h3>
                <p><strong>Nombre:</strong> ${this.formData.artisticName || 'No especificado'}</p>
                <p><strong>Teléfono:</strong> ${this.formData.phone || 'No especificado'}</p>
                <p><strong>Edad:</strong> ${this.formData.age || 'No especificado'}</p>
            </div>
            
            <div class="summary-section">
                <h3>Portfolio</h3>
                <p><strong>Archivos subidos:</strong> ${this.uploadedFiles.length}</p>
                <p><strong>Instagram:</strong> ${this.formData.instagram || 'No especificado'}</p>
            </div>
            
            <div class="summary-section">
                <h3>Detalles Profesionales</h3>
                <p><strong>Experiencia:</strong> ${this.formData.experience || 'No especificado'}</p>
                <p><strong>Disponibilidad:</strong> ${this.formData.availability || 'No especificado'}</p>
                <p><strong>Ubicación:</strong> ${this.formData.location || 'No especificado'}</p>
            </div>
        `;

        // Agregar estilos al resumen solo si no existen
        if (!document.getElementById('summary-styles')) {
            const style = document.createElement('style');
            style.id = 'summary-styles';
            style.textContent = `
                .summary-section {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .summary-section h3 {
                    color: var(--accent-gold);
                    margin-bottom: 15px;
                    font-size: 1.2rem;
                }
                .summary-section p {
                    margin-bottom: 8px;
                    opacity: 0.9;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async submitForm() {
        if (!this.validateCurrentStep()) return;

        const submitBtn = document.getElementById('nextBtn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        try {
            let imageUrls = [];
            
            // Subir imágenes a Supabase Storage
            if (this.uploadedFiles.length > 0 && typeof supabaseStorage !== 'undefined') {
                submitBtn.textContent = 'Subiendo imágenes...';
                imageUrls = await supabaseStorage.uploadMultiple(this.uploadedFiles);
            }

            // Guardar datos en Supabase
            if (CONFIG.supabase?.enabled && typeof supabaseService !== 'undefined') {
                submitBtn.textContent = 'Guardando datos...';
                const applicationData = {
                    ...this.formData,
                    images: imageUrls.map(img => img.url),
                    category: 'tantrico'
                };
                await supabaseService.createApplication(applicationData);
            }
            
            // Enviar notificación por WhatsApp
            submitBtn.textContent = 'Enviando notificación...';
            this.sendWhatsAppNotification(imageUrls);
            
            this.showSuccessMessage();
            localStorage.removeItem('applicationData');
        } catch (error) {
            console.error('Error:', error);
            EliteTalentApp.showNotification(`Error: ${error.message}`, 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    sendWhatsAppNotification(imageUrls) {
        const data = this.formData;
        const phone = '59177157896';
        
        let message = `🌟 *NUEVA POSTULANTE* 🌟\n\n`;
        message += `👤 *Información Personal*\n`;
        message += `• Nombre: ${data.artisticName || 'No especificado'}\n`;
        message += `• Teléfono: ${data.phone || 'No especificado'}\n`;
        message += `• Edad: ${data.age || 'No especificado'} años\n`;
        message += `• Email: ${data.email || 'No especificado'}\n\n`;
        
        message += `📸 *Portfolio*\n`;
        message += `• Fotos subidas: ${imageUrls.length}\n`;
        message += `• Instagram: ${data.instagram || 'No especificado'}\n\n`;
        
        message += `💼 *Detalles Profesionales*\n`;
        message += `• Experiencia: ${data.experience || 'No especificado'}\n`;
        message += `• Disponibilidad: ${data.availability || 'No especificado'}\n`;
        message += `• Ubicación: ${data.location || 'No especificado'}\n\n`;
        
        if (data.description) {
            message += `📝 *Sobre ella*\n${data.description}\n\n`;
        }
        
        if (data.skills) {
            message += `✨ *Información Adicional*\n${data.skills}\n\n`;
        }
        
        if (imageUrls.length > 0) {
            message += `🔗 *Enlaces de Fotos*\n`;
            imageUrls.forEach((img, index) => {
                message += `${index + 1}. ${img.url}\n`;
            });
            message += `\n`;
        }
        
        message += `⏰ *Fecha de Postulación*\n${new Date().toLocaleString('es-ES')}\n\n`;
        message += `📱 *Acción Requerida*\nRevisar en el panel administrativo`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    // Mostrar mensaje de éxito
    showSuccessMessage() {
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
        });
        
        const successStep = document.querySelector('[data-step="success"]');
        if (successStep) successStep.style.display = 'block';
        
        const formActions = document.getElementById('formActions');
        if (formActions) formActions.style.display = 'none';
        
        // Actualizar barra de progreso al 100%
        const progressFill = document.getElementById('progressFill');
        if (progressFill) progressFill.style.width = '100%';
    }

    // Obtener nombre de categoría
    getCategoryName(category) {
        const names = {
            relajante: 'Masaje Relajante',
            terapeutico: 'Masaje Terapéutico',
            sensitivo: 'Masaje Sensitivo',
            otro: 'Otro'
        };
        return names[category] || category;
    }

    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
}

// Inicializar formulario
document.addEventListener('DOMContentLoaded', () => {
    new ApplicationForm();
});