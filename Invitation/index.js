// Simple Countdown logic
const weddingDate = new Date("February 27, 2027 00:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance <= 0) {
    clearInterval(interval);
    const countdownElement = document.getElementById("countdown");
    if (countdownElement) {
      countdownElement.innerHTML =
        "<span class='font-display-lg text-display-lg text-secondary'>Nuestro día</span>";
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (daysEl) daysEl.innerText = days.toString().padStart(2, "0");
  if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, "0");
  if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, "0");
  if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, "0");
}

const interval = setInterval(updateCountdown, 1000);
updateCountdown();

// Navbar interaction
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  const nav = document.querySelector("nav");

  if (nav) {
    if (currentScroll <= 0) {
      nav.classList.remove("shadow-sm");
      return;
    }

    if (currentScroll > lastScroll) {
      // Scroll down
      nav.style.transform = "translateY(-100%)";
    } else {
      // Scroll up
      nav.style.transform = "translateY(0)";
      nav.classList.add("shadow-sm");
    }
  }
  lastScroll = currentScroll;
});

// Animación del sobre
document.addEventListener('DOMContentLoaded', () => {
  const sealBtn = document.getElementById('seal-btn');
  const envelopeScreen = document.getElementById('envelope-screen');

  if (sealBtn && envelopeScreen) {
    sealBtn.addEventListener('click', () => {
      envelopeScreen.classList.add('is-open');

      setTimeout(() => {
        envelopeScreen.classList.add('is-hidden');
        document.body.classList.remove('no-scroll');
      }, 600);

      setTimeout(() => {
        envelopeScreen.style.display = 'none';
      }, 1400);
    });
  }
});

// Envío a Google Sheets unificado con Validación
document.getElementById('nx_formulario_asistencia').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nxContenedorMensaje = document.getElementById('nx_alerta_msj');
  const nxBotonAccion = document.getElementById('nx_boton_enviar');
  const nxEtiquetaBoton = document.getElementById('nx_texto_boton');
  const nxIndicadorCarga = document.getElementById('nx_animacion_carga');
  const nxFormulario = this;

  const nxNombreVal = document.getElementById('nx_campo_nombre').value.trim();
  const nxApellidoVal = document.getElementById('nx_campo_apellido').value.trim();
  const nxEdadVal = parseInt(document.getElementById('nx_campo_edad').value, 10);
  const nxDietaVal = document.getElementById('nx_campo_dieta').value.trim();

  const nxSoloLetrasRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;

  nxContenedorMensaje.className = 'text-center font-body-md mb-6 p-4 rounded text-red-800 bg-red-100';

  if (nxNombreVal.length < 2 || !nxSoloLetrasRegex.test(nxNombreVal)) {
    nxContenedorMensaje.textContent = 'Por favor, ingresa un nombre válido (solo letras).';
    nxContenedorMensaje.classList.remove('nx_ocultar');
    return;
  }

  if (nxApellidoVal.length < 2 || !nxSoloLetrasRegex.test(nxApellidoVal)) {
    nxContenedorMensaje.textContent = 'Por favor, ingresa un apellido válido (solo letras).';
    nxContenedorMensaje.classList.remove('nx_ocultar');
    return;
  }

  if (isNaN(nxEdadVal) || nxEdadVal < 0 || nxEdadVal > 120) {
    nxContenedorMensaje.textContent = 'Por favor, ingresa una edad real (entre 0 y 120 años).';
    nxContenedorMensaje.classList.remove('nx_ocultar');
    return;
  }

  nxContenedorMensaje.classList.add('nx_ocultar');
  nxBotonAccion.disabled = true;
  nxEtiquetaBoton.textContent = 'Enviando...';
  nxIndicadorCarga.classList.remove('nx_ocultar');

  const nxUrl = "https://script.google.com/macros/s/AKfycbzz32EvZfaEx9GdMd5sokiUCqmsGbwBZiQ7w4XmyYWOXlLlp1qv7lpXyIU4DXtBuZsOnA/exec";
  
  const nxPayload = {
    nombre: nxNombreVal,
    apellido: nxApellidoVal,
    dieta: nxDietaVal,
    edad: nxEdadVal,
    fechaDeRegistro: new Date().toISOString().split('T')[0]
  };

  try {
    const nxRespuesta = await fetch(nxUrl, {
      method: "POST",
      body: JSON.stringify(nxPayload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      redirect: "follow"
    });

    const nxResultado = await nxRespuesta.json();

    if (nxResultado.status === "success") {
      nxEtiquetaBoton.textContent = "¡Confirmado!";
      nxBotonAccion.classList.replace("bg-tertiary", "bg-secondary");
      nxIndicadorCarga.classList.add('nx_ocultar');

      setTimeout(() => {
        nxFormulario.classList.add('nx_ocultar');
        nxContenedorMensaje.textContent = '¡Gracias por confirmar tu asistencia!';
        nxContenedorMensaje.className = 'text-center font-body-md mb-6 p-4 rounded bg-green-100 text-green-800 block';
      }, 1500);

    } else {
      throw new Error('Error en el servidor de Sheets');
    }
  } catch (nxFalla) {
    nxContenedorMensaje.textContent = 'Hubo un error al enviar. Por favor, intenta de nuevo.';
    nxContenedorMensaje.className = 'text-center font-body-md mb-6 p-4 rounded bg-red-100 text-red-800 block';
    
    nxBotonAccion.disabled = false;
    nxEtiquetaBoton.textContent = 'Enviar Confirmación';
    nxIndicadorCarga.classList.add('nx_ocultar');
  }
});

