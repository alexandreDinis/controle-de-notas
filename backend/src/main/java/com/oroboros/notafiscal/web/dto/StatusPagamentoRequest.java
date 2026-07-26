package com.oroboros.notafiscal.web.dto;

import com.oroboros.notafiscal.domain.notafiscal.StatusPagamento;
import jakarta.validation.constraints.NotNull;

public record StatusPagamentoRequest(
        @NotNull(message = "Status de pagamento é obrigatório")
        StatusPagamento statusPagamento
) {}
