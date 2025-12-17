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
        uint256 Fecha; 
    }

    event NuevaDonacion(
        address donante,
        string cedula, 
        string nombres, 
        string apellidos, 
        uint256 monto,
        uint256 fecha
    );

    uint256 private nextId = 1;
    uint256 public totalRecaudado;
    
    address public owner; 
    address public registroCivilAddress; 
    address payable public cuentaBeneficiaria; 

    mapping(uint256 => Donacion) private donaciones;
    mapping(string => uint256) private ci2Donacion;

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo Admin");
        _;
    }

    // CHECK: Validamos que las direcciones no sean 0x000...
    constructor(address _registroCivilAddress, address payable _cuentaBeneficiaria) {
        require(_registroCivilAddress != address(0), "Direccion Registro Civil invalida");
        require(_cuentaBeneficiaria != address(0), "Direccion Beneficiaria invalida");
        
        owner = msg.sender; 
        registroCivilAddress = _registroCivilAddress;
        cuentaBeneficiaria = _cuentaBeneficiaria;
    }

    function setRegistroCivilAddress(address _address) public onlyOwner {
        registroCivilAddress = _address;
    }

    function cambiarCuentaBeneficiaria(address payable _nuevaCuenta) public onlyOwner {
        require(_nuevaCuenta != address(0), "Direccion invalida");
        cuentaBeneficiaria = _nuevaCuenta;
    }

    function RegistrarDonantes(string calldata _cedula, uint256 _montoDonacion) public payable {
        
        // 1. Validaciones
        require(_montoDonacion > 0, "Monto debe ser mayor a 0");
        require(msg.value == _montoDonacion, "El ETH enviado no coincide con el monto declarado");

        // Conexión con el otro contrato (IPersonas)
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        
        // Verificamos si existe (si devuelve 0, es que no existe)
        uint256 idPersonaEnRegistro = registroCivil.obtenerIdPorCi(_cedula);
        require(idPersonaEnRegistro != 0, "Cedula no registrada en el sistema civil");

        // Obtenemos datos para el evento
        (string memory nombre, string memory apellido) = registroCivil.obtenerNombresApellidos(_cedula);

        // 2. Guardar datos
        uint256 id = nextId;
        ci2Donacion[_cedula] = id; // OJO: Esto recuerda solo la última donación de esta CI

        donaciones[id] = Donacion({
            Cedula: _cedula,
            Monto: _montoDonacion,
            Fecha: block.timestamp
        });

        totalRecaudado += _montoDonacion; 
        nextId++;

        // 3. Transferencia de fondos (Interacción externa al final para evitar ataques de reentrada)
        (bool success, ) = cuentaBeneficiaria.call{value: msg.value}("");
        require(success, "Error enviando ETH a la fundacion");

        // 4. Notificar al Frontend (React escuchará esto)
        emit NuevaDonacion(msg.sender, _cedula, nombre, apellido, _montoDonacion, block.timestamp);
    }

    // Función de lectura para el Frontend
    function obtenerUltimaDonacionPorCI(string memory _cedula) public view returns (string memory Nombres, string memory Apellidos, uint256 Monto_Donacion) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, "No hay donaciones registradas para esta cedula");
        
        Donacion memory d = donaciones[id];
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        (string memory nom, string memory ape) = registroCivil.obtenerNombresApellidos(_cedula);
        
        return (nom, ape, d.Monto);
    }
}