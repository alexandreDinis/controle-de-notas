package com.oroboros.notafiscal.web.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ServicoRequest(
        @NotBlank(message = "Número da OS é obrigatório")
        @Size(max = 50, message = "Número da OS deve ter no máximo 50 caracteres")
        String numeroOs,

        @NotNull(message = "Data é obrigatória")
        LocalDate data,

        @NotBlank(message = "Descrição é obrigatória")
        String descricao,

        @NotNull(message = "Valor é obrigatório")
        @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
        BigDecimal valor
) {}
