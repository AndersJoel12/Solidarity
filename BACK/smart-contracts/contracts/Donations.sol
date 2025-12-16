// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPersonas {
    function obtenerIdPorCi(string memory _ci) external view returns (uint256);
    function obtenerNombresApellidos(string memory _cedula) external view returns (string memory, string memory);
}

contract Donaciones {

    // Estructura de datos
    struct Donacion {
        string Cedula;
        uint256 Monto; 
        uint256 Fecha; // Agregamos fecha para registro interno
    }

    // EVENTO OPTIMIZADO PARA TU FRONTEND
    // 1. 'address donante': Para mostrar la wallet (0x...)
    // 2. 'string cedula': SIN 'indexed' para que React lo lea como texto plano
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
    
    // Variables de dirección
    address public owner; // El dueño del contrato
    address public registroCivilAddress; 
    address payable public cuentaBeneficiaria; 

    // Mappings
    mapping(uint256 => Donacion) private donaciones;
    mapping(string => uint256) private ci2Donacion;

    // MODIFIER: Solo el dueño puede ejecutar esto
    modifier onlyOwner() {
        require(msg.sender == owner, "No tienes permisos (Solo Admin)");
        _;
    }

    constructor(address _registroCivilAddress, address payable _cuentaBeneficiaria) {
        owner = msg.sender; // Tú eres el dueño al desplegar
        registroCivilAddress = _registroCivilAddress;
        cuentaBeneficiaria = _cuentaBeneficiaria;
    }

    // --- FUNCIONES ADMINISTRATIVAS PROTEGIDAS ---
    
    function setRegistroCivilAddress(address _address) public onlyOwner {
        registroCivilAddress = _address;
    }

    function cambiarCuentaBeneficiaria(address payable _nuevaCuenta) public onlyOwner {
        require(_nuevaCuenta != address(0), "Direccion invalida");
        cuentaBeneficiaria = _nuevaCuenta;
    }

    // --- LÓGICA PRINCIPAL ---

    function RegistrarDonantes(string calldata _cedula, uint256 _montoDonacion) public payable {
        
        // 1. CHECKS
        require(registroCivilAddress != address(0), "Contrato Registro Civil no conectado");
        require(_montoDonacion > 0, "La donacion debe ser mayor a 0");
        
        // Validación estricta del dinero enviado
        require(msg.value == _montoDonacion, "El monto enviado no coincide con el valor en ETH");

        // Verificamos existencia en el otro contrato
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        uint256 idPersonaEnRegistro = registroCivil.obtenerIdPorCi(_cedula);
        require(idPersonaEnRegistro != 0, "La cedula no existe en el Registro Civil");

        // Obtenemos nombres para el evento
        (string memory nombre, string memory apellido) = registroCivil.obtenerNombresApellidos(_cedula);

        // 2. EFFECTS
        uint256 id = nextId;
        ci2Donacion[_cedula] = id; // Actualizamos a la última donación

        donaciones[id] = Donacion({
            Cedula: _cedula,
            Monto: _montoDonacion,
            Fecha: block.timestamp
        });

        totalRecaudado += _montoDonacion; 
        nextId++;

        // 3. INTERACTIONS (Enviar dinero a la fundación)
        (bool success, ) = cuentaBeneficiaria.call{value: msg.value}("");
        require(success, "Fallo el envio de ETH a la fundacion");

        // 4. EMITIR EVENTO (Con Wallet y Fecha)
        emit NuevaDonacion(msg.sender, _cedula, nombre, apellido, _montoDonacion, block.timestamp);
    }

    function obtenerPersonaPorCI(string memory _cedula) public view returns (string memory Nombres, string memory Apellidos, uint256 Monto_Donacion) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, "No se encontro ninguna donacion para esta cedula");
        
        Donacion memory d = donaciones[id];
        IPersonas registroCivil = IPersonas(registroCivilAddress);
        (string memory nom, string memory ape) = registroCivil.obtenerNombresApellidos(_cedula);
        
        return (nom, ape, d.Monto);
    }
}