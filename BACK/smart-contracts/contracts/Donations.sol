// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// --- 1. INTERFAZ DEL CONTRATO DEL PROFE ---
// Esto sirve para que tu contrato sepa cómo "hablar" con el otro.
// Copiamos sus estructuras y funciones clave.
interface IPersonas {
    enum Genero { Masculino, Femenino, Otro }

    struct Persona {
        string nombres;
        string apellidos;
        string cedula;
        Genero genero;
        uint256 fechaNacimiento;
        string lugarNacimiento;
        string estadoCivil;
        string direccion;
        string telefono;
        string profesion;
    }

    // Necesitamos estas dos funciones del profe
    function obtenerIdPorCi(string memory _ci) external view returns (uint256);
    function obtenerDatosPersona(uint256 _id) external view returns (Persona memory);
}

contract Donaciones {

    struct Donacion {
        string Nombres;
        string Apellidos;
        string Cedula;
        uint256 Monto_Donacion;
    }

    uint256 private nextId = 1;
    uint256 public totalRecaudado;

    mapping(uint256 => Donacion) private donaciones;
    mapping(string => uint256) private ci2Donacion;

    // --- 2. VARIABLE PARA GUARDAR LA DIRECCIÓN DEL OTRO CONTRATO ---
    address public registroCivilAddress;

    // Función para conectar los contratos (La usaremos en Truffle)
    function setRegistroCivilAddress(address _address) public {
        registroCivilAddress = _address;
    }

    // --- 3. REGISTRO MODIFICADO (MÁGICO) ---
    // Ya no pedimos nombres ni apellidos, los buscamos solos.
    function RegistrarDonantes(
        string memory _cedula,
        uint256 _montoDonacion
    ) public {
        require(ci2Donacion[_cedula] == 0, "Esta cedula ya dono anteriormente");
        require(registroCivilAddress != address(0), "Falta conectar el contrato del Registro Civil");

        // A. Llamamos al contrato del profe para buscar el ID por la Cédula
        // Usamos la interfaz IPersonas
        uint256 idPersonaEnRegistro = IPersonas(registroCivilAddress).obtenerIdPorCi(_cedula);
        
        // Si el ID es 0 o da error, el contrato del profe fallará allá mismo.
        
        // B. Con el ID, pedimos los datos completos
        IPersonas.Persona memory datosPersona = IPersonas(registroCivilAddress).obtenerDatosPersona(idPersonaEnRegistro);

        // C. Guardamos la donación con los datos que nos dio el profe
        uint256 id = nextId;
        ci2Donacion[_cedula] = id;

        donaciones[id] = Donacion({
            Nombres: datosPersona.nombres,   // <-- Dato traído del otro contrato
            Apellidos: datosPersona.apellidos, // <-- Dato traído del otro contrato
            Cedula: _cedula,
            Monto_Donacion: _montoDonacion
        });

        totalRecaudado += _montoDonacion; 
        nextId++;
    }

    // Funciones de lectura (igual que antes)
    function obtenerPersonaPorCI(string memory _cedula) public view returns (Donacion memory) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, unicode"Persona con esa cédula no encontrada en Donaciones");
        return donaciones[id];
    }
}