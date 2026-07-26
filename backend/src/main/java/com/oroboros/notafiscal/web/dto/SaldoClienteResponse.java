package com.oroboros.notafiscal.web.dto;

import java.math.BigDecimal;

public record SaldoClienteResponse(
        Long clienteId,
        String nomeCliente,
        BigDecimal totalServicos,
        BigDecimal totalNotas,
        BigDecimal saldo
) {}
