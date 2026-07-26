package com.oroboros.notafiscal.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RelatorioNotasResponse(
        Long clienteId,
        LocalDate inicio,
        LocalDate fim,
        List<NotaResumo> notas,
        BigDecimal totalNotas
) {
    public record NotaResumo(
            Long id,
            String numeroNota,
            LocalDate dataEmissao,
            LocalDate prazoPagamento,
            BigDecimal valor,
            String statusPagamento
    ) {}
}
