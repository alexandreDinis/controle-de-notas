package com.oroboros.notafiscal.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * @param statusPagamento status calculado: "PAGA", "NAO_PAGA" ou "VENCIDA"
 *                        (VENCIDA é calculado em tempo de leitura, não persistido)
 */
public record NotaFiscalResponse(
        Long id,
        Long clienteId,
        String numeroNota,
        LocalDate dataEmissao,
        LocalDate prazoPagamento,
        BigDecimal valor,
        String statusPagamento,
        boolean possuiAnexo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
