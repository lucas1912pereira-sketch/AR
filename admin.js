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
    // --- FORM SUBMISSION ---
    const form = document.getElementById('add-dish-form');
    const statusDiv = document.getElementById('upload-status');
    const btnSave = document.getElementById('btn-save-dish');
    const btnCancel = document.getElementById('btn-cancel-edit');
    const dishIdInput = document.getElementById('dish-id');
    const dishesListContainer = document.getElementById('admin-dishes-list');
    const API_URL = "https://menu-api.lucas1912pereira.workers.dev";

    // Cargar la lista actual de platos
    async function loadDishes() {
        try {
            const res = await fetch(API_URL);
            const dishes = await res.json();
            
            // Extraer y poblar categorías únicas en el datalist
            const categoryList = document.getElementById('category-list');
            const uniqueCategories = [...new Set(dishes.map(d => d.categoria).filter(Boolean))];
            if (categoryList) {
                categoryList.innerHTML = uniqueCategories.map(cat => `<option value="${cat}">`).join('');
            }

            if (dishes.length === 0) {
                dishesListContainer.innerHTML = "<p>No hay platos cargados.</p>";
                return;
            }

            dishesListContainer.innerHTML = dishes.map(dish => `
                <div class="admin-dish-item">
                    <div class="admin-dish-info">
                        <span class="admin-dish-name">${dish.nombre} (Gs. ${dish.precio})</span>
                        <span class="admin-dish-meta">Cat: ${dish.categoria} | AR: ${dish.es_ar ? 'Sí' : 'No'} | Destacado: ${dish.destacado ? 'Sí' : 'No'}</span>
                    </div>
                    <div class="admin-dish-actions">
                        <button class="btn-edit" data-id="${dish.id}" data-dish='${JSON.stringify(dish).replace(/'/g, "&apos;")}'>
                            <i class="ph ph-pencil-simple"></i> Editar
                        </button>
                        <button class="btn-delete" data-id="${dish.id}">
                            <i class="ph ph-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `).join('');

            // Asignar eventos de edición y eliminación
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const dish = JSON.parse(e.currentTarget.getAttribute('data-dish'));
                    populateForm(dish);
                });
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm("¿Estás seguro de que querés eliminar este plato?")) {
                        const id = e.currentTarget.getAttribute('data-id');
                        await deleteDish(id);
                    }
                });
            });

        } catch (error) {
            dishesListContainer.innerHTML = "<p class='error'>Error al cargar los platos.</p>";
        }
    }

    async function deleteDish(id) {
        try {
            const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadDishes();
            } else {
                alert("Error al eliminar");
            }
        } catch (e) {
            console.error(e);
        }
    }

    // --- TABS LOGIC ---
    const tabNew = document.getElementById('tab-new');
    const tabList = document.getElementById('tab-list');
    const sectionForm = document.getElementById('section-form');
    const sectionList = document.getElementById('section-list');
    const formTitle = document.getElementById('form-title');

    function switchTab(tab) {
        if (tab === 'new') {
            tabNew.classList.add('active');
            tabNew.style.background = 'rgba(99, 102, 241, 0.2)';
            tabList.classList.remove('active');
            tabList.style.background = 'transparent';
            sectionForm.style.display = 'block';
            sectionList.style.display = 'none';
        } else {
            tabList.classList.add('active');
            tabList.style.background = 'rgba(99, 102, 241, 0.2)';
            tabNew.classList.remove('active');
            tabNew.style.background = 'transparent';
            sectionList.style.display = 'block';
            sectionForm.style.display = 'none';
        }
    }

    tabNew.addEventListener('click', () => switchTab('new'));
    tabList.addEventListener('click', () => switchTab('list'));

    function populateForm(dish) {
        dishIdInput.value = dish.id;
        document.getElementById('dish-name').value = dish.nombre;
        document.getElementById('dish-price').value = dish.precio;
        document.getElementById('dish-desc').value = dish.descripcion || "";
        document.getElementById('dish-category').value = dish.categoria;
        document.getElementById('dish-order').value = dish.orden || 100;
        document.getElementById('dish-price-offer').value = dish.precio_oferta || "";
        document.getElementById('dish-featured').checked = dish.destacado === 1;

        btnSave.innerHTML = '<i class="ph ph-floppy-disk"></i> Actualizar Plato';
        btnCancel.classList.remove('hidden');
        formTitle.textContent = "Editar Plato: " + dish.nombre;
        
        switchTab('new');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnCancel.addEventListener('click', () => {
        form.reset();
        dishIdInput.value = "";
        btnSave.innerHTML = '<i class="ph ph-check-circle"></i> Guardar y Publicar';
        btnCancel.classList.add('hidden');
        formTitle.textContent = "Añadir Nuevo Plato";
        ['drop-img', 'drop-glb', 'drop-usdz'].forEach(boxId => {
            const box = document.getElementById(boxId);
            box.classList.remove('has-file');
            if(boxId === 'drop-img') { box.querySelector('i').className = 'ph ph-image'; box.querySelector('span').textContent = 'Foto del Plato'; }
            if(boxId === 'drop-glb') { box.querySelector('i').className = 'ph ph-cube'; box.querySelector('span').textContent = 'Modelo 3D (Android)'; }
            if(boxId === 'drop-usdz') { box.querySelector('i').className = 'ph ph-apple-logo'; box.querySelector('span').textContent = 'Modelo 3D (iOS)'; }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnOriginalText = btnSave.innerHTML;
        btnSave.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Guardando...';
        btnSave.disabled = true;

        const id = dishIdInput.value;
        const name = document.getElementById('dish-name').value.trim();
        const price = document.getElementById('dish-price').value.trim();
        const desc = document.getElementById('dish-desc').value.trim();
        const category = document.getElementById('dish-category').value.trim();
        const order = document.getElementById('dish-order').value;
        const priceOffer = document.getElementById('dish-price-offer').value;
        const featured = document.getElementById('dish-featured').checked ? 1 : 0;
        
        const fileImg = document.getElementById('file-img').files[0];
        const fileGlb = document.getElementById('file-glb').files[0];
        const fileUsdz = document.getElementById('file-usdz').files[0];

        // --- VALIDACIONES ---
        if (!name || !price || !category) {
            alert("⚠️ Por favor, completá el nombre, precio y categoría. Son obligatorios.");
            btnSave.innerHTML = '<i class="ph ph-check-circle"></i> Guardar y Publicar';
            btnSave.disabled = false;
            return;
        }

        if (!id && !fileImg) {
            alert("⚠️ Por favor, subí una foto del plato. Es obligatoria para los platos nuevos.");
            btnSave.innerHTML = '<i class="ph ph-check-circle"></i> Guardar y Publicar';
            btnSave.disabled = false;
            return;
        }

        // Prevenir platos duplicados (por nombre exacto)
        // Solo verificamos si es un plato nuevo, o si le cambiaron el nombre a uno existente
        const dishListsElement = document.getElementById('admin-dishes-list');
        const existingDishesNames = Array.from(dishListsElement.querySelectorAll('.admin-dish-name')).map(el => el.textContent.split(' (Gs')[0].trim().toLowerCase());
        
        // Forma más segura buscando en nuestra data obtenida
        try {
            const resVal = await fetch(API_URL);
            const dataVal = await resVal.json();
            const esDuplicado = dataVal.find(p => p.nombre.toLowerCase() === name.toLowerCase() && p.id.toString() !== id);
            
            if (esDuplicado) {
                alert(`⚠️ Ya existe un plato con el nombre "${name}". No podés tener platos repetidos.`);
                btnSave.innerHTML = '<i class="ph ph-check-circle"></i> Guardar y Publicar';
                btnSave.disabled = false;
                return;
            }
        } catch(e) {
            console.error("No se pudo validar duplicidad", e);
        }

        // -------------------

        const formData = new FormData();
        if (id) formData.append('id', id);
        formData.append('nombre', name);
        formData.append('precio', price);
        formData.append('descripcion', desc);
        formData.append('categoria', category);
        formData.append('orden', order || 100);
        formData.append('destacado', featured);
        if (priceOffer) formData.append('precio_oferta', priceOffer);
        
        // Si hay archivos nuevos subidos, los enviamos
        if (fileImg) formData.append('imagen', fileImg);
        if (fileGlb) formData.append('modelo_glb', fileGlb);
        if (fileUsdz) formData.append('modelo_usdz', fileUsdz);

        // Determinamos si es AR (si subió un archivo o si ya era AR antes)
        // Por simplificación, el worker manejará esto si hay modelo_glb_url
        
        try {
            const respuesta = await fetch(API_URL, {
                method: 'POST', // El Worker decidirá si es INSERT o UPDATE según si hay ID
                body: formData
            });

            if (!respuesta.ok) throw new Error("Error en el servidor al guardar el plato");

            statusDiv.textContent = id ? "¡Plato actualizado con éxito!" : "¡Plato guardado con éxito!";
            statusDiv.className = "upload-status success";
            
            form.reset();
            dishIdInput.value = "";
            btnCancel.classList.add('hidden');
            formTitle.textContent = "Añadir Nuevo Plato";
            ['drop-img', 'drop-glb', 'drop-usdz'].forEach(boxId => {
                const box = document.getElementById(boxId);
                box.classList.remove('has-file');
                if(boxId === 'drop-img') { box.querySelector('i').className = 'ph ph-image'; box.querySelector('span').textContent = 'Foto del Plato'; }
                if(boxId === 'drop-glb') { box.querySelector('i').className = 'ph ph-cube'; box.querySelector('span').textContent = 'Modelo 3D (Android)'; }
                if(boxId === 'drop-usdz') { box.querySelector('i').className = 'ph ph-apple-logo'; box.querySelector('span').textContent = 'Modelo 3D (iOS)'; }
            });

            loadDishes();

        } catch (error) {
            console.error("Error al guardar:", error);
            statusDiv.textContent = "Error al guardar el plato.";
            statusDiv.className = "upload-status error";
        } finally {
            btnSave.innerHTML = '<i class="ph ph-check-circle"></i> Guardar y Publicar';
            btnSave.disabled = false;
        }
    });

    // Cargar los platos al iniciar el panel
    loadDishes();
});
