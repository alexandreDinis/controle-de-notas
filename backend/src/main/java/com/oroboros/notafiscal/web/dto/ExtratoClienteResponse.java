package com.oroboros.notafiscal.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ExtratoClienteResponse(
        Long clienteId,
        List<ItemExtrato> itens,
        BigDecimal totalServicos,
        BigDecimal totalNotas,
        BigDecimal saldoAtual
) {
    public record ItemExtrato(
            String tipo,
            Long id,
            String numeroOs,
            String numeroNota,
            LocalDate data,
            String descricao,
            BigDecimal valorServico,
            BigDecimal valorNota,
            String statusPagamento,
            LocalDate prazoPagamento
    ) {}
}
