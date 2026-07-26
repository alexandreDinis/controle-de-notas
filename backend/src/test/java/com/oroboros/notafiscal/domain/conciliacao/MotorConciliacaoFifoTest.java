package com.oroboros.notafiscal.domain.conciliacao;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários do motor de conciliação FIFO.
 * Java puro — sem contexto Spring.
 */
class MotorConciliacaoFifoTest {

    private static final LocalDate D1 = LocalDate.of(2025, 1, 10);
    private static final LocalDate D2 = LocalDate.of(2025, 2, 15);
    private static final LocalDate D3 = LocalDate.of(2025, 3, 20);
    private static final LocalDate D4 = LocalDate.of(2025, 4, 25);

    private static BigDecimal bd(String v) { return new BigDecimal(v); }

    @Test
    @DisplayName("Match exato: serviço R$500, nota R$500")
    void matchExato() {
        var servicos = List.of(new ServicoParaConciliacao(1, bd("500"), D1));
        var notas = List.of(new NotaParaConciliacao(10, bd("500"), D1));

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        assertEquals(1, r.vinculos().size());
        assertEquals(bd("500"), r.vinculos().get(0).valorVinculado());
        assertEquals(0, r.saldoCliente().compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Débito: serviço R$500, nota R$300 → débito R$200")
    void servicoMaiorQueNota() {
        var servicos = List.of(new ServicoParaConciliacao(1, bd("500"), D1));
        var notas = List.of(new NotaParaConciliacao(10, bd("300"), D1));

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        assertEquals(1, r.vinculos().size());
        assertEquals(bd("300"), r.vinculos().get(0).valorVinculado());
        assertEquals(0, r.saldoCliente().compareTo(bd("-200")));
    }

    @Test
    @DisplayName("Crédito: serviço R$300, nota R$500 → crédito R$200")
    void notaMaiorQueServico() {
        var servicos = List.of(new ServicoParaConciliacao(1, bd("300"), D1));
        var notas = List.of(new NotaParaConciliacao(10, bd("500"), D1));

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        assertEquals(1, r.vinculos().size());
        assertEquals(bd("300"), r.vinculos().get(0).valorVinculado());
        assertEquals(0, r.saldoCliente().compareTo(bd("200")));
    }

    @Test
    @DisplayName("Crédito consumido por serviço futuro")
    void creditoConsumidoPorServicoFuturo() {
        var servicos = List.of(
                new ServicoParaConciliacao(1, bd("200"), D1),
                new ServicoParaConciliacao(2, bd("300"), D2)
        );
        var notas = List.of(new NotaParaConciliacao(10, bd("500"), D1));

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        assertEquals(2, r.vinculos().size());
        assertEquals(1, r.vinculos().get(0).servicoId());
        assertEquals(bd("200"), r.vinculos().get(0).valorVinculado());
        assertEquals(2, r.vinculos().get(1).servicoId());
        assertEquals(bd("300"), r.vinculos().get(1).valorVinculado());
        assertEquals(0, r.saldoCliente().compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Múltiplos serviços e notas intercalados no tempo")
    void multiplosIntercalados() {
        var servicos = List.of(
                new ServicoParaConciliacao(1, bd("400"), D1),
                new ServicoParaConciliacao(2, bd("300"), D3)
        );
        var notas = List.of(
                new NotaParaConciliacao(10, bd("250"), D2),
                new NotaParaConciliacao(11, bd("350"), D4)
        );

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        // Svc1(400) vs Nota10(250): vincula 250, svc1 resta 150
        // Svc1(150) vs Nota11(350): vincula 150, nota11 resta 200
        // Svc2(300) vs Nota11(200): vincula 200, svc2 resta 100
        assertEquals(3, r.vinculos().size());
        assertEquals(bd("250"), r.vinculos().get(0).valorVinculado());
        assertEquals(bd("150"), r.vinculos().get(1).valorVinculado());
        assertEquals(bd("200"), r.vinculos().get(2).valorVinculado());
        // Total: 700 serviços, 600 notas → débito 100
        assertEquals(0, r.saldoCliente().compareTo(bd("-100")));
    }

    @Test
    @DisplayName("Lista vazia de notas → tudo débito")
    void semNotas() {
        var servicos = List.of(
                new ServicoParaConciliacao(1, bd("500"), D1),
                new ServicoParaConciliacao(2, bd("300"), D2)
        );

        var r = MotorConciliacaoFifo.conciliar(servicos, List.of());

        assertTrue(r.vinculos().isEmpty());
        assertEquals(0, r.saldoCliente().compareTo(bd("-800")));
    }

    @Test
    @DisplayName("Lista vazia de serviços → tudo crédito")
    void semServicos() {
        var notas = List.of(
                new NotaParaConciliacao(10, bd("400"), D1),
                new NotaParaConciliacao(11, bd("200"), D2)
        );

        var r = MotorConciliacaoFifo.conciliar(List.of(), notas);

        assertTrue(r.vinculos().isEmpty());
        assertEquals(0, r.saldoCliente().compareTo(bd("600")));
    }

    @Test
    @DisplayName("Nota cobrindo múltiplos serviços")
    void notaCobindoMultiplosServicos() {
        var servicos = List.of(
                new ServicoParaConciliacao(1, bd("100"), D1),
                new ServicoParaConciliacao(2, bd("150"), D2),
                new ServicoParaConciliacao(3, bd("250"), D3)
        );
        var notas = List.of(new NotaParaConciliacao(10, bd("500"), D1));

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        assertEquals(3, r.vinculos().size());
        assertEquals(bd("100"), r.vinculos().get(0).valorVinculado());
        assertEquals(bd("150"), r.vinculos().get(1).valorVinculado());
        assertEquals(bd("250"), r.vinculos().get(2).valorVinculado());
        assertEquals(0, r.saldoCliente().compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Serviço coberto por múltiplas notas")
    void servicoCobertoPorMultiplasNotas() {
        var servicos = List.of(new ServicoParaConciliacao(1, bd("500"), D1));
        var notas = List.of(
                new NotaParaConciliacao(10, bd("200"), D1),
                new NotaParaConciliacao(11, bd("150"), D2),
                new NotaParaConciliacao(12, bd("150"), D3)
        );

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        assertEquals(3, r.vinculos().size());
        assertEquals(bd("200"), r.vinculos().get(0).valorVinculado());
        assertEquals(bd("150"), r.vinculos().get(1).valorVinculado());
        assertEquals(bd("150"), r.vinculos().get(2).valorVinculado());
        assertEquals(0, r.saldoCliente().compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Desempate por id quando mesma data")
    void desempatePorIdQuandoMesmaData() {
        // Dois serviços na mesma data, id menor deve ser processado primeiro
        var servicos = List.of(
                new ServicoParaConciliacao(5, bd("300"), D1),
                new ServicoParaConciliacao(2, bd("200"), D1)
        );
        // Duas notas na mesma data, id menor deve ser processado primeiro
        var notas = List.of(
                new NotaParaConciliacao(20, bd("250"), D1),
                new NotaParaConciliacao(10, bd("100"), D1)
        );

        var r = MotorConciliacaoFifo.conciliar(servicos, notas);

        // Ordem esperada: svc2(200) antes de svc5(300), nota10(100) antes de nota20(250)
        // Svc2(200) vs Nota10(100): vincula 100, svc2 resta 100
        // Svc2(100) vs Nota20(250): vincula 100, nota20 resta 150
        // Svc5(300) vs Nota20(150): vincula 150, svc5 resta 150
        assertEquals(3, r.vinculos().size());

        assertEquals(2, r.vinculos().get(0).servicoId());
        assertEquals(10, r.vinculos().get(0).notaFiscalId());
        assertEquals(bd("100"), r.vinculos().get(0).valorVinculado());

        assertEquals(2, r.vinculos().get(1).servicoId());
        assertEquals(20, r.vinculos().get(1).notaFiscalId());
        assertEquals(bd("100"), r.vinculos().get(1).valorVinculado());

        assertEquals(5, r.vinculos().get(2).servicoId());
        assertEquals(20, r.vinculos().get(2).notaFiscalId());
        assertEquals(bd("150"), r.vinculos().get(2).valorVinculado());

        // 500 serviços, 350 notas → débito 150
        assertEquals(0, r.saldoCliente().compareTo(bd("-150")));
    }

    @Test
    @DisplayName("Listas null devem lançar IllegalArgumentException")
    void listasNull() {
        assertThrows(IllegalArgumentException.class,
                () -> MotorConciliacaoFifo.conciliar(null, List.of()));
        assertThrows(IllegalArgumentException.class,
                () -> MotorConciliacaoFifo.conciliar(List.of(), null));
    }

    @Test
    @DisplayName("Ambas as listas vazias → sem vínculos, saldo zero")
    void ambasVazias() {
        var r = MotorConciliacaoFifo.conciliar(List.of(), List.of());
        assertTrue(r.vinculos().isEmpty());
        assertEquals(0, r.saldoCliente().compareTo(BigDecimal.ZERO));
    }
}
