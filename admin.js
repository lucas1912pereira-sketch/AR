document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN LOGIC ---
    const loginModal = document.getElementById('login-modal');
    const adminDashboard = document.getElementById('admin-dashboard');
    const btnLogin = document.getElementById('btn-login');
    const passInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');

    btnLogin.addEventListener('click', () => {
        const pass = passInput.value;
        // Contraseña simple de prueba
        if (pass === 'admin123') {
            loginModal.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
        } else {
            loginError.classList.remove('hidden');
        }
    });

    passInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnLogin.click();
    });

    // --- DRAG AND DROP LOGIC ---
    function setupDragAndDrop(boxId, inputId) {
        const box = document.getElementById(boxId);
        const input = document.getElementById(inputId);

        // Click opens file dialog
        box.addEventListener('click', () => input.click());

        // Update UI when file is selected
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                box.classList.add('has-file');
                box.querySelector('span').textContent = input.files[0].name;
                box.querySelector('i').className = 'ph ph-check-circle';
            }
        });

        // Drag events
        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            box.classList.add('drag-over');
        });

        box.addEventListener('dragleave', (e) => {
            e.preventDefault();
            box.classList.remove('drag-over');
        });

        box.addEventListener('drop', (e) => {
            e.preventDefault();
            box.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length > 0) {
                input.files = e.dataTransfer.files;
                box.classList.add('has-file');
                box.querySelector('span').textContent = input.files[0].name;
                box.querySelector('i').className = 'ph ph-check-circle';
            }
        });
    }

    setupDragAndDrop('drop-img', 'file-img');
    setupDragAndDrop('drop-glb', 'file-glb');
    setupDragAndDrop('drop-usdz', 'file-usdz');

    // --- FORM SUBMISSION ---
    const form = document.getElementById('add-dish-form');
    const statusDiv = document.getElementById('upload-status');
    const btnSave = document.getElementById('btn-save-dish');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnOriginalText = btnSave.innerHTML;
        btnSave.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Subiendo...';
        btnSave.disabled = true;

        // Aquí iría la conexión real con Cloudflare R2 y D1
        // Por ahora simulamos una carga de 2 segundos
        
        setTimeout(() => {
            statusDiv.textContent = "¡Plato guardado con éxito! El menú ha sido actualizado.";
            statusDiv.className = "upload-status success";
            
            // Limpiar formulario
            form.reset();
            ['drop-img', 'drop-glb', 'drop-usdz'].forEach(id => {
                const box = document.getElementById(id);
                box.classList.remove('has-file');
                
                // Restaurar iconos originales
                if(id === 'drop-img') box.querySelector('i').className = 'ph ph-image';
                if(id === 'drop-glb') box.querySelector('i').className = 'ph ph-cube';
                if(id === 'drop-usdz') box.querySelector('i').className = 'ph ph-apple-logo';
                
                // Restaurar textos originales
                if(id === 'drop-img') box.querySelector('span').textContent = 'Foto del Plato';
                if(id === 'drop-glb') box.querySelector('span').textContent = 'Modelo 3D (Android)';
                if(id === 'drop-usdz') box.querySelector('span').textContent = 'Modelo 3D (iOS)';
            });

            btnSave.innerHTML = btnOriginalText;
            btnSave.disabled = false;
        }, 2000);
    });
});
