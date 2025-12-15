import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Donations from "../components/Donations_panel";
import '../components/Tailwind.css'

function Landing() {
  const bgImage = "https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80";

  return (
    // CONTENEDOR MAESTRO
    // bg-fixed: ESTO hace que el perro NO se mueva cuando bajas con el scroll.
    // bg-cover: Cubre toda la pantalla.
    <div 
      className="min-h-screen font-sans text-white bg-cover bg-center bg-fixed bg-no-repeat w-full"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      
      {/* CAPA OSCURA (OVERLAY) 
          bg-black/60: El filtro oscuro para que las letras blancas resalten perfecto. */}
      <div className="min-h-screen w-full bg-black/60 flex flex-col">

        {/* --- HEADER (STICKY) --- 
            sticky top-0: Se queda pegado arriba cuando bajas.
            backdrop-blur-md: Efecto de vidrio borroso.
            z-50: Asegura que esté siempre encima de todo. */}
        <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="font-extrabold text-2xl tracking-wider text-orange-500 cursor-pointer">
            PetSolidarity
          </div>
          <nav className="flex gap-8">
            <a href="#about" className="text-gray-200 hover:text-orange-400 font-medium transition duration-300 text-sm uppercase tracking-wide">Sobre Nosotros</a>
            <a href="#contact" className="text-gray-200 hover:text-orange-400 font-medium transition duration-300 text-sm uppercase tracking-wide">Contacto</a>
          </nav>
        </header>

        {/* --- HERO SECTION --- 
            h-screen: Ocupa toda la altura de la pantalla inicial. */}
        <section className="flex-grow flex flex-col justify-center items-center text-center px-4 py-24 min-h-[80vh]">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl tracking-tight">
            Un aporte, una vida feliz <span className="text-orange-500">🐾</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl font-light text-gray-100 leading-relaxed drop-shadow-md">
            Tu apoyo transforma la realidad de perritos y gatitos en necesidad. 
            Ayuda transparente, directa y segura.
          </p>
          <div className="flex gap-6">
            <a href="#contact" className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1">
              ¡Quiero Donar!
            </a>
            <button className="px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white rounded-full font-bold text-lg transition-all backdrop-blur-sm">
              Saber más
            </button>
          </div>
        </section>

        {/* --- FEATURES --- */}
        <section id="features" className="py-24 px-6 bg-black/50 backdrop-blur-sm border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 text-center text-white">
              <span className="border-b-4 border-orange-500 pb-2">Lo que hacemos</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
              <Feature
                title="Rescate"
                desc="Salvamos mascotas abandonadas en las calles y les damos una segunda oportunidad de vida."
                icon="🐶"
              />
              <Feature
                title="Adopción"
                desc="Conectamos familias amorosas con perritos y gatitos que buscan un hogar definitivo."
                icon="🐱"
              />
              <Feature
                title="Solidaridad"
                desc="Cada donación se convierte directamente en alimento, medicinas y cuidados veterinarios."
                icon="❤️"
              />
            </div>
          </div>
        </section>

        {/* --- ABOUT --- */}
        <section id="about" className="py-24 px-6 bg-[#111827]/90">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-orange-400">Sobre PetSolidarity</h2>
            <p className="text-xl leading-relaxed text-gray-300 font-light">
              Somos una comunidad dedicada a rescatar, cuidar y dar en adopción a mascotas
              que necesitan amor. Usamos la tecnología Blockchain para garantizar que tu ayuda
              llegue íntegra a quien más lo necesita, sin intermediarios.
            </p>
          </div>
        </section>

        {/* --- CONTACT / DONATIONS --- */}
        <section id="contact" className="py-20 px-6 bg-black/80">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl font-bold mb-4 text-white">Dona a PetSolidarity</h2>
            <p className="text-gray-400 mb-12">Selecciona un monto y ayúdanos a seguir salvando vidas.</p>
            
            {/* Componente de Donaciones Integrado */}
            <div className="w-full flex justify-center">
               <Donations />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="py-10 text-center bg-black border-t border-gray-800">
          <div className="flex justify-center gap-8 mb-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition duration-300">
              <FaFacebook size={32} className="text-blue-600 hover:text-blue-500" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition duration-300">
              <FaInstagram size={32} className="text-pink-600 hover:text-pink-500" />
            </a>
          </div>
          <span className="block text-gray-500 text-sm">© {new Date().getFullYear()} PetSolidarity — Todos los derechos reservados.</span>
        </footer>

      </div>
    </div>
  );
}

// Subcomponente Feature mejorado (Glassmorphism)
function Feature({ title, desc, icon }) {
  return (
    <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition duration-500 hover:-translate-y-2 shadow-xl">
      <div className="text-6xl mb-6 transform group-hover:scale-110 transition duration-500">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-orange-400 group-hover:text-orange-300 transition">{title}</h3>
      <p className="text-base text-gray-300 leading-relaxed">{desc}</p>
    </div>
  );
}

export default Landing;