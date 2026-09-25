// URL exacta del Worker
const API_URL = "https://menu-api.lucas1912pereira.workers.dev"; 

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const modal3D = document.getElementById('ar-modal');
    let arViewer = null;
    const modelLoader = document.getElementById('modal-loading-state');
    
    const closeModalBtn = document.getElementById('close-modal-3d');
    const desktopWarning = document.getElementById('desktop-warning');
    
    const modalTitle = document.getElementById('modal-dish-title');
    const modalPrice = document.getElementById('modal-dish-price');
    const btnActivateAR = document.getElementById('btn-activate-ar');
    const btnModalDelivery = document.getElementById('modal-wa-button');

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
    let todosLosPlatos = [];
    const categoryNav = document.getElementById('nav-categories');

    async function cargarMenu() {
        if (!menuContainer) return;
        menuContainer.innerHTML = "<p class='loading'>Cargando la carta...</p>";

        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) throw new Error("Error en la conexión con la carta");
            
            todosLosPlatos = await respuesta.json();

            if (categoryNav) {
                const uniqueCats = [...new Set(todosLosPlatos.map(p => p.categoria).filter(Boolean))];
                let buttonsHTML = `<button class="category-nav-btn px-5 py-2 rounded-full font-label-md text-[13px] transition-all duration-300 bg-amber-gold text-black font-bold shadow-[0_2px_14px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95" data-categoria="Destacados">Destacados</button>`;
                uniqueCats.forEach(cat => {
                    // No duplicar Destacados si alguien lo puso como categoría literal
                    if(cat !== "Destacados") {
                        buttonsHTML += `<button class="category-nav-btn px-5 py-2 rounded-full font-label-md text-[13px] transition-all duration-300 text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95" data-categoria="${cat}">${cat}</button>`;
                    }
                });
                categoryNav.innerHTML = buttonsHTML;

                categoryNav.querySelectorAll('button').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        categoryNav.querySelectorAll('button').forEach(b => {
                            b.className = "category-nav-btn px-5 py-2 rounded-full font-label-md text-[13px] transition-all duration-300 text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95";
                        });
                        e.target.className = "category-nav-btn px-5 py-2 rounded-full font-label-md text-[13px] transition-all duration-300 bg-amber-gold text-black font-bold shadow-[0_2px_14px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95";
                        filtrarYRenderizar(e.target.getAttribute('data-categoria'));
                    });
                });
            }

            filtrarYRenderizar("Destacados");
        } catch (error) {
            console.error("Error al obtener el menú:", error);
            menuContainer.innerHTML = "<p class='error'>No se pudo cargar el menú en este momento.</p>";
        }
    }

    function filtrarYRenderizar(categoriaSeleccionada) {
        let platosFiltrados = [];
        if (categoriaSeleccionada === "Destacados") {
            platosFiltrados = todosLosPlatos.filter(p => p.destacado === 1);
            // Si no hay destacados, mostrar todos como fallback
            if (platosFiltrados.length === 0) platosFiltrados = todosLosPlatos;
        } else {
            platosFiltrados = todosLosPlatos.filter(p => p.categoria === categoriaSeleccionada);
        }
        
        if (platosFiltrados.length === 0) {
            menuContainer.innerHTML = "<p class='loading'>No hay platos en esta categoría.</p>";
        } else {
            renderizarMenu(platosFiltrados);
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
            tarjeta.className = "w-full"; 
            
            tarjeta.innerHTML = `
<article class="group relative rounded-2xl bg-[#141416]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500 hover:border-amber-gold/40 hover:shadow-[0_25px_60px_rgba(245,158,11,0.2)]">
<!-- Card Image Header -->
<div class="relative w-full aspect-[16/11] overflow-hidden bg-black/60">
<img alt="${plato.nombre}" class="w-full h-full object-cover transform duration-700 ease-out group-hover:scale-105" src="${plato.imagen_url}"/>
<div class="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/25 to-transparent"></div>
<!-- 3D AR Floating Badge -->
${plato.es_ar === 1 ? `
<div class="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/90 border border-amber-gold/50 shadow-xl text-amber-gold font-label-sm text-[12px] font-bold tracking-wide">
<span>✨</span>
<span>3D AR</span>
</div>` : ''}
<!-- Quick Experience Pill Bottom-Left on Image -->
<div class="absolute bottom-4 left-4 flex items-center gap-1.5 text-zinc-200 font-label-sm text-[12px] bg-black/85 px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
<span class="material-symbols-outlined text-[16px] text-amber-gold">view_in_ar</span>
<span>Proyección interactiva 1:1</span>
</div>
</div>
<!-- Card Body Content -->
<div class="p-6 md:p-8 flex flex-col">
<!-- Category & Badges -->
<div class="flex items-center justify-between gap-3 mb-2.5">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-chef-red"></span>
<span class="font-label-sm text-[11px] font-bold tracking-widest text-amber-gold uppercase">
                  ${plato.categoria}
                </span>
</div>
<span class="inline-flex items-center gap-1.5 text-emerald-400 font-label-sm text-[11px] bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-semibold shadow-sm">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> DISPONIBLE
              </span>
</div>
<!-- Title & Ingredients -->
<h2 class="font-headline-md text-[25px] md:text-[29px] text-white font-bold tracking-tight mb-2.5 leading-snug">
              ${plato.nombre}
            </h2>
<p class="font-body-md text-zinc-300 text-[14px] leading-relaxed mb-6 font-normal">
              ${plato.descripcion || ''}
            </p>
<!-- Pricing Banner -->
<div class="flex items-baseline justify-between mb-6 bg-black/80 border border-white/10 px-5 py-3.5 rounded-xl">
<span class="font-label-sm text-zinc-400 uppercase font-bold tracking-wider text-[11px]">Precio de Carta</span>
<div class="flex items-baseline gap-1">
<span class="font-headline-md text-amber-gold font-black text-[24px] tracking-tight">
                  ${precioGs}
                </span>
</div>
</div>
<!-- Action CTAs Stack -->
<div class="flex flex-col gap-3.5 w-full">
<!-- Primary 3D/AR Inspection Button -->
${plato.es_ar === 1 ? `
<button class="btn-ar group/btn relative w-full h-13 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-gold via-amber-glow to-amber-500 text-black font-label-lg text-label-lg font-bold flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all duration-300 overflow-hidden cursor-pointer" data-modelo="${plato.modelo_glb_url}" data-usdz="${plato.modelo_usdz_url || ''}" data-nombre="${plato.nombre}" data-precio="${precioGs}" data-imagen="${plato.imagen_url}" type="button">
<div class="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out"></div>
<span class="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover/btn:rotate-12">view_in_ar</span>
<span class="tracking-wide">Inspeccionar en 3D</span>
</button>
` : ''}
<!-- WhatsApp Direct Order Button -->
<button class="btn-delivery w-full h-13 py-3 px-6 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-label-lg text-label-lg font-bold flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer" data-nombre="${plato.nombre}" data-precio="${precioGs}">
<span class="text-[19px]">💬</span>
<span class="tracking-wide">Pedir este plato por WhatsApp</span>
</button>
</div>
</div>
</article>
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
            modelLoader.style.opacity = '1';
            modelLoader.style.display = 'flex';
            const loaderText = modelLoader.querySelector('p');
            if (loaderText) loaderText.textContent = "Cargando previsualización...";
            const spinner = modelLoader.querySelector('div');
            if (spinner) spinner.style.display = 'block';
        }
        
        modal3D.classList.remove('pointer-events-none', 'opacity-0');
        modal3D.classList.add('opacity-100');
        const panel = document.getElementById('modal-panel');
        if (panel) {
            panel.classList.remove('scale-95');
            panel.classList.add('scale-100');
        }

        // APAGAR EL SHADER DE FONDO PARA NO EXPLOTAR LA GPU (memoria)
        const shaderBg = document.getElementById('shader-canvas-ANIMATION_12');
        if (shaderBg) shaderBg.style.display = 'none';
        window.isShaderPaused = true;

        // 3. Llenar los datos del plato en el header del modal
        if (modalTitle) modalTitle.textContent = nombre;
        if (modalPrice) modalPrice.textContent = precio;

        // 4. Configurar el botón secundario del modal para que envíe el WhatsApp de este plato
        if (btnModalDelivery) {
            btnModalDelivery.onclick = () => pedirDelivery(nombre, precio);
        }

        const container = document.getElementById('viewport-3d');
        
        // REVERSIÓN: Usar un solo visor y reusarlo es MEJOR para evitar el límite de contextos WebGL (que causa la pantalla negra)
        if (!arViewer) {
            arViewer = document.createElement('model-viewer');
            arViewer.id = 'ar-viewer';
            arViewer.setAttribute('ar', '');
            // SOLO WEBXR y Quick Look (evita Scene Viewer nativo de Google)
            arViewer.setAttribute('ar-modes', 'webxr quick-look');
            arViewer.setAttribute('ar-scale', 'fixed');
            arViewer.setAttribute('ar-placement', 'floor');
            arViewer.setAttribute('camera-controls', '');
            arViewer.setAttribute('auto-rotate', '');
            arViewer.setAttribute('rotation-per-second', '20deg');
            arViewer.setAttribute('bounds', 'tight');
            arViewer.setAttribute('environment-image', 'neutral');
            arViewer.setAttribute('shadow-intensity', '1.5');
            arViewer.setAttribute('shadow-softness', '0.5');
            arViewer.setAttribute('exposure', '1');
            arViewer.setAttribute('loading', 'lazy');
            // Quitamos 'none' para que exija escanear la mesa y construya una superficie firme
            arViewer.setAttribute('interaction-prompt', 'auto');
            arViewer.setAttribute('interaction-prompt-style', 'basic');
            // Bloqueamos interacciones de reposicionamiento accidental (que causan saltos)
            arViewer.setAttribute('disable-pan', '');
            arViewer.setAttribute('disable-tap', '');

            // Listeners de eventos (Solo se agregan 1 vez)
            arViewer.addEventListener('ar-status', (event) => {
                if (event.detail.status === 'failed') {
                    console.warn('AR no soportado o fallido en este equipo');
                    alert("No se pudo iniciar la cámara AR en este navegador. Probá abriendo el enlace directamente en Safari o Chrome.");
                }
                if (event.detail.status === 'session-started') {
                    // Ocultar del DOM (ahorra cálculos de composición visual del navegador)
                    arViewer.style.visibility = 'hidden';
                }
                if (event.detail.status === 'not-presenting') {
                    arViewer.style.visibility = 'visible';
                }
            });

            arViewer.addEventListener('load', () => {
                if (modelLoader) {
                    modelLoader.style.opacity = '0';
                    setTimeout(() => {
                        modelLoader.style.display = 'none';
                    }, 400);
                }
            });

            arViewer.addEventListener('error', (event) => {
                console.error('Error cargando el modelo 3D:', event);
                if (modelLoader) {
                    const loaderText = modelLoader.querySelector('p');
                    if (loaderText) loaderText.textContent = "Error al cargar el modelo 3D.";
                    const spinner = modelLoader.querySelector('div');
                    if (spinner) spinner.style.display = 'none';
                }
            });

            container.innerHTML = ''; // Clear placeholder
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
                } else {
                    // Solo lanza la cámara de AR cuando el usuario hace clic aquí
                    arViewer.activateAR();
                }
            };
        }
    }

    function pedirDelivery(nombre, precio) {
        const telefono = "595981XXXXXX"; // Reemplaza por tu número
        const mensaje = `¡Hola! Quiero consultar para pedir por delivery: ${nombre} (${precio}). ¿Tienen disponible?`;
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (!modal3D) return;
            const panel = document.getElementById('modal-panel');
            if (panel) {
                panel.classList.remove('scale-100');
                panel.classList.add('scale-95');
            }
            modal3D.classList.remove('opacity-100');
            modal3D.classList.add('opacity-0');

            // PRENDER EL SHADER DE FONDO NUEVAMENTE
            const shaderBg = document.getElementById('shader-canvas-ANIMATION_12');
            if (shaderBg) shaderBg.style.display = 'block';
            window.isShaderPaused = false;
            setTimeout(() => {
                modal3D.classList.add('pointer-events-none');
                if (arViewer) {
                    arViewer.removeAttribute('src');
                    arViewer.removeAttribute('ios-src');
                }
            }, 250);
        });
    }

    // Iniciar app
    cargarMenu();
});
