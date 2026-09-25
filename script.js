// URL exacta del Worker
const API_URL = "https://menu-api.lucas1912pereira.workers.dev"; 

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const modal3D = document.getElementById('modal-visor-3d');
    let arViewer = null;
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
        const esAndroid = /Android/i.test(ua);
        
        // Cadenas comunes en In-App Browsers
        const inAppRegex = /FBAN|FBAV|Instagram|WhatsApp|Line|Messenger/i;
        
        if (inAppRegex.test(ua)) {
            const banner = document.getElementById('banner-abrir-safari');
            
            if (esAndroid) {
                // En Android, intentamos forzar la apertura en el navegador predeterminado mediante intent
                const currentUrl = window.location.href.replace(/^https?:\/\//, '');
                window.location.href = `intent://${currentUrl}#Intent;scheme=https;end;`;
                
                // Si la redirección falla o no es soportada, mostramos un aviso
                if (banner) {
                    banner.querySelector('p').innerHTML = "⚠️ Tu navegador actual bloquea la Realidad Aumentada. Tocá los 3 puntos arriba a la derecha y seleccioná 'Abrir en el navegador'.";
                    banner.classList.remove('hidden');
                }
            } else if (esIOS) {
                esInAppBrowserIOS = true;
                if (banner) {
                    banner.querySelector('p').innerHTML = "⚠️ Tu navegador actual bloquea la Realidad Aumentada. Tocá el ícono inferior (brújula) y seleccioná 'Abrir en Safari'.";
                    banner.classList.remove('hidden');
                }
            }
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

    // (Los listeners de AR se asignarán dinámicamente al abrir el visor)

    async function cargarMenu() {
        if (!menuContainer) return;
        menuContainer.innerHTML = "<p class='loading'>Cargando la carta...</p>";

        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) throw new Error("Error en la conexión con la carta");
            
            let platos = await respuesta.json();
            // Filtrar para mostrar la hamburguesa con los nuevos modelos
            platos = platos.filter(plato => plato.nombre.toLowerCase().includes('hamburguesa'));
            platos.forEach(plato => {
                plato.modelo_glb_url = "https://pub-a0c3e42adcc7481ca1b17d7e005659b6.r2.dev/hamburguesa.glb";
                plato.modelo_usdz_url = "https://pub-a0c3e42adcc7481ca1b17d7e005659b6.r2.dev/hamburguesa.usdz";
            });
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
        if (!modal3D) return;

        // Mostrar el loader visual y el modal
        if (modelLoader) {
            modelLoader.style.display = 'flex';
            const loaderText = modelLoader.querySelector('p');
            if (loaderText) loaderText.textContent = "Cargando modelo 3D...";
            const spinner = modelLoader.querySelector('.spinner');
            if (spinner) spinner.style.display = 'block';
        }
        modal3D.classList.remove('hidden');

        // 3. Llenar los datos del plato en el header del modal
        if (modalTitle) modalTitle.textContent = nombre;
        if (modalPrice) modalPrice.textContent = precio;

        // 4. Configurar el botón secundario del modal para que envíe el WhatsApp de este plato
        if (btnModalDelivery) {
            btnModalDelivery.onclick = () => pedirDelivery(nombre, precio);
        }

        // 5. Crear el visor 3D si no existe (Reutilizar instancia para no agotar contextos WebGL)
        const container = document.querySelector('.model-viewer-container');
        
        if (!arViewer) {
            arViewer = document.createElement('model-viewer');
            arViewer.id = 'ar-viewer';
            arViewer.setAttribute('ar', '');
            arViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
            arViewer.setAttribute('ar-scale', 'auto');
            arViewer.setAttribute('ar-placement', 'floor');
            arViewer.setAttribute('camera-controls', '');
            arViewer.setAttribute('disable-tap', '');
            arViewer.setAttribute('auto-rotate', '');
            arViewer.setAttribute('rotation-per-second', '20deg');
            arViewer.setAttribute('bounds', 'tight');
            arViewer.setAttribute('environment-image', 'neutral');
            arViewer.setAttribute('shadow-intensity', '1.5');
            arViewer.setAttribute('shadow-softness', '0.5');
            arViewer.setAttribute('exposure', '1');
            arViewer.setAttribute('loading', 'lazy');
            arViewer.setAttribute('interaction-prompt', 'none');

            // Listeners de eventos (Solo se agregan 1 vez)
            arViewer.addEventListener('ar-status', (event) => {
                if (event.detail.status === 'failed') {
                    console.warn('AR no soportado o fallido en este equipo');
                    alert("No se pudo iniciar la cámara AR en este navegador. Probá abriendo el enlace directamente en Safari o Chrome.");
                }
            });

            arViewer.addEventListener('load', () => {
                if (modelLoader) modelLoader.style.display = 'none';
            });

            arViewer.addEventListener('error', (event) => {
                console.error('Error cargando el modelo 3D:', event);
                if (modelLoader) {
                    const loaderText = modelLoader.querySelector('p');
                    if (loaderText) loaderText.textContent = "Error al cargar el modelo 3D.";
                    const spinner = modelLoader.querySelector('.spinner');
                    if (spinner) spinner.style.display = 'none';
                }
            });

            container.appendChild(arViewer);
        }

        // Actualizar datos dinámicos para el plato actual
        arViewer.setAttribute('alt', `Modelo 3D de ${nombre}`);
        
        if (imagenUrl) {
            arViewer.setAttribute('poster', imagenUrl);
        } else {
            arViewer.removeAttribute('poster');
        }
        
        // Pequeño delay para que el modal termine de hacerse visible antes de cargar los pesos pesados
        setTimeout(() => {
            if (arViewer) {
                // Si el modelo ya es el mismo y está cargado, ocultar el loader enseguida
                if (arViewer.getAttribute('src') === modeloUrl) {
                    if (modelLoader) modelLoader.style.display = 'none';
                } else {
                    arViewer.setAttribute('src', modeloUrl);
                }
                
                if (usdzUrl) {
                    arViewer.setAttribute('ios-src', usdzUrl);
                } else {
                    arViewer.removeAttribute('ios-src');
                }
                
                if (typeof arViewer.dismissPoster === 'function') {
                    arViewer.dismissPoster();
                }
            }
        }, 150);

        // 6. Activar botón AR explícito (No fuerza apertura invasiva)
        if (btnActivateAR) {
            btnActivateAR.onclick = () => {
                const banner = document.getElementById('banner-abrir-safari');
                const enInAppBrowser = banner && !banner.classList.contains('hidden');
                
                if (!isMobile) {
                    alert("Para proyectar el plato en tu mesa real, necesitas abrir este menú desde tu teléfono móvil.");
                } else if (enInAppBrowser) {
                    alert("El visor AR está bloqueado en este navegador. Por favor, seguí las instrucciones del banner superior para abrir el menú en tu navegador principal.");
                } else {
                    // Solo lanza la cámara de AR cuando el usuario hace clic aquí
                    arViewer.activateAR();
                }
            };
        }
    }

    // Los listeners de arViewer ahora se gestionan dentro de abrirVisor3D

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
