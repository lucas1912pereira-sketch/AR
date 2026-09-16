// URL exacta del Worker
const API_URL = "https://menu-api.lucas1912pereira.workers.dev"; 

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const modal3D = document.getElementById('modal-visor-3d');
    const arViewer = document.getElementById('ar-viewer');
    const modelLoader = document.getElementById('model-loader');
    
    const closeModalBtn = document.getElementById('close-modal-3d');
    const desktopWarning = document.getElementById('desktop-warning');
    
    const modalTitle = document.getElementById('modal-3d-title');
    const modalPrice = document.getElementById('modal-3d-price');
    const btnActivateAR = document.getElementById('btn-activate-ar');
    const btnModalDelivery = document.getElementById('btn-modal-delivery');

    // Detección básica de móvil para advertir en Desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile && desktopWarning) {
        desktopWarning.classList.remove('hidden');
    }

    let esInAppBrowserIOS = false;

    function verificarEntornoNavegacion() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const esIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        
        // Cadenas comunes en In-App Browsers
        const inAppRegex = /FBAN|FBAV|Instagram|WhatsApp|Line|Messenger/i;
        
        if (esIOS && inAppRegex.test(ua)) {
            esInAppBrowserIOS = true;
            const banner = document.getElementById('banner-abrir-safari');
            if (banner) banner.classList.remove('hidden');
        }
    }
    
    verificarEntornoNavegacion();
    
    const closeBannerBtn = document.getElementById('close-banner-ios');
    if (closeBannerBtn) {
        closeBannerBtn.addEventListener('click', () => {
            const banner = document.getElementById('banner-abrir-safari');
            if (banner) banner.classList.add('hidden');
        });
    }

    // Comprobar si el AR está soportado (opcional, para ocultar botón si falla completamente)
    if (arViewer) {
        arViewer.addEventListener('ar-status', (event) => {
            if (event.detail.status === 'failed') {
                console.warn('AR no soportado o fallido en este equipo');
                alert("No se pudo iniciar la cámara AR en este navegador. Probá abriendo el enlace directamente en Safari o Chrome.");
            }
        });
    }

    async function cargarMenu() {
        if (!menuContainer) return;
        menuContainer.innerHTML = "<p class='loading'>Cargando la carta...</p>";

        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) throw new Error("Error en la conexión con la carta");
            
            const platos = await respuesta.json();
            renderizarMenu(platos);
        } catch (error) {
            console.error("Error al obtener el menú:", error);
            menuContainer.innerHTML = "<p class='error'>No se pudo cargar el menú en este momento.</p>";
        }
    }

    function renderizarMenu(platos) {
        if (!menuContainer) return;
        menuContainer.innerHTML = "";

        platos.forEach(plato => {
            // Formatear precio a Guaraníes: Gs. XX.XXX
            const precioFormateado = new Intl.NumberFormat('es-PY', { 
                maximumFractionDigits: 0 
            }).format(plato.precio);
            const precioGs = `Gs. ${precioFormateado}`;

            const tarjeta = document.createElement("div");
            tarjeta.className = "plato-card"; 
            
            tarjeta.innerHTML = `
                <div class="plato-img-container">
                    <img src="${plato.imagen_url}" alt="${plato.nombre}" class="plato-img" loading="lazy">
                    ${plato.es_ar === 1 ? '<span class="badge-ar">✨ 3D AR</span>' : ''}
                </div>

                <div class="plato-info">
                    <span class="plato-categoria">${plato.categoria}</span>
                    <h3>${plato.nombre}</h3>
                    <p class="plato-desc">${plato.descripcion || ''}</p>
                    <span class="plato-precio">${precioGs}</span>

                    <div class="plato-acciones">
                    ${plato.es_ar === 1 ? `
                        <button class="btn-ar" data-modelo="${plato.modelo_glb_url}" data-usdz="${plato.modelo_usdz_url || ''}" data-nombre="${plato.nombre}" data-precio="${precioGs}" data-imagen="${plato.imagen_url}">
                        Inspeccionar en 3D
                        </button>
                    ` : ''}
                    
                    <button class="btn-delivery" data-nombre="${plato.nombre}" data-precio="${precioGs}">
                        Pedir por WhatsApp
                    </button>
                    </div>
                </div>
            `;

            menuContainer.appendChild(tarjeta);
        });

        // Asignar eventos a los botones de 3D
        document.querySelectorAll('.btn-ar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modeloUrl = e.currentTarget.getAttribute('data-modelo');
                const usdzUrl = e.currentTarget.getAttribute('data-usdz');
                const nombre = e.currentTarget.getAttribute('data-nombre');
                const precio = e.currentTarget.getAttribute('data-precio');
                const imagenUrl = e.currentTarget.getAttribute('data-imagen');
                abrirVisor3D(modeloUrl, usdzUrl, nombre, precio, imagenUrl);
            });
        });

        // Asignar eventos a botones de Delivery
        document.querySelectorAll('.btn-delivery').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombre = e.currentTarget.getAttribute('data-nombre');
                const precio = e.currentTarget.getAttribute('data-precio');
                pedirDelivery(nombre, precio);
            });
        });
    }

    function abrirVisor3D(modeloUrl, usdzUrl, nombre, precio, imagenUrl) {
        if (!arViewer || !modal3D) return;

        // 1. Limpiar el src anterior para evitar el efecto fantasma (flickering del plato previo)
        arViewer.removeAttribute('src');
        
        // 2. Mostrar el loader visual y el modal
        if (modelLoader) modelLoader.style.display = 'flex';
        modal3D.classList.remove('hidden');

        // 3. Llenar los datos del plato en el header del modal
        if (modalTitle) modalTitle.textContent = nombre;
        if (modalPrice) modalPrice.textContent = precio;

        // 4. Configurar el botón secundario del modal para que envíe el WhatsApp de este plato
        if (btnModalDelivery) {
            btnModalDelivery.onclick = () => pedirDelivery(nombre, precio);
        }

        // 5. Establecer el nuevo modelo 3D a descargar y el poster (fallback 2D)
        if (imagenUrl) {
            arViewer.poster = imagenUrl;
        } else {
            arViewer.removeAttribute('poster');
        }
        arViewer.src = modeloUrl;
        if (usdzUrl) {
            arViewer.iosSrc = usdzUrl;
        } else {
            arViewer.removeAttribute('ios-src');
        }
        arViewer.alt = `Modelo 3D de ${nombre}`;

        arViewer.cameraTarget = "auto auto auto";
        arViewer.cameraOrbit = "0deg 75deg auto";
        arViewer.fieldOfView = "auto";
        arViewer.jumpCameraToGoal();

        // 6. Activar botón AR explícito (No fuerza apertura invasiva)
        if (btnActivateAR) {
            btnActivateAR.onclick = () => {
                if (!isMobile) {
                    alert("Para proyectar el plato en tu mesa real, necesitas abrir este menú desde tu teléfono móvil.");
                } else if (esInAppBrowserIOS) {
                    alert("Para proyectar platos en tu mesa con iPhone, tocá los 3 puntos (o el ícono de brújula/compartir) y seleccioná 'Abrir en Safari'.");
                } else {
                    // Solo lanza la cámara de AR cuando el usuario hace clic aquí
                    arViewer.activateAR();
                }
            };
        }
    }

    // Escuchar el momento exacto en que termina de cargar el nuevo modelo 3D
    if (arViewer) {
        arViewer.addEventListener('load', () => {
            // Ocultar spinner
            if (modelLoader) modelLoader.style.display = 'none';
        });
    }

    function pedirDelivery(nombre, precio) {
        const telefono = "595981XXXXXX"; // Reemplaza por tu número
        const mensaje = `¡Hola! Quiero consultar para pedir por delivery: ${nombre} (${precio}). ¿Tienen disponible?`;
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }

    // Cerrar el modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modal3D) modal3D.classList.add('hidden');
        });
    }

    // Iniciar app
    cargarMenu();
});