// ==========================================
// LÓGICA DEL MODAL Y PORTAPAPELES
// ==========================================

// Abrir Modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    // Pequeño retraso para permitir que el navegador procese el display antes de animar
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      modal.querySelector('div').classList.remove('scale-95');
      modal.querySelector('div').classList.add('scale-100');
    }, 10);
    // Bloquear el scroll del fondo
    document.body.classList.add('overflow-hidden');
  }
}

// Cerrar Modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.remove('scale-100');
    modal.querySelector('div').classList.add('scale-95');

    // Esperar a que termine la transición de Tailwind (300ms) antes de ocultar
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }, 300);
  }
}

// Cerrar modal al hacer clic en el fondo oscuro
document.addEventListener('click', (e) => {
  const modal = document.getElementById('bankModal');
  if (modal && !modal.classList.contains('hidden')) {
    if (e.target === modal) {
      closeModal('bankModal');
    }
  }
});

// Función para copiar texto
async function copyText(elementId, btnElement) {
  const textToCopy = document.getElementById(elementId).innerText;
  const iconSpan = btnElement.querySelector('span');

  try {
    await navigator.clipboard.writeText(textToCopy);

    // Feedback visual: Cambiar el ícono a un tilde verde
    iconSpan.innerText = 'check';
    iconSpan.classList.remove('text-secondary');
    iconSpan.classList.add('text-green-600');

    // Volver al ícono original después de 2 segundos
    setTimeout(() => {
      iconSpan.innerText = 'content_copy';
      iconSpan.classList.remove('text-green-600');
      iconSpan.classList.add('text-secondary');
    }, 2000);

  } catch (err) {
    console.error('Error al intentar copiar al portapapeles: ', err);
    alert('No se pudo copiar el texto. Por favor, seleccionalo manualmente.');
  }
}

// ==========================================
// animacion nombres 
// ==========================================

function animarFirma() {
  const svg = document.querySelector('.firma-animada');
  if (!svg) return;

  const paths = Array.from(svg.querySelectorAll('path'));

  paths.sort((a, b) => a.getBBox().x - b.getBBox().x);

  let delayAcumulado = 0;
  const velocidad = 0.00025;

  paths.forEach((path) => {
    const length = path.getTotalLength();
    path.style.setProperty('--length', length);

    const duracion = Math.max(length * velocidad, 0.1);

    path.style.setProperty('--duracion', `${duracion}s`);
    path.style.setProperty('--delay', `${delayAcumulado}s`);

    delayAcumulado += duracion;
  });

  svg.style.setProperty('--tiempo-total', `${delayAcumulado + 0.5}s`);

  const img = new Image();
  
  if (window.innerWidth >= 768) {
      img.src = './img/espaldaatardecer.jpg';
  } else {
      img.src = './img/fondo2.jpg';
  }

  img.onload = () => {
      svg.classList.add('iniciar-animacion');
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', animarFirma);
} else {
  animarFirma();
  setTimeout(animarFirma, 150);
}

// Ejecución segura para asegurarnos de que la web haya cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', animarFirma);
} else {
  animarFirma();
  // Doble chequeo por si el navegador demoró en renderizar el tamaño
  setTimeout(animarFirma, 150);
}


//animacioones divs

document.addEventListener("DOMContentLoaded", () => {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        const claseAnimacion = entrada.target.getAttribute('data-animacion');
        entrada.target.classList.add(claseAnimacion);
        entrada.target.classList.remove('oculto');
        observador.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.1
  });

  const elementosParaAnimar = document.querySelectorAll('.oculto');
  elementosParaAnimar.forEach(el => observador.observe(el));
});


// MODAL CANCIONES


