package com.oroboros.notafiscal.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
        String nome,

        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String telefone,

        @Size(max = 200, message = "E-mail deve ter no máximo 200 caracteres")
        String email,

        @Size(max = 20, message = "Documento deve ter no máximo 20 caracteres")
        String documento
) {}
