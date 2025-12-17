// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Personas {
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
        bool estaRegistrada; 
    }

    uint256 private nextId = 1;
    address public owner; 

    mapping(uint256 => Persona) private personas;
    mapping(string => uint256) private ciAIdPersona;

    // MODIFIER: Se mantiene por si quieres crear funciones administrativas a futuro
    modifier onlyOwner() {
        require(msg.sender == owner, "No tienes permisos de Admin");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- REGISTRO UNIFICADO (CORREGIDO) ---
    // 🔓 YA NO TIENE 'onlyOwner'. Ahora es pública para todos.
    function registrarOActualizarPersona(
        string memory _nombres,
        string memory _apellidos,
        string memory _cedula,
        Genero _genero,
        uint256 _fechaNacimiento,
        string memory _lugarNacimiento,
        string memory _estadoCivil,
        string memory _direccion,
        string memory _telefono,
        string memory _profesion
    ) public { // <--- ¡AQUÍ ESTABA EL BLOQUEO! Ahora dice solo 'public'
        
        uint256 idToUse = ciAIdPersona[_cedula];

        // Si el ID es 0, significa que es una persona NUEVA
        if (idToUse == 0) {
            idToUse = nextId;
            nextId++;
            ciAIdPersona[_cedula] = idToUse;
        }

        // Guardamos o Actualizamos los datos
        personas[idToUse] = Persona({
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: _cedula,
            genero: _genero,
            fechaNacimiento: _fechaNacimiento,
            lugarNacimiento: _lugarNacimiento,
            estadoCivil: _estadoCivil,
            direccion: _direccion,
            telefono: _telefono,
            profesion: _profesion,
            estaRegistrada: true
        });
    }

    // Funciones de Lectura

    function obtenerIdPorCi(string memory _ci) public view returns (uint256) {
        return ciAIdPersona[_ci];
    }

    function obtenerNombresApellidos(string memory _cedula) public view returns (string memory, string memory) {
        uint256 id = ciAIdPersona[_cedula];
        require(id != 0, "Persona no encontrada en Registro Civil");
        
        Persona memory p = personas[id];
        return (p.nombres, p.apellidos);
    }

    function obtenerPersonaPorCI(string memory _cedula) public view returns (Persona memory) {
        uint256 id = ciAIdPersona[_cedula];
        require(id != 0, "Persona no encontrada");
        return personas[id];
    }
}