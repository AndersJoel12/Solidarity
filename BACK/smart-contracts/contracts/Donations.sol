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
        require(msg.sender == owner, "Solo Admin: No tienes permiso");
        _;
    }

    constructor(address _registroCivilAddress, address payable _cuentaBeneficiaria) {
        require(_registroCivilAddress != address(0), "Direccion Registro Civil invalida");
        require(_cuentaBeneficiaria != address(0), "Direccion Beneficiaria invalida");
        
        owner = msg.sender; 
        registroCivilAddress = _registroCivilAddress;
        cuentaBeneficiaria = _cuentaBeneficiaria;
    }

    // 🛡️ CORRECCIÓN IMPORTANTE: Agregado 'onlyOwner'
    // Antes cualquiera podía romper tu contrato cambiando esto. Ahora solo tú.
    function setRegistroCivilAddress(address _address) public onlyOwner {
        require(_address != address(0), "Direccion invalida");
        registroCivilAddress = _address;
    }

    function cambiarCuentaBeneficiaria(address payable _nuevaCuenta) public onlyOwner {
        require(_nuevaCuenta != address(0), "Direccion invalida");
        cuentaBeneficiaria = _nuevaCuenta;
    }

    // --- LÓGICA PRINCIPAL (Pública para que todos donen) ---

    function RegistrarDonantes(string calldata _cedula, uint256 _montoDonacion) public payable {
        
        // 1. Validaciones básicas
        require(_montoDonacion > 0, "Monto debe ser mayor a 0");
        require(msg.value == _montoDonacion, "El ETH enviado no coincide con el monto declarado");

        // 2. Validación con Registro Civil
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        
        // Verificamos si existe la persona
        uint256 idPersonaEnRegistro = registroCivil.obtenerIdPorCi(_cedula);
        require(idPersonaEnRegistro != 0, "Cedula no registrada en el sistema civil");

        // Obtenemos datos para el evento (para que se vea bonito en el Front)
        (string memory nombre, string memory apellido) = registroCivil.obtenerNombresApellidos(_cedula);

        // 3. Guardar en almacenamiento
        uint256 id = nextId;
        ci2Donacion[_cedula] = id; 

        donaciones[id] = Donacion({
            Cedula: _cedula,
            Monto: _montoDonacion,
            Fecha: block.timestamp
        });

        totalRecaudado += _montoDonacion; 
        nextId++;

        // 4. Transferencia de dinero (Effects -> Interactions)
        (bool success, ) = cuentaBeneficiaria.call{value: msg.value}("");
        require(success, "Error enviando ETH a la fundacion");

        // 5. Notificar al mundo
        emit NuevaDonacion(msg.sender, _cedula, nombre, apellido, _montoDonacion, block.timestamp);
    }

    function obtenerUltimaDonacionPorCI(string memory _cedula) public view returns (string memory Nombres, string memory Apellidos, uint256 Monto_Donacion) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, "No hay donaciones registradas para esta cedula");
        
        Donacion memory d = donaciones[id];
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        (string memory nom, string memory ape) = registroCivil.obtenerNombresApellidos(_cedula);
        
        return (nom, ape, d.Monto);
    }
}