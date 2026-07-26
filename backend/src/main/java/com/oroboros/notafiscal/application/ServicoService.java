package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.infrastructure.persistence.entity.ClienteEntity;
import com.oroboros.notafiscal.infrastructure.persistence.entity.ServicoEntity;
import com.oroboros.notafiscal.infrastructure.persistence.repository.ClienteRepository;
import com.oroboros.notafiscal.infrastructure.persistence.repository.ServicoRepository;
import com.oroboros.notafiscal.web.dto.ServicoRequest;
import com.oroboros.notafiscal.web.dto.ServicoResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final ClienteRepository clienteRepository;
    private final ConciliacaoService conciliacaoService;

    @Transactional
    public ServicoResponse criar(Long clienteId, ServicoRequest request) {
        ClienteEntity cliente = findClienteOrThrow(clienteId);

        if (servicoRepository.existsByClienteIdAndNumeroOs(clienteId, request.numeroOs())) {
            throw new IllegalArgumentException("Já existe um serviço com a OS " + request.numeroOs() + " para este cliente");
        }

        ServicoEntity entity = ServicoEntity.builder()
                .cliente(cliente)
                .numeroOs(request.numeroOs())
                .data(request.data())
                .descricao(request.descricao())
                .valor(request.valor())
                .build();

        ServicoResponse response = toResponse(servicoRepository.save(entity));
        conciliacaoService.reconciliarCliente(clienteId);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ServicoResponse> listarPorCliente(Long clienteId) {
        findClienteOrThrow(clienteId);
        return servicoRepository.findByClienteIdOrderByDataDesc(clienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServicoResponse buscarPorId(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public ServicoResponse atualizar(Long id, ServicoRequest request) {
        ServicoEntity entity = findOrThrow(id);
        Long clienteId = entity.getCliente().getId();

        if (!entity.getNumeroOs().equals(request.numeroOs()) &&
                servicoRepository.existsByClienteIdAndNumeroOs(clienteId, request.numeroOs())) {
            throw new IllegalArgumentException("Já existe um serviço com a OS " + request.numeroOs() + " para este cliente");
        }

        entity.setNumeroOs(request.numeroOs());
        entity.setData(request.data());
        entity.setDescricao(request.descricao());
        entity.setValor(request.valor());

        ServicoResponse response = toResponse(servicoRepository.save(entity));
        conciliacaoService.reconciliarCliente(clienteId);
        return response;
    }

    @Transactional
    public void excluir(Long id) {
        ServicoEntity entity = findOrThrow(id);
        Long clienteId = entity.getCliente().getId();
        servicoRepository.delete(entity);
        conciliacaoService.reconciliarCliente(clienteId);
    }

    private ClienteEntity findClienteOrThrow(Long clienteId) {
        return clienteRepository.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado: " + clienteId));
    }

    private ServicoEntity findOrThrow(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado: " + id));
    }

    private ServicoResponse toResponse(ServicoEntity entity) {
        return new ServicoResponse(
                entity.getId(),
                entity.getCliente().getId(),
                entity.getNumeroOs(),
                entity.getData(),
                entity.getDescricao(),
                entity.getValor(),
                entity.getCriadoEm(),
                entity.getAtualizadoEm()
        );
    }
}
