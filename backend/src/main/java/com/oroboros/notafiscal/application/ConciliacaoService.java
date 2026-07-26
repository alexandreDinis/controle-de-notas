package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.domain.conciliacao.*;
import com.oroboros.notafiscal.infrastructure.persistence.entity.*;
import com.oroboros.notafiscal.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável por executar a conciliação FIFO de um cliente.
 * <p>
 * Gatilho síncrono: chamado ao cadastrar, editar ou excluir um Servico ou NotaFiscal.
 * Apaga vínculos antigos e regrava os novos numa única transação.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConciliacaoService {

    private final ServicoRepository servicoRepository;
    private final NotaFiscalRepository notaFiscalRepository;
    private final VinculoServicoNotaRepository vinculoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public void reconciliarCliente(Long clienteId) {
        log.debug("Iniciando reconciliação do cliente {}", clienteId);

        ClienteEntity cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado: " + clienteId));

        // Buscar todos os serviços e notas do cliente, já ordenados
        List<ServicoParaConciliacao> servicos = servicoRepository
                .findByClienteIdOrderByDataAscIdAsc(clienteId)
                .stream()
                .map(s -> new ServicoParaConciliacao(s.getId(), s.getValor(), s.getData()))
                .toList();

        List<NotaParaConciliacao> notas = notaFiscalRepository
                .findByClienteIdOrderByDataEmissaoAscIdAsc(clienteId)
                .stream()
                .map(n -> new NotaParaConciliacao(n.getId(), n.getValor(), n.getDataEmissao()))
                .toList();

        // Executar motor FIFO
        ResultadoConciliacao resultado = MotorConciliacaoFifo.conciliar(servicos, notas);

        // Apagar vínculos antigos
        vinculoRepository.deleteByClienteId(clienteId);

        // Gravar novos vínculos
        List<VinculoServicoNotaEntity> novosVinculos = resultado.vinculos().stream()
                .map(v -> VinculoServicoNotaEntity.builder()
                        .servico(ServicoEntity.builder().id(v.servicoId()).build())
                        .notaFiscal(NotaFiscalEntity.builder().id(v.notaFiscalId()).build())
                        .cliente(cliente)
                        .valorVinculado(v.valorVinculado())
                        .build())
                .toList();

        vinculoRepository.saveAll(novosVinculos);

        log.debug("Reconciliação do cliente {} finalizada: {} vínculos, saldo {}",
                clienteId, resultado.vinculos().size(), resultado.saldoCliente());
    }
}
