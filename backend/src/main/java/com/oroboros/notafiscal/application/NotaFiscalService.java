package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.domain.notafiscal.StatusPagamento;
import com.oroboros.notafiscal.infrastructure.persistence.entity.ClienteEntity;
import com.oroboros.notafiscal.infrastructure.persistence.entity.NotaFiscalAnexoEntity;
import com.oroboros.notafiscal.infrastructure.persistence.entity.NotaFiscalEntity;
import com.oroboros.notafiscal.infrastructure.persistence.repository.ClienteRepository;
import com.oroboros.notafiscal.infrastructure.persistence.repository.NotaFiscalAnexoRepository;
import com.oroboros.notafiscal.infrastructure.persistence.repository.NotaFiscalRepository;
import com.oroboros.notafiscal.web.dto.NotaFiscalRequest;
import com.oroboros.notafiscal.web.dto.NotaFiscalResponse;
import com.oroboros.notafiscal.web.dto.StatusPagamentoRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;
    private final NotaFiscalAnexoRepository anexoRepository;
    private final ClienteRepository clienteRepository;
    private final ConciliacaoService conciliacaoService;

    @Transactional
    public NotaFiscalResponse criar(Long clienteId, NotaFiscalRequest request) {
        ClienteEntity cliente = findClienteOrThrow(clienteId);

        if (notaFiscalRepository.existsByClienteIdAndNumeroNota(clienteId, request.numeroNota())) {
            throw new IllegalArgumentException(
                    "Já existe uma nota fiscal com número '" + request.numeroNota()
                            + "' para este cliente");
        }

        NotaFiscalEntity entity = NotaFiscalEntity.builder()
                .cliente(cliente)
                .numeroNota(request.numeroNota())
                .dataEmissao(request.dataEmissao())
                .prazoPagamento(request.prazoPagamento())
                .valor(request.valor())
                .statusPagamento(StatusPagamento.NAO_PAGA)
                .build();

        NotaFiscalResponse response = toResponse(notaFiscalRepository.save(entity));
        conciliacaoService.reconciliarCliente(clienteId);
        return response;
    }

    @Transactional(readOnly = true)
    public List<NotaFiscalResponse> listarPorCliente(Long clienteId) {
        findClienteOrThrow(clienteId);
        return notaFiscalRepository.findByClienteIdOrderByDataEmissaoDesc(clienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotaFiscalResponse buscarPorId(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public NotaFiscalResponse atualizar(Long id, NotaFiscalRequest request) {
        NotaFiscalEntity entity = findOrThrow(id);
        Long clienteId = entity.getCliente().getId();

        // Checar unicidade se número mudou
        if (!entity.getNumeroNota().equals(request.numeroNota())
                && notaFiscalRepository.existsByClienteIdAndNumeroNota(clienteId, request.numeroNota())) {
            throw new IllegalArgumentException(
                    "Já existe uma nota fiscal com número '" + request.numeroNota()
                            + "' para este cliente");
        }

        entity.setNumeroNota(request.numeroNota());
        entity.setDataEmissao(request.dataEmissao());
        entity.setPrazoPagamento(request.prazoPagamento());
        entity.setValor(request.valor());

        NotaFiscalResponse response = toResponse(notaFiscalRepository.save(entity));
        conciliacaoService.reconciliarCliente(clienteId);
        return response;
    }

    @Transactional
    public void excluir(Long id) {
        NotaFiscalEntity entity = findOrThrow(id);
        Long clienteId = entity.getCliente().getId();
        notaFiscalRepository.delete(entity);
        conciliacaoService.reconciliarCliente(clienteId);
    }

    @Transactional
    public NotaFiscalResponse alterarStatusPagamento(Long id, StatusPagamentoRequest request) {
        NotaFiscalEntity entity = findOrThrow(id);
        entity.setStatusPagamento(request.statusPagamento());
        return toResponse(notaFiscalRepository.save(entity));
    }

    @Transactional
    public void uploadAnexo(Long notaFiscalId, MultipartFile arquivo) throws IOException {
        NotaFiscalEntity nota = findOrThrow(notaFiscalId);

        // Remove anexo existente se houver
        anexoRepository.findByNotaFiscalId(notaFiscalId)
                .ifPresent(anexoRepository::delete);

        NotaFiscalAnexoEntity anexo = NotaFiscalAnexoEntity.builder()
                .notaFiscal(nota)
                .nomeArquivo(arquivo.getOriginalFilename())
                .tipoConteudo(arquivo.getContentType())
                .dados(arquivo.getBytes())
                .build();

        anexoRepository.save(anexo);
    }

    @Transactional(readOnly = true)
    public NotaFiscalAnexoEntity downloadAnexo(Long notaFiscalId) {
        return anexoRepository.findByNotaFiscalId(notaFiscalId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Anexo não encontrado para a nota fiscal: " + notaFiscalId));
    }

    @Transactional
    public void excluirAnexo(Long notaFiscalId) {
        if (!anexoRepository.existsByNotaFiscalId(notaFiscalId)) {
            throw new EntityNotFoundException(
                    "Anexo não encontrado para a nota fiscal: " + notaFiscalId);
        }
        anexoRepository.deleteByNotaFiscalId(notaFiscalId);
    }

    private ClienteEntity findClienteOrThrow(Long clienteId) {
        return clienteRepository.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado: " + clienteId));
    }

    private NotaFiscalEntity findOrThrow(Long id) {
        return notaFiscalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nota fiscal não encontrada: " + id));
    }

    /**
     * Converte entidade para response, calculando status VENCIDA em tempo de leitura.
     * Nota NAO_PAGA cujo prazo_pagamento já passou é exibida como "VENCIDA".
     */
    private NotaFiscalResponse toResponse(NotaFiscalEntity entity) {
        String statusExibicao = calcularStatusExibicao(entity);
        boolean possuiAnexo = anexoRepository.existsByNotaFiscalId(entity.getId());

        return new NotaFiscalResponse(
                entity.getId(),
                entity.getCliente().getId(),
                entity.getNumeroNota(),
                entity.getDataEmissao(),
                entity.getPrazoPagamento(),
                entity.getValor(),
                statusExibicao,
                possuiAnexo,
                entity.getCriadoEm(),
                entity.getAtualizadoEm()
        );
    }

    /**
     * Calcula o status de exibição:
     * - PAGA → "PAGA"
     * - NAO_PAGA e prazo já passou → "VENCIDA"
     * - NAO_PAGA e prazo não passou → "NAO_PAGA"
     */
    private String calcularStatusExibicao(NotaFiscalEntity entity) {
        if (entity.getStatusPagamento() == StatusPagamento.PAGA) {
            return "PAGA";
        }
        if (entity.getPrazoPagamento().isBefore(LocalDate.now())) {
            return "VENCIDA";
        }
        return "NAO_PAGA";
    }
}
