package com.oroboros.notafiscal.web.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record NotaFiscalRequest(
        @NotBlank(message = "Número da nota é obrigatório")
        @Size(max = 50, message = "Número da nota deve ter no máximo 50 caracteres")
        String numeroNota,

        @NotNull(message = "Data de emissão é obrigatória")
        LocalDate dataEmissao,

        @NotNull(message = "Prazo de pagamento é obrigatório")
        LocalDate prazoPagamento,

        @NotNull(message = "Valor é obrigatório")
        @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
        BigDecimal valor
) {}