document.addEventListener('DOMContentLoaded', () => {
    const btnOpenModal = document.getElementById('btn-open-modal');
    const musicModal = document.getElementById('music-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const musicForm = document.getElementById('music-form');
    const successMsg = document.getElementById('form-success-msg');
    const errorMsg = document.getElementById('form-error-msg'); // Seleccionamos el mensaje de error
    const cancionInput = document.getElementById('cancion-input');
    
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    if (btnOpenModal && musicModal) {
        btnOpenModal.addEventListener('click', () => {
            musicModal.classList.remove('hidden');
            musicModal.classList.add('flex');
            setTimeout(() => {
                musicModal.classList.add('modal-active');
            }, 10);
        });
    }

    const closeModal = () => {
        musicModal.classList.remove('modal-active');
        setTimeout(() => {
            musicModal.classList.remove('flex');
            musicModal.classList.add('hidden');
            successMsg.classList.add('hidden');
            errorMsg.classList.add('hidden'); // Ocultamos el error al cerrar
            musicForm.classList.remove('hidden');
            musicForm.reset();
            
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            btnText.textContent = "Enviar";
            btnSpinner.classList.add('hidden');
        }, 300);
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (musicForm) {
        musicForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Ocultamos el error previo si el usuario está intentando de nuevo
            errorMsg.classList.add('hidden');
            
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            btnText.textContent = "Enviando...";
            btnSpinner.classList.remove('hidden');
            
            const cancion = cancionInput.value;
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxLALvrzRER4Trf3ppOzq5dru-1aEiVIJMLV41Dnh7PeMhoZ0kVfWnEtC3TlDlvJhxG/exec'; // Recuerda poner tu URL
            const formData = new FormData();
            formData.append('cancion', cancion);

            fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
                .then(response => {
                    musicForm.classList.add('hidden');
                    successMsg.classList.remove('hidden');
                    setTimeout(() => {
                        closeModal();
                    }, 3000);
                })
                .catch(error => {
                    // Si hay error, mostramos el mensaje rojo en el DOM
                    errorMsg.classList.remove('hidden');
                    
                    // Y restauramos el botón para que puedan volver a intentar
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                    btnText.textContent = "Volver a intentar";
                    btnSpinner.classList.add('hidden');
                });
        });
    }
});
// formulario de asistencia

// document.getElementById('nx_formulario_asistencia').addEventListener('submit', async function (e) {
//   e.preventDefault();

//   const nxContenedorMensaje = document.getElementById('nx_alerta_msj');
//   const nxBotonAccion = document.getElementById('nx_boton_enviar');
//   const nxEtiquetaBoton = document.getElementById('nx_texto_boton');
//   const nxIndicadorCarga = document.getElementById('nx_animacion_carga');

//   const nxNombreVal = document.getElementById('nx_campo_nombre').value.trim();
//   const nxApellidoVal = document.getElementById('nx_campo_apellido').value.trim();
//   const nxEdadVal = parseInt(document.getElementById('nx_campo_edad').value, 10);

//   const nxSoloLetrasRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;

//   nxContenedorMensaje.className = 'text-center font-body-md mb-6 p-4 rounded text-red-800 bg-red-100';

//   if (nxNombreVal.length < 2 || !nxSoloLetrasRegex.test(nxNombreVal)) {
//     nxContenedorMensaje.textContent = 'Por favor, ingresa un nombre válido (solo letras).';
//     nxContenedorMensaje.classList.remove('nx_ocultar');
//     return;
//   }

//   if (nxApellidoVal.length < 2 || !nxSoloLetrasRegex.test(nxApellidoVal)) {
//     nxContenedorMensaje.textContent = 'Por favor, ingresa un apellido válido (solo letras).';
//     nxContenedorMensaje.classList.remove('nx_ocultar');
//     return;
//   }

//   if (isNaN(nxEdadVal) || nxEdadVal < 0 || nxEdadVal > 120) {
//     nxContenedorMensaje.textContent = 'Por favor, ingresa una edad real (entre 0 y 120 años).';
//     nxContenedorMensaje.classList.remove('nx_ocultar');
//     return;
//   }

//   nxContenedorMensaje.classList.add('nx_ocultar');
//   nxBotonAccion.disabled = true;
//   nxEtiquetaBoton.textContent = 'Enviando...';
//   nxIndicadorCarga.classList.remove('nx_ocultar');

//   try {
//     await new Promise((nxResolver, nxRechazar) => {
//       setTimeout(() => {
//         const nxEstadoPeticion = true;
//         if (nxEstadoPeticion) {
//           nxResolver();
//         } else {
//           nxRechazar(new Error('Error de conexion'));
//         }
//       }, 2000);
//     });

//     nxContenedorMensaje.textContent = '¡Gracias! Tu confirmación fue enviada con éxito.';
//     nxContenedorMensaje.className = 'text-center font-body-md mb-6 p-4 rounded bg-green-100 text-green-800';
//     this.reset();
//   } catch (nxFalla) {
//     nxContenedorMensaje.textContent = 'Ocurrió un error al enviar. Por favor, intentá de nuevo.';
//     nxContenedorMensaje.className = 'text-center font-body-md mb-6 p-4 rounded bg-red-100 text-red-800';
//   } finally {
//     nxBotonAccion.disabled = false;
//     nxEtiquetaBoton.textContent = 'Enviar Confirmación';
//     nxIndicadorCarga.classList.add('nx_ocultar');
//   }
// });