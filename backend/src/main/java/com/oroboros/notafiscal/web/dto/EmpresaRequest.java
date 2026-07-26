package com.oroboros.notafiscal.web.dto;

import jakarta.validation.constraints.Size;

public record EmpresaRequest(
        @Size(max = 150, message = "Nome da empresa deve ter no máximo 150 caracteres")
        String nome,

        @Size(max = 20, message = "Documento deve ter no máximo 20 caracteres")
        String documento,

        @Size(max = 100, message = "Chave PIX deve ter no máximo 100 caracteres")
        String chavePix,

        @Size(max = 50, message = "Banco deve ter no máximo 50 caracteres")
        String banco,

        @Size(max = 20, message = "Agência deve ter no máximo 20 caracteres")
        String agencia,

        @Size(max = 30, message = "Conta deve ter no máximo 30 caracteres")
        String conta
) {}
