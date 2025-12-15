// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Donaciones {

    struct Donacion {
        string Nombres;
        string Apellidos;
        string Cedula;
        uint256 Monto_Donacion; // CAMBIO: Ahora es un número entero positivo
    }

    uint256 private nextId = 1;
    
    // NUEVO: Variable para llevar la cuenta de toda la plata recaudada
    uint256 public totalRecaudado;

    mapping(uint256 => Donacion) private donaciones;
    mapping(string => uint256) private ci2Donacion;

    function RegistrarDonantes(
        string memory _cedula,
        string memory _nombres,
        string memory _apellidos,
        uint256 _montoDonacion // CAMBIO: Recibimos un número, no texto
    ) public {
        require(ci2Donacion[_cedula] == 0, "Cedula ya registrada");

        uint256 id = nextId;
        ci2Donacion[_cedula] = id;

        donaciones[id] = Donacion({
            Nombres: _nombres,
            Apellidos: _apellidos,
            Cedula: _cedula,
            Monto_Donacion: _montoDonacion
        });

        // NUEVO: Sumamos la donación al total acumulado de la caridad
        totalRecaudado += _montoDonacion; 

        nextId++;
    }

    // Buscamos rápido usando el mapping (sin gastar gas de más)
    function obtenerPersonaPorCI(string memory _cedula) public view returns (Donacion memory) {
        uint256 id = ci2Donacion[_cedula];
        require(id != 0, unicode"Persona con esa cédula no encontrada");
        return donaciones[id];
    }
    
    // Función para ver datos por ID si lo necesitas
    function obtenerDatosPersona(uint256 _id) public view returns (Donacion memory) {
        require(_id < nextId && _id > 0, "Persona no registrada");
        return donaciones[_id];
    }
}