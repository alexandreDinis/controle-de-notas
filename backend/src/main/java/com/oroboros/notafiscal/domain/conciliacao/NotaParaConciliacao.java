package com.oroboros.notafiscal.domain.conciliacao;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Representação de uma nota fiscal para fins de conciliação.
 * <p>
 * Java puro — sem dependência de Spring ou JPA.
 *
 * @param id    identificador da nota fiscal
 * @param valor valor da nota fiscal (sempre positivo)
 * @param data  data de emissão da nota fiscal
 */
public record NotaParaConciliacao(long id, BigDecimal valor, LocalDate data) {
}
