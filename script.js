/**
 * Datos de Prueba para la PoC.
 * Modelos de prueba reales alojados en el repositorio de Khronos Group.
 */
const menuItems = [
    {
        id: 1,
        nombre: "Torta de Frutilla Artesanal",
        precio: "$4.50",
        descripcion: "Exquisita torta con una suave cubierta y detalles irresistibles.",
        modeloGlb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
        modeloUsdz: "", 
        poster: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        nombre: "Corte de Bife Grillado",
        precio: "$14.00",
        descripcion: "Un jugoso corte de bife a la parrilla, ideal para los amantes de la buena carne.",
        modeloGlb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        modeloUsdz: "", 
        poster: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        nombre: "Lata de Refresco Fría",
        precio: "$2.00",
        descripcion: "Bebida refrescante clásica para acompañar tu comida.",
        modeloGlb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
        modeloUsdz: "",
        poster: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const arModal = document.getElementById('ar-modal');
    const arViewer = document.getElementById('ar-viewer');
    const arButton = document.getElementById('ar-button');
    const closeModalBtn = document.getElementById('close-modal');
    const desktopWarning = document.getElementById('desktop-warning');

    // Solo mostrar el botón si el dispositivo realmente soporta AR
    arViewer.addEventListener('ar-status', (event) => {
        if (event.detail.status === 'failed') {
            console.log('AR no soportado en este equipo');
            arButton.style.display = 'none';
        } else {
            arButton.style.display = 'block';
        }
    });

    // Detección básica de móvil para mostrar el banner en Desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        desktopWarning.classList.remove('hidden');
    }

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
                            ${isMobile ? 'Ver en tu mesa' : 'No disponible en PC'}
                        </button>
                    </div>
                </div>
            `;
            
            menuContainer.appendChild(card);
        });

        // Event listeners a los botones AR recién creados
        document.querySelectorAll('.btn-ar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!isMobile) {
                    alert("Para probar la funcionalidad AR completa, debes abrir esta página desde un dispositivo móvil.");
                }
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                openARModal(id);
            });
        });
    }

    // 2. Lógica para abrir el visor AR dinámicamente
    async function openARModal(id) {
        const item = menuItems.find(i => i.id === id);
        if (item) {
            // Actualizar fuentes (src) dinámicamente. 
            arViewer.src = item.modeloGlb || "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
            
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

            // Intentar ejecutar activateAR automáticamente si es móvil.
            if (isMobile) {
                try {
                    // Es buena idea esperar un breve instante para asegurar que model-viewer tomó los atributos.
                    setTimeout(() => {
                        arViewer.activateAR();
                    }, 300);
                } catch (e) {
                    console.warn("No se pudo auto-activar AR. El usuario deberá tocar el botón de AR manualmente:", e);
                }
            }
        }
    }

    // 3. Cerrar Modal
    closeModalBtn.addEventListener('click', () => {
        arModal.classList.add('hidden');
    });

    // Inicializar app
    renderMenu();
});
