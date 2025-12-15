// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// --- INTERFAZ (Igual que antes) ---
interface IPersonas {
    struct Persona {
        string nombres;
        string apellidos;
        string cedula;
        // ... (resto de campos ignorados para ahorrar espacio visual, pero existen)
    }
    function obtenerIdPorCi(string memory _ci) external view returns (uint256);
    function obtenerDatosPersona(uint256 _id) external view returns (Persona memory);
}

contract Donaciones {

    // 1. OPTIMIZACIÓN: Quitamos Nombres y Apellidos.
    // Solo guardamos lo esencial. La cédula es el enlace (Link) al otro contrato.
    struct Donacion {
        string Cedula;
        uint256 Monto; // Cambié Monto_Donacion a Monto (más limpio)
    }

    // 2. NUEVO: Evento.
    // Esto es lo que React escuchará. Aquí SI podemos mandar el nombre
    // porque los logs son baratos, pero no se guardan en el "disco duro" del contrato.
    event NuevaDonacion(
        string indexed cedula, 
        string nombres, 
        string apellidos, 
        uint256 monto
    );

    uint256 private nextId = 1;
    uint256 public totalRecaudado;
    address public registroCivilAddress;

    mapping(uint256 => Donacion) private donaciones;
    mapping(string => uint256) private ci2Donacion;

    function setRegistroCivilAddress(address _address) public {
        registroCivilAddress = _address;
    }

    // Usamos 'calldata' en vez de 'memory' para ahorrar gas en los argumentos
    function RegistrarDonantes(string calldata _cedula, uint256 _montoDonacion) public {
        
        require(ci2Donacion[_cedula] == 0, "Esta cedula ya dono anteriormente");
        require(registroCivilAddress != address(0), "Contrato Registro Civil no conectado");
        require(_montoDonacion > 0, "La donacion debe ser mayor a 0");

        // A. Validar existencia en el otro contrato
        uint256 idPersonaEnRegistro = IPersonas(registroCivilAddress).obtenerIdPorCi(_cedula);
        
        // SEGURIDAD: Si el contrato del profe devuelve 0 cuando no existe, hay que validarlo.
        require(idPersonaEnRegistro != 0, "La cedula no existe en el Registro Civil");

        // B. Solo traemos los datos para emitirlos en el evento, NO para guardarlos.
        IPersonas.Persona memory datosPersona = IPersonas(registroCivilAddress).obtenerDatosPersona(idPersonaEnRegistro);

        // C. Guardamos solo lo esencial
        uint256 id = nextId;
        ci2Donacion[_cedula] = id;

        donaciones[id] = Donacion({
            Cedula: _cedula,
            Monto: _montoDonacion
        });

        totalRecaudado += _montoDonacion; 
        nextId++;

        // D. EMITIMOS EL EVENTO
        // Aquí es donde React se entera de quién donó.
        emit NuevaDonacion(
            _cedula, 
            datosPersona.nombres, 
            datosPersona.apellidos, 
            _montoDonacion
        );
    }

    // Función de lectura simplificada
    function obtenerDonacionPorCI(string memory _cedula) public view returns (Donacion memory) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, unicode"No se encontró donación para esta cédula");
        return donaciones[id];
    }
}