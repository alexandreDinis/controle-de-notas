package com.oroboros.notafiscal.web.dto;

import java.math.BigDecimal;

public record VinculoResponse(
        Long id,
        Long servicoId,
        String numeroOs,
        Long notaFiscalId,
        String numeroNota,
        Long clienteId,
        BigDecimal valorVinculado
) {}
