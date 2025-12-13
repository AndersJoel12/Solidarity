// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Registro Civil
 * @dev Contrato para el registro de personas en el Registro Civil de Venezuela
 * @author Your Name
 * @notice Este contrato permite registrar y consultar datos de personas en el Registro Civil
 */
contract Personas {
    // Definición de los posibles géneros de una persona
    enum Genero { Masculino, Femenino, Otro }

    // Estructura que representa a una persona con sus datos básicos
    struct Persona {
        string nombres; // Nombres de la persona
        string apellidos; // Apellidos de la persona
        string cedula; // Número de cédula de identidad
        Genero genero; // Género de la persona
        uint256 fechaNacimiento; // Fecha de nacimiento como timestamp
        string lugarNacimiento; // Lugar de nacimiento
        string estadoCivil; // Estado civil de la persona
        string direccion; // Dirección de residencia
        string telefono; // Número de teléfono
        string profesion; // Profesión u ocupación
    }

    // Contador para generar IDs únicos
    uint256 private nextId = 1;

    // Mapping para almacenar las personas, usando su ID como clave
    mapping(uint256 => Persona) private personas;

    // Mapping para buscar el ID de una persona a partir de su cédula
    mapping(string => uint256) private ciAIdPersona;

    /**
     * @dev Registra una persona con sus datos esenciales (solo cédula, nombres y apellidos)
     * @param _cedula Número de cédula de identidad
     * @param _nombres Nombres de la persona
     * @param _apellidos Apellidos de la persona
     */
    function registrarPersonaEsencial(
        string memory _cedula,
        string memory _nombres,
        string memory _apellidos
    ) public {
        require(ciAIdPersona[_cedula] == 0, "CI ya registrada");
        uint256 id = nextId++;
        ciAIdPersona[_cedula] = id;
        personas[id] = Persona({
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: _cedula,
            genero: Genero.Otro,
            fechaNacimiento: 0,
            lugarNacimiento: "",
            estadoCivil: "",
            direccion: "",
            telefono: "",
            profesion: ""
        });
    }

    /**
     * @dev Registra o actualiza todos los datos de una persona
     * @param _id ID único de la persona
     * @param _nombres Nombres de la persona
     * @param _apellidos Apellidos de la persona
     * @param _cedula Número de cédula de identidad
     * @param _genero Género de la persona
     * @param _fechaNacimiento Fecha de nacimiento como timestamp
     * @param _lugarNacimiento Lugar de nacimiento
     * @param _estadoCivil Estado civil de la persona
     * @param _direccion Dirección de residencia
     * @param _telefono Número de teléfono
     * @param _profesion Profesión u ocupación
     */
    function registrarPersona(
        uint256 _id,
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
    ) public {
        require(_id < nextId, unicode"ID no válido");
        require(ciAIdPersona[_cedula] == 0 || ciAIdPersona[_cedula] == _id, unicode"CI duplicada o inválida");

        personas[_id] = Persona({
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: _cedula,
            genero: _genero,
            fechaNacimiento: _fechaNacimiento,
            lugarNacimiento: _lugarNacimiento,
            estadoCivil: _estadoCivil,
            direccion: _direccion,
            telefono: _telefono,
            profesion: _profesion
        });
    }

    /**
     * @dev Obtiene el ID de una persona a partir de su cédula de identidad
     * @param _ci Número de cédula de identidad
     * @return ID único de la persona
     */
    function obtenerIdPorCi(string memory _ci) public view returns (uint256) {
        require(ciAIdPersona[_ci] != 0, "CI no registrada");
        return ciAIdPersona[_ci];
    }

    /**
     * @dev Obtiene los datos de una persona a partir de su cédula de identidad (CI).
     * @param _cedula Cédula de identidad de la persona a buscar.
     * @return Datos de la persona (revert si no se encuentra).
     */
    function obtenerPersonaPorCI(string memory _cedula) public view returns (Persona memory) {
        for (uint256 i = 0; i < nextId; i++) {
            if (keccak256(bytes(personas[i].cedula)) == keccak256(bytes(_cedula))) {
                return personas[i];
            }
        }
        revert(unicode"Persona con esa cédula no encontrada");
    }

    /**
    * @dev Obtiene todos los datos de una persona a partir de su ID
    * @param _id ID único de la persona
    * @return Estructura Persona con todos los datos
    */
    function obtenerDatosPersona(uint256 _id) public view returns (Persona memory) {
        require(_id < nextId && bytes(personas[_id].cedula).length > 0, "Persona no registrada");
        return personas[_id];
    }
}