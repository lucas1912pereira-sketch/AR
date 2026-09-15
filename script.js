// URL exacta del Worker
const API_URL = "https://menu-api.lucas1912pereira.workers.dev"; 

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const arModal = document.getElementById('ar-modal');
    const arViewer = document.getElementById('ar-viewer');
    const arButton = document.getElementById('ar-button');
    const closeModalBtn = document.getElementById('close-modal');
    const desktopWarning = document.getElementById('desktop-warning');

    // Solo mostrar el botón si el dispositivo realmente soporta AR
    if (arViewer) {
        arViewer.addEventListener('ar-status', (event) => {
            if (event.detail.status === 'failed') {
                console.log('AR no soportado en este equipo');
                arButton.style.display = 'none';
            } else {
                arButton.style.display = 'block';
            }
        });
    }

    // Detección básica de móvil para mostrar el banner en Desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile && desktopWarning) {
        desktopWarning.classList.remove('hidden');
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
                        <button class="btn-ar" data-modelo="${plato.modelo_glb_url}" data-nombre="${plato.nombre}">
                        Ver en tu mesa
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

        // Asignar eventos a los botones recién creados
        document.querySelectorAll('.btn-ar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!isMobile) {
                    alert("Para probar la funcionalidad AR completa, debes abrir esta página desde un dispositivo móvil.");
                }
                const modeloUrl = e.currentTarget.getAttribute('data-modelo');
                const nombre = e.currentTarget.getAttribute('data-nombre');
                abrirVisorAR(modeloUrl, nombre);
            });
        });

        document.querySelectorAll('.btn-delivery').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombre = e.currentTarget.getAttribute('data-nombre');
                const precio = e.currentTarget.getAttribute('data-precio');
                pedirDelivery(nombre, precio);
            });
        });
    }

    function abrirVisorAR(modeloUrl, nombrePlato) {
        if (arViewer) {
            arViewer.src = modeloUrl;
            arViewer.alt = `Modelo 3D de ${nombrePlato}`;
            
            // Eliminar ios-src ya que el worker no lo retorna por ahora
            arViewer.removeAttribute('ios-src');
            
            // Mostrar modal
            if (arModal) {
                arModal.classList.remove('hidden');
            }

            // Activar AR en móvil
            if (isMobile) {
                try {
                    setTimeout(() => {
                        arViewer.activateAR();
                    }, 300);
                } catch (e) {
                    console.warn("No se pudo auto-activar AR. El usuario deberá tocar el botón de AR manualmente:", e);
                }
            }
        }
    }

    function pedirDelivery(nombre, precio) {
        const telefono = "595981XXXXXX"; // El número del local con código de país
        const mensaje = `¡Hola! Quiero consultar para pedir por delivery: ${nombre} (${precio}). ¿Tienen disponible?`;
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }

    // Cerrar Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (arModal) arModal.classList.add('hidden');
        });
    }

    // Iniciar
    cargarMenu();
});
