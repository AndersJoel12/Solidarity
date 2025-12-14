// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Donaciones
 * @dev Contrato de trazabilidad de donaciones para caridad
 * @author Anderson Abreu, Ezequiel Gomez, Yormairi Hernandez
 * @notice Este contrato permite hacer un seguimiento a los donantes de Solidarity
 */

contract Donaciones {

    struct Donacion {
        string Nombres;
        string Apellidos;
        string Correo;
        string Cedula;
        string Direccion_Billetera;
        string Monto_Donacion;
    }

    uint256 private nextId = 1;

    mapping(uint256 => Donacion) private donaciones;

    mapping(string => uint256) private ci2Donacion;

    function RegistrarDonantes(
        
        string memory _cedula,
        string memory _nombres,
        string memory _apellidos,
        string memory _correo,
        string memory _direccionBilletera,
        string memory _montoDonacion

    ) public {
        require(ci2Donacion[_cedula] == 0, "Cedula ya registrada" );
        uint256 id = nextId++;
        ci2Donacion[_cedula] = id;
        donaciones[id] = Donacion({
            Cedula: _cedula,
            Nombres: _nombres,
            Apellidos: _apellidos,
            Correo: _correo,
            Direccion_Billetera: _direccionBilletera,
            Monto_Donacion: _montoDonacion
        });
    }

        function obtenerIdPorCi(string memory _ci) public view returns (uint256) {
        require(ci2Donacion[_ci] != 0, "CI no registrada");
        return ci2Donacion[_ci];
    }

    function obtenerPersonaPorCI(string memory _cedula) public view returns (Donacion memory) {
        for (uint256 i = 0; i < nextId; i++) {
            if (keccak256(bytes(donaciones[i].Cedula)) == keccak256(bytes(_cedula))) {
                return donaciones[i];
            }
        }
        revert(unicode"Persona con esa cédula no encontrada");
    }

        function obtenerDatosPersona(uint256 _id) public view returns (Donacion memory) {
        require(_id < nextId && bytes(donaciones[_id].Cedula).length > 0, "Persona no registrada");
        return donaciones[_id];
    }


}