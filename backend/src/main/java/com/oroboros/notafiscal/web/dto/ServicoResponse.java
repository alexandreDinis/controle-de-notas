package com.oroboros.notafiscal.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ServicoResponse(
        Long id,
        Long clienteId,
        String numeroOs,
        LocalDate data,
        String descricao,
        BigDecimal valor,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
