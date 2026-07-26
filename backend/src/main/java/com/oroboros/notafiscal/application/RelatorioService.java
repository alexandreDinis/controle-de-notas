package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.infrastructure.persistence.entity.NotaFiscalEntity;
import com.oroboros.notafiscal.infrastructure.persistence.entity.ServicoEntity;
import com.oroboros.notafiscal.infrastructure.persistence.repository.*;
import com.oroboros.notafiscal.web.dto.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;
    private final NotaFiscalRepository notaFiscalRepository;

    /**
     * Notas emitidas por cliente com filtro por período.
     */
    @Transactional(readOnly = true)
    public RelatorioNotasResponse notasPorClientePeriodo(Long clienteId, LocalDate inicio, LocalDate fim) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new EntityNotFoundException("Cliente não encontrado: " + clienteId);
        }

        List<NotaFiscalEntity> notas = notaFiscalRepository
                .findByClienteIdAndDataEmissaoBetweenOrderByDataEmissaoAsc(clienteId, inicio, fim);

        BigDecimal totalNotas = notas.stream()
                .map(NotaFiscalEntity::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<RelatorioNotasResponse.NotaResumo> resumos = notas.stream()
                .map(n -> new RelatorioNotasResponse.NotaResumo(
                        n.getId(), n.getNumeroNota(), n.getDataEmissao(),
                        n.getPrazoPagamento(), n.getValor(),
                        n.getStatusPagamento().name()))
                .toList();

        return new RelatorioNotasResponse(clienteId, inicio, fim, resumos, totalNotas);
    }

    /**
     * Extrato por cliente: linha do tempo de serviços e notas com saldo corrente.
     */
    @Transactional(readOnly = true)
    public ExtratoClienteResponse extratoPorCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new EntityNotFoundException("Cliente não encontrado: " + clienteId);
        }

        List<ServicoEntity> servicos = servicoRepository
                .findByClienteIdOrderByDataAscIdAsc(clienteId);
        List<NotaFiscalEntity> notas = notaFiscalRepository
                .findByClienteIdOrderByDataEmissaoAscIdAsc(clienteId);

        // Construir linha do tempo unificada
        List<ExtratoClienteResponse.ItemExtrato> itens = new ArrayList<>();

        for (ServicoEntity s : servicos) {
            itens.add(new ExtratoClienteResponse.ItemExtrato(
                    "SERVICO", s.getId(), s.getNumeroOs(), null, s.getData(), s.getDescricao(),
                    s.getValor(), null));
        }
        for (NotaFiscalEntity n : notas) {
            itens.add(new ExtratoClienteResponse.ItemExtrato(
                    "NOTA_FISCAL", n.getId(), null, n.getNumeroNota(), n.getDataEmissao(),
                    "NF " + n.getNumeroNota(), null, n.getValor()));
        }

        // Ordenar por data, desempatar por tipo (serviço primeiro), depois id
        itens.sort(Comparator.comparing(ExtratoClienteResponse.ItemExtrato::data)
                .thenComparing(i -> "SERVICO".equals(i.tipo()) ? 0 : 1)
                .thenComparing(ExtratoClienteResponse.ItemExtrato::id));

        // Calcular saldo corrente acumulado
        BigDecimal saldoCorrente = BigDecimal.ZERO;
        List<ExtratoClienteResponse.ItemExtrato> itensComSaldo = new ArrayList<>();

        for (ExtratoClienteResponse.ItemExtrato item : itens) {
            if ("SERVICO".equals(item.tipo())) {
                saldoCorrente = saldoCorrente.subtract(item.valorServico());
            } else {
                saldoCorrente = saldoCorrente.add(item.valorNota());
            }
            itensComSaldo.add(new ExtratoClienteResponse.ItemExtrato(
                    item.tipo(), item.id(), item.numeroOs(), item.numeroNota(), item.data(), item.descricao(),
                    item.valorServico(), item.valorNota()));
        }

        BigDecimal totalServicos = servicos.stream()
                .map(ServicoEntity::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNotas = notas.stream()
                .map(NotaFiscalEntity::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ExtratoClienteResponse(
                clienteId, itensComSaldo, totalServicos, totalNotas, saldoCorrente);
    }

    /**
     * Lista de clientes com débito atual (serviço prestado sem nota correspondente).
     */
    @Transactional(readOnly = true)
    public List<SaldoClienteResponse> clientesComDebito() {
        return calcularSaldosTodosClientes().stream()
                .filter(s -> s.saldo().compareTo(BigDecimal.ZERO) < 0)
                .toList();
    }

    /**
     * Lista de clientes com crédito atual (nota emitida sobrando).
     */
    @Transactional(readOnly = true)
    public List<SaldoClienteResponse> clientesComCredito() {
        return calcularSaldosTodosClientes().stream()
                .filter(s -> s.saldo().compareTo(BigDecimal.ZERO) > 0)
                .toList();
    }

    private List<SaldoClienteResponse> calcularSaldosTodosClientes() {
        return clienteRepository.findAll().stream()
                .map(cliente -> {
                    Long cid = cliente.getId();

                    BigDecimal totalServicos = servicoRepository
                            .findByClienteIdOrderByDataAscIdAsc(cid)
                            .stream()
                            .map(ServicoEntity::getValor)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalNotas = notaFiscalRepository
                            .findByClienteIdOrderByDataEmissaoAscIdAsc(cid)
                            .stream()
                            .map(NotaFiscalEntity::getValor)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal saldo = totalNotas.subtract(totalServicos);

                    return new SaldoClienteResponse(
                            cid, cliente.getNome(), totalServicos, totalNotas, saldo);
                })
                .filter(s -> s.saldo().compareTo(BigDecimal.ZERO) != 0)
                .toList();
    }
}
