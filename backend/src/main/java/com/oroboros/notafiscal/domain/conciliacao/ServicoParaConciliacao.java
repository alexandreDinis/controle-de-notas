package com.oroboros.notafiscal.domain.conciliacao;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Representação de um serviço prestado para fins de conciliação.
 * <p>
 * Java puro — sem dependência de Spring ou JPA.
 *
 * @param id    identificador do serviço
 * @param valor valor do serviço (sempre positivo)
 * @param data  data em que o serviço foi prestado
 */
public record ServicoParaConciliacao(long id, BigDecimal valor, LocalDate data) {
}
