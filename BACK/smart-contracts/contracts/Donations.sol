// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPersonas {
    function obtenerIdPorCi(string memory _ci) external view returns (uint256);
    function obtenerNombresApellidos(string memory _cedula) external view returns (string memory, string memory);
}

contract Donaciones {

    struct Donacion {
        string Cedula;
        uint256 Monto; 
    }

    event NuevaDonacion(
        string indexed cedula, 
        string nombres, 
        string apellidos, 
        uint256 monto
    );

    uint256 private nextId = 1;
    uint256 public totalRecaudado;
    address public registroCivilAddress; // Dirección del otro contrato

    mapping(uint256 => Donacion) private donaciones;
    mapping(string => uint256) private ci2Donacion;

    // 1. CONSTRUCTOR: Se ejecuta una sola vez al desplegar.
    // Recibe la dirección del contrato de Personas para conectarse automáticamente.
    constructor(address _registroCivilAddress) {
        registroCivilAddress = _registroCivilAddress;
    }

    // Función extra por si necesitas cambiar la dirección en el futuro
    function setRegistroCivilAddress(address _address) public {
        registroCivilAddress = _address;
    }

    // 2. PAYABLE: ¡La palabra clave que faltaba!
    // Ahora esta función acepta dinero real (ETH).
    function RegistrarDonantes(string calldata _cedula, uint256 _montoDonacion) public payable {
        
        // Validaciones lógicas
        require(ci2Donacion[_cedula] == 0, "Esta cedula ya dono anteriormente");
        require(registroCivilAddress != address(0), "Contrato Registro Civil no conectado");
        require(_montoDonacion > 0, "La donacion debe ser mayor a 0");

        // 3. SEGURIDAD FINANCIERA:
        // Verificamos que los ETH enviados (msg.value) sean IGUALES al monto que dices donar.
        require(msg.value == _montoDonacion, "El monto enviado no coincide con el valor en ETH");

        // PASO A: Validamos existencia en el otro contrato
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        
        // Si la cédula no existe, el otro contrato podría fallar o devolver 0.
        // Es bueno envolver esto en un try/catch o asegurar que la llamada sea segura,
        // pero por ahora confiamos en la lógica básica.
        uint256 idPersonaEnRegistro = registroCivil.obtenerIdPorCi(_cedula);
        require(idPersonaEnRegistro != 0, "La cedula no existe en el Registro Civil");

        // PASO B: Obtenemos Nombres y Apellidos
        (string memory nombre, string memory apellido) = registroCivil.obtenerNombresApellidos(_cedula);

        // PASO C: Guardar Donación en la Blockchain
        uint256 id = nextId;
        ci2Donacion[_cedula] = id;

        donaciones[id] = Donacion({
            Cedula: _cedula,
            Monto: _montoDonacion
        });

        totalRecaudado += _montoDonacion; 
        nextId++;

        // PASO D: Emitir Evento
        emit NuevaDonacion(_cedula, nombre, apellido, _montoDonacion);
    }

    // Función auxiliar para ver los datos desde React
    function obtenerPersonaPorCI(string memory _cedula) public view returns (string memory Nombres, string memory Apellidos, uint256 Monto_Donacion) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, "No se encontro donacion");
        
        Donacion memory d = donaciones[id];
        
        // Volvemos a consultar los nombres al registro para mostrarlos frescos
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        (string memory nom, string memory ape) = registroCivil.obtenerNombresApellidos(_cedula);
        
        return (nom, ape, d.Monto);
    }
}