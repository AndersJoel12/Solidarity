import React from "react";

import { FaFacebook, FaInstagram } from "react-icons/fa";

import { FaDog, FaCat, FaHandHoldingHeart } from "react-icons/fa";

import { MdPets } from "react-icons/md";

import { GiTreehouse } from "react-icons/gi";

import Donations from "../components/Donations_panel";

import '../components/Tailwind.css'



function Landing() {

    const [darkMode, setDarkMode] = React.useState(true , false);

  const bgImage = "https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80";

  React.useEffect(() => {

  if (darkMode) {

    document.documentElement.classList.add("dark");

  } else {

    document.documentElement.classList.remove("dark");

  }

}, [darkMode]);





  return (

    // CONTENEDOR MAESTRO

    // bg-fixed: ESTO hace que el perro NO se mueva cuando bajas con el scroll.

    // bg-cover: Cubre toda la pantalla.

    // Ahora, el fondo principal es el que maneja el modo claro/oscuro

    <div

        className={`{ min-h-screen font-sans bg-cover bg-center bg-no-repeat w-full ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
                

        style={{ backgroundImage: `url('${bgImage}')` }}

    >  

      {/* CAPA DE FONDO CON IMAGEN (OVERLAY)
          
          La imagen de fondo con el overlay negro solo se aplica en el MODO OSCURO.
          En modo claro, esta capa es transparente o inexistente.

          bg-black/60: El filtro oscuro para que las letras blancas resalten perfecto. */}

        <div

        className={`{ min-h-screen font-sans bg-cover bg-center bg-no-repeat w-full ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} `}
                

        >  


        {/* --- HEADER (STICKY) ---

            sticky top-0: Se queda pegado arriba cuando bajas.

            backdrop-blur-md: Efecto de vidrio borroso.

            z-50: Asegura que esté siempre encima de todo. 

            Ajustadas las clases para que el header tenga un fondo blanco en modo claro.*/}

        <header className={`sticky top-0 z-50 flex justify-between items-center px-4 sm:px-8 py-4 backdrop-blur-md shadow-lg 
                                       ${darkMode 
                                            ? "bg-gray-900/10" // Oscuro: Fondo gris oscuro semitransparente
                                            : "bg-white/50%" // Claro: Fondo blanco semitransparente
                                            
                                        }`}>

          <div className="font-extrabold text-xl sm:text-2xl text-orange-500 dark:text-orange-600">

            PetSolidarity

          </div>

          <nav className="hidden sm:flex gap-6 md:gap-8">

           <a href="#about" className={`font-medium transition duration-300 text-sm uppercase tracking-wide 
                                                        ${darkMode ? "text-gray-200 hover:text-orange-400" : "text-gray-700 hover:text-orange-500"}`}>
                                Sobre Nosotros
                            </a>

            <a href="#contact" className={`font-medium transition duration-300 text-sm uppercase tracking-wide 
                                                        ${darkMode ? "text-gray-200 hover:text-orange-400" : "text-gray-700 hover:text-orange-500"}`}>
                                Contacto
                            </a>
          </nav>

          <button

            onClick={() => setDarkMode(!darkMode)}

            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"

          >

            {darkMode ? "Claro ☀️" : "Oscuro 🌙"}

          </button>

        </header>

        {/* resto de tu landing */}



        {/* --- HERO SECTION ---

            h-screen: Ocupa toda la altura de la pantalla inicial. 
            
            Texto siempre claro/blanco dentro del overlay oscuro.*/}

        <section className="grow flex flex-col justify-center items-center           text-center px-4 py-24 min-h-[80vh]">

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl tracking-tight text-white-900 white:text-black">

            Un aporte, una vida feliz <span className="text-orange-400">🐾</span>

            </h1>

            <p className="text-xl md:text-2xl mb-10 max-w-3xl font-light leading-relaxed drop-shadow-md 
                  text-black-900 dark:text-black-100">

            Tu apoyo transforma la realidad de perritos y gatitos en necesidad.

            Ayuda transparente, directa y segura.

            </p>

            <div className="flex flex-col sm:flex-row gap-6">

            <a href="#contact" className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-300 hover:bg-orange-700 text-white rounded-full font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1">

            ¡Quiero Donar!

            </a>

            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-700 hover:bg-white/20 border-5 border-orange rounded-full font-bold text-base sm:text-lg transition-all backdrop-blur-sm text-white">

            Saber más

            </button>

            </div>

        </section>

        </div>





        {/* --- FEATURES --- */}

        <section

        id="features"

        className="py-16 sm:py-24 px-4 sm:px-6 bg-white/10 backdrop-blur-sm border-t border-white/5 ">

            {darkMode ? "" : ""}

             {/* 🔥 Aquí insertamos el contador */}

                <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 dark:text-white">
                    Cada ayuda está salvando una huella
                </h1>

                <div className="text-center mb-12">
                <h2
                    id="totalTrees"
                    data-count="24939238"
                    className="counter text-6xl sm:text-8xl lg:text-hero font-black pb-6 text-gray-600 dark:text-gray-200"
                >
                     24,939,238
                </h2>
        </div>

          <div className="max-w-6xl mx-auto"> 

            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-16 text-center 
                                   ${darkMode ? "text-black-900" : "dark:text-black-100"}`}>

              <span className="border-b-4 border-orange-300 pb-2">QUE HACEMOS</span>

            </h2>


            <div className="grid grid-cols-1 sm:white-cols-2 md:grid-cols-3 gap-8 sm:gap-10 text-center">

              <Feature

                title="Rescate"

                desc="Salvamos mascotas abandonadas en las calles y les damos una segunda oportunidad de vida."

                icon="🐶"
                

                darkMode={darkMode} // Pasamos la prop

              />

              <Feature

                title="Adopción"

                desc="Conectamos familias amorosas con perritos y gatitos que buscan un hogar definitivo."

                icon="🐱"

                darkMode={darkMode} // Pasamos la prop

              />

              <Feature

                title="Solidaridad"

                desc="Cada donación se convierte directamente en alimento, medicinas y cuidados veterinarios."

                icon="❤️"

                darkMode={darkMode} // Pasamos la prop

              />

            </div>

          </div>

        </section>



        {/* --- ABOUT --- */}

        <section
    id="about"
    className={`py-16 sm:py-24 px-4 sm:px-6 ${
        darkMode ? 'bg-[#111827]/90' : 'bg-gray-200'
    }`}
>
    <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-orange-500">Sobre PetSolidarity</h2>
        
        {/* CORRECCIÓN: El texto del párrafo es gris claro (text-gray-300). Esto es ilegible en Modo Claro (bg-gray-200). 
           Aplicamos el mismo principio de modo oscuro/claro que discutimos antes. */}
        <p className="text-base sm:text-lg md:text-xl leading-relaxed font-light 
                      text-black-900 dark:text-black-100">

            Somos una comunidad dedicada a rescatar, cuidar y dar en adopción a mascotas
            que necesitan amor. Usamos la tecnología Blockchain para garantizar que tu ayuda
            llegue íntegra a quien más lo necesita, sin intermediarios.
        </p>
    </div>
</section>



        {/* --- CONTACT / DONATIONS --- 
        
        Fondo condicional para modo claro/oscuro.*/}

        <section id="contact" className={`py-16 sm:py-20 px-4 sm:px-6 
                                             ${darkMode ? "bg-black/80" : "bg-white/50 shadow-inner"}`}>
          <div className="max-w-5xl mx-auto flex flex-col items-center">

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black-900 dark:text-black-100">

              Dona a PetSolidarity

            </h2>

            <p className="text-sm sm:text-base md:text-lg text-black-400 mb-8 sm:mb-12">

              Selecciona un monto y ayúdanos a seguir salvando vidas.

            </p>

            {/* Componente de Donaciones Integrado */}

            <div className="w-full flex justify-center">

               <Donations />

            </div>

          </div>

        </section>



        {/* --- FOOTER --- */}

        {/* FOOTER */}

        <footer className={`py-8 sm:py-10 text-center border-t 
                                ${darkMode ? "bg-black border-gray-800" : "bg-gray-100 border-gray-300"}`}>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6">

            <a

              href="https://facebook.com"

              target="_blank"

              rel="noopener noreferrer"

              className="hover:scale-110 transition duration-300"

            >

              <FaFacebook

                size={24}

                className="sm:size-15 text-blue-600 hover:text-blue-500"

              />

            </a>

            <a

              href="https://instagram.com"

              target="_blank"

              rel="noopener noreferrer"

              className="hover:scale-110 transition duration-300"

            >

              <FaInstagram

                size={28}

                className="sm:size-15 text-pink-600 hover:text-pink-500"

              />

            </a>

          </div>

          <span className="block text-xs sm:text-sm md:text-base text-gray-500">

            © {new Date().getFullYear()} PetSolidarity — Todos los derechos

            reservados.

          </span>

        </footer>





      </div> // Cierre del contenedor maestro

  );

}



// Subcomponente Feature mejorado (Glassmorphism)

function Feature({ title, desc, icon }) {

  return (

    <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition duration-500 hover:-translate-y-2 shadow-xl">

      <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 transform group-hover:scale-110 transition duration-500">

        {icon}

      </div>

      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-orange-400 group-hover:text-orange-300 transition">

        {title}

      </h3>

      <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">

        {desc}

      </p>

    </div>

  );

}



export default Landing;