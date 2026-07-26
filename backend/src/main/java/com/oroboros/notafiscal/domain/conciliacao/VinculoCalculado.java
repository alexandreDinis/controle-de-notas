package com.oroboros.notafiscal.domain.conciliacao;

import java.math.BigDecimal;

/**
 * Representa um vínculo calculado entre um serviço e uma nota fiscal.
 * <p>
 * Gerado automaticamente pelo {@link MotorConciliacaoFifo} — nunca editável manualmente.
 *
 * @param servicoId      identificador do serviço vinculado
 * @param notaFiscalId   identificador da nota fiscal vinculada
 * @param valorVinculado parcela do valor que foi conciliada entre serviço e nota
 */
public record VinculoCalculado(long servicoId, long notaFiscalId, BigDecimal valorVinculado) {
}
