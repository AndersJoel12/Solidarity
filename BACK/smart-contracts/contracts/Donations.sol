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
    
    address public registroCivilAddress; 
    address payable public cuentaBeneficiaria; 

    mapping(uint256 => Donacion) private donaciones;
    mapping(string => uint256) private ci2Donacion;

    constructor(address _registroCivilAddress, address payable _cuentaBeneficiaria) {
        registroCivilAddress = _registroCivilAddress;
        cuentaBeneficiaria = _cuentaBeneficiaria;
    }

    function setRegistroCivilAddress(address _address) public {
        registroCivilAddress = _address;
    }

    function cambiarCuentaBeneficiaria(address payable _nuevaCuenta) public {
        cuentaBeneficiaria = _nuevaCuenta;
    }

    function RegistrarDonantes(string calldata _cedula, uint256 _montoDonacion) public payable {
        
        // 1. CHECKS (Validaciones)
        require(ci2Donacion[_cedula] == 0, "Esta cedula ya dono anteriormente");
        require(registroCivilAddress != address(0), "Contrato Registro Civil no conectado");
        require(_montoDonacion > 0, "La donacion debe ser mayor a 0");
        require(msg.value == _montoDonacion, "El monto enviado no coincide con el valor en ETH");

        IPersonas registroCivil = IPersonas(registroCivilAddress);
        uint256 idPersonaEnRegistro = registroCivil.obtenerIdPorCi(_cedula);
        require(idPersonaEnRegistro != 0, "La cedula no existe en el Registro Civil");

        (string memory nombre, string memory apellido) = registroCivil.obtenerNombresApellidos(_cedula);

        // 2. EFFECTS (Guardamos los datos ANTES de soltar el dinero)
        // Esto protege al contrato de ataques de reentrada
        uint256 id = nextId;
        ci2Donacion[_cedula] = id;

        donaciones[id] = Donacion({
            Cedula: _cedula,
            Monto: _montoDonacion
        });

        totalRecaudado += _montoDonacion; 
        nextId++;

        // 3. INTERACTIONS (Soltamos el dinero)
        // Usamos .call en lugar de .transfer para evitar el error "deprecated"
        // y permitir enviar a billeteras inteligentes.
        (bool success, ) = cuentaBeneficiaria.call{value: msg.value}("");
        require(success, "Fallo el envio de ETH a la fundacion");

        // 4. EVENTO
        emit NuevaDonacion(_cedula, nombre, apellido, _montoDonacion);
    }

    function obtenerPersonaPorCI(string memory _cedula) public view returns (string memory Nombres, string memory Apellidos, uint256 Monto_Donacion) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, "No se encontro donacion");
        
        Donacion memory d = donaciones[id];
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        (string memory nom, string memory ape) = registroCivil.obtenerNombresApellidos(_cedula);
        return (nom, ape, d.Monto);
    }
}