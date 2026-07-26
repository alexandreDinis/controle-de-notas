package com.oroboros.notafiscal.domain.conciliacao;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Motor de conciliação FIFO entre serviços prestados e notas fiscais emitidas.
 * <p>
 * <b>Java puro</b> — sem dependência de Spring, JPA ou qualquer framework.
 * <p>
 * <b>Critério de ordenação:</b> data ASC, id ASC (desempate explícito por id quando datas iguais).
 */
public final class MotorConciliacaoFifo {

    private MotorConciliacaoFifo() {
    }

    public static ResultadoConciliacao conciliar(
            List<ServicoParaConciliacao> servicos,
            List<NotaParaConciliacao> notas) {

        if (servicos == null || notas == null) {
            throw new IllegalArgumentException("Listas não podem ser null");
        }

        List<ServicoParaConciliacao> svcOrd = servicos.stream()
                .sorted(Comparator.comparing(ServicoParaConciliacao::data)
                        .thenComparingLong(ServicoParaConciliacao::id))
                .toList();

        List<NotaParaConciliacao> ntOrd = notas.stream()
                .sorted(Comparator.comparing(NotaParaConciliacao::data)
                        .thenComparingLong(NotaParaConciliacao::id))
                .toList();

        List<VinculoCalculado> vinculos = new ArrayList<>();
        int iS = 0, iN = 0;
        BigDecimal sS = BigDecimal.ZERO, sN = BigDecimal.ZERO;

        if (!svcOrd.isEmpty()) sS = svcOrd.get(0).valor();
        if (!ntOrd.isEmpty()) sN = ntOrd.get(0).valor();

        while (iS < svcOrd.size() && iN < ntOrd.size()) {
            BigDecimal v = sS.min(sN);
            if (v.compareTo(BigDecimal.ZERO) > 0) {
                vinculos.add(new VinculoCalculado(svcOrd.get(iS).id(), ntOrd.get(iN).id(), v));
            }
            sS = sS.subtract(v);
            sN = sN.subtract(v);

            if (sS.compareTo(BigDecimal.ZERO) == 0) {
                iS++;
                if (iS < svcOrd.size()) sS = svcOrd.get(iS).valor();
            }
            if (sN.compareTo(BigDecimal.ZERO) == 0) {
                iN++;
                if (iN < ntOrd.size()) sN = ntOrd.get(iN).valor();
            }
        }

        BigDecimal totalSvc = servicos.stream().map(ServicoParaConciliacao::valor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNt = notas.stream().map(NotaParaConciliacao::valor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ResultadoConciliacao(vinculos, totalNt.subtract(totalSvc));
    }
}
