package com.oroboros.notafiscal.domain.notafiscal;

/**
 * Status de pagamento persistido no banco de dados.
 * <p>
 * Apenas {@code PAGA} e {@code NAO_PAGA} são armazenados.
 * O status "VENCIDA" é calculado em tempo de leitura (nota NAO_PAGA cujo
 * prazo_pagamento já passou) e retornado apenas na resposta da API,
 * sem persistência no banco.
 */
public enum StatusPagamento {
    PAGA,
    NAO_PAGA
}
