import React from "react";


function Landing() {
    return (
        // Contenedor principal: Fondo sutil y altura mínima de pantalla
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
            
            {/* Header / Navegación Simple */}
            <header className="py-6 px-8 flex justify-between items-center border-b border-stone-200">
                <div className="text-2xl font-serif tracking-wider">
                    Solidarity
                </div>
                <nav className="space-x-6 text-sm font-medium">
                    <a href="#about" className="hover:text-amber-600 transition duration-300">Nosotros</a><br></br>
                    <a href="#contact" className="hover:text-amber-600 transition duration-300">Contacto</a><br></br>
                </nav>
            </header>

            {/* Sección Principal (Héroe) */}
            <main className="max-w-4xl mx-auto py-20 px-4 text-center">
                <h1 className="text-6xl md:text-7xl font-light leading-tight mb-6 font-serif">
                    Con una pequeña ayuda, es un gran cambio para la humanidad 
                </h1>
                
                {/* Llamado a la Acción (CTA) */}
                <button 
                    className="bg-amber-700 text-white py-3 px-8 rounded-full 
                                text-lg font-semibold tracking-wide 
                                shadow-lg hover:bg-amber-800 transition duration-300 
                                transform hover:scale-105 active:scale-95"
                >
                    Explora la Colección
                </button>
            </main>

            {/* Footer Minimalista */}
           <footer className="bg-gray-800 text-white py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-6 md:px-12 text-center text-sm">
                    <p className="mb-4">&copy; {new Date().getFullYear()} Solidarity. Todos los derechos reservados.</p>
                    <div className="space-x-4">
                        <a href="#privacidad" className="flex flex-col md:flex-row items-center justify-center  text-gray-400 hover:text-white">Política de Privacidad</a>
                        <a href="#terminos" className="flex flex-col md:flex-row items-center justify-center   text-gray-400 hover:text-white">Términos de Servicio</a>
                        <div class="bg-spruce flex flex-col md:flex-row items-center justify-center p-4 md:p-8 -mt-1 ">
            </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default Landing;