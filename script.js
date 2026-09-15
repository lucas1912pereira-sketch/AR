/**
 * Datos de Prueba para la PoC.
 * 
 * TODO PARA PRODUCCIÓN: 
 * Reemplazar las URLs en 'modeloGlb' y 'modeloUsdz' por los enlaces reales
 * a tus modelos 3D alojados en tu bucket de Cloudflare R2 (ej. https://pub-xxx.r2.dev/modelo.glb).
 */
const menuItems = [
    {
        id: 1,
        nombre: "Brochetas de Carne",
        precio: "$14.50",
        descripcion: "Exquisitas brochetas a la parrilla con verduras de temporada y especias finas.",
        // URL pública de Khronos Group/ModelViewer para pruebas
        modeloGlb: "https://modelviewer.dev/shared-assets/models/shishkebab.glb",
        modeloUsdz: "", 
        poster: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        nombre: "Pastel Espacial (Postre)",
        precio: "$8.99",
        descripcion: "Un postre de otro mundo con cobertura de chocolate negro y polvo de estrellas (Prueba de modelo).",
        // URL pública para pruebas
        modeloGlb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        modeloUsdz: "https://modelviewer.dev/shared-assets/models/Astronaut.usdz", // Ejemplo de soporte iOS
        poster: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        nombre: "Cóctel Robótico",
        precio: "$10.00",
        descripcion: "Nuestra bebida insignia servida con precisión milimétrica (Prueba de modelo).",
        // URL pública para pruebas
        modeloGlb: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
        modeloUsdz: "",
        poster: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const arModal = document.getElementById('ar-modal');
    const arViewer = document.getElementById('ar-viewer');
    const closeModalBtn = document.getElementById('close-modal');

    // 1. Renderizar la lista de platos
    function renderMenu() {
        menuContainer.innerHTML = '';
        
        menuItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            
            card.innerHTML = `
                <img src="${item.poster}" alt="${item.nombre}" class="card-image" loading="lazy">
                <div class="card-content">
                    <h2 class="card-title">${item.nombre}</h2>
                    <p class="card-description">${item.descripcion}</p>
                    <div class="card-footer">
                        <span class="card-price">${item.precio}</span>
                        <button class="btn-ar" data-id="${item.id}" aria-label="Ver en Realidad Aumentada">
                            <!-- Icono de Caja/3D SVG -->
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            Ver en tu mesa (AR)
                        </button>
                    </div>
                </div>
            `;
            
            menuContainer.appendChild(card);
        });

        // Event listeners a los botones AR recién creados
        document.querySelectorAll('.btn-ar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                openARModal(id);
            });
        });
    }

    // 2. Lógica para abrir el visor AR dinámicamente
    function openARModal(id) {
        const item = menuItems.find(i => i.id === id);
        if (item) {
            // Actualizar fuentes (src) dinámicamente para GLB y USDZ (iOS)
            arViewer.src = item.modeloGlb;
            
            if (item.modeloUsdz) {
                arViewer.setAttribute('ios-src', item.modeloUsdz);
            } else {
                arViewer.removeAttribute('ios-src');
            }
            
            // Imagen póster mientras carga el 3D
            arViewer.poster = item.poster;
            arViewer.alt = `Modelo 3D de ${item.nombre}`;
            
            // Mostrar modal
            arModal.classList.remove('hidden');
        }
    }

    // 3. Cerrar Modal
    closeModalBtn.addEventListener('click', () => {
        arModal.classList.add('hidden');
    });

    // Inicializar app
    renderMenu();
});
