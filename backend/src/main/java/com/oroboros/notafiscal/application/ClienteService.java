package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.infrastructure.persistence.entity.ClienteEntity;
import com.oroboros.notafiscal.infrastructure.persistence.repository.ClienteRepository;
import com.oroboros.notafiscal.web.dto.ClienteRequest;
import com.oroboros.notafiscal.web.dto.ClienteResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        if (request.documento() != null && !request.documento().isBlank()) {
            if (clienteRepository.existsByDocumento(request.documento())) {
                throw new IllegalArgumentException(
                        "Já existe um cliente com o documento: " + request.documento());
            }
        }

        ClienteEntity entity = ClienteEntity.builder()
                .nome(request.nome())
                .telefone(request.telefone())
                .email(request.email())
                .documento(request.documento())
                .build();

        return toResponse(clienteRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorId(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        ClienteEntity entity = findOrThrow(id);

        if (request.documento() != null && !request.documento().isBlank()
                && !request.documento().equals(entity.getDocumento())) {
            if (clienteRepository.existsByDocumento(request.documento())) {
                throw new IllegalArgumentException(
                        "Já existe um cliente com o documento: " + request.documento());
            }
        }

        entity.setNome(request.nome());
        entity.setTelefone(request.telefone());
        entity.setEmail(request.email());
        entity.setDocumento(request.documento());

        return toResponse(clienteRepository.save(entity));
    }

    @Transactional
    public void excluir(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new EntityNotFoundException("Cliente não encontrado: " + id);
        }
        clienteRepository.deleteById(id);
    }

    private ClienteEntity findOrThrow(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado: " + id));
    }

    private ClienteResponse toResponse(ClienteEntity entity) {
        return new ClienteResponse(
                entity.getId(),
                entity.getNome(),
                entity.getTelefone(),
                entity.getEmail(),
                entity.getDocumento(),
                entity.getCriadoEm(),
                entity.getAtualizadoEm()
        );
    }
}
