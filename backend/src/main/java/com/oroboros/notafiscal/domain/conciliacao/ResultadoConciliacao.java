package com.oroboros.notafiscal.domain.conciliacao;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resultado completo da conciliação FIFO de um cliente.
 *
 * @param vinculos      lista de vínculos calculados entre serviços e notas
 * @param saldoCliente  saldo final do cliente:
 *                      positivo = crédito (nota emitida sobrando, sem serviço correspondente),
 *                      negativo = débito (serviço prestado sem nota correspondente),
 *                      zero = totalmente conciliado
 */
public record ResultadoConciliacao(List<VinculoCalculado> vinculos, BigDecimal saldoCliente) {
}
